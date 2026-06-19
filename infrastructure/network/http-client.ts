import axios, { type AxiosInstance, type AxiosRequestConfig, AxiosError, AxiosHeaders } from 'axios';
import { fail, ok, type Result } from '@core/result/result';
import {
  type Failure,
  NetworkFailure,
  TimeoutFailure,
  UnauthorizedFailure,
  UnknownFailure,
  ValidationFailure,
} from '@core/failure';
import { failureFromResponse } from '@infrastructure/network/failure-from-response';
import {
  API_AES_KEY_HEX,
  DEFAULT_REQUEST_TIMEOUT_MS,
  MULTIPART_UPLOAD_TIMEOUT_MS,
} from '@infrastructure/constants/api';
import {
  decryptEnvelope,
  encryptEnvelope,
  EnvelopeDecryptError,
  keyFromHex,
  type Envelope,
} from '@infrastructure/crypto/aes-envelope';

export interface HttpClientOptions {
  baseUrl: string;
  tokenProvider: () => Promise<string | null>;
  localeProvider?: () => string;
  timeoutMs?: number;
  // WHY: keeps logging opt-in — production builds flip this off to drop PII out of logcat/xcode.
  enableLogging?: boolean;
  /**
   * Invoked whenever the backend returns 401, so the app can clear the session
   * and route to login. Side-effect only — the request still resolves to an
   * UnauthorizedFailure.
   */
  onUnauthorized?: () => void;
}

interface RecipelyDataBody<T> {
  data: T;
}

/**
 * Progress callback shape for multipart uploads. Decoupled from axios so
 * callers don't need to import axios types just to receive byte counts.
 */
export interface UploadProgressEvent {
  loaded: number;
  total: number;
}

function isEnvelope(body: unknown): body is Envelope {
  return (
    typeof body === 'object' &&
    body !== null &&
    typeof (body as Envelope).payload === 'string' &&
    typeof (body as Envelope).iv === 'string'
  );
}

/**
 * Axios-backed HTTP client for the Recipely backend. Automatically attaches
 * the JWT bearer token and `Accept-Language` header on every request, encrypts
 * JSON request bodies and decrypts AES-GCM response envelopes, and maps
 * non-2xx responses and network errors to the domain `Failure` hierarchy.
 */
export class HttpClient {
  private readonly instance: AxiosInstance;
  private readonly aesKey: Uint8Array;

  constructor(private readonly options: HttpClientOptions) {
    this.aesKey = keyFromHex(API_AES_KEY_HEX);

    this.instance = axios.create({
      baseURL: options.baseUrl,
      timeout: options.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS,
      headers: {
        Accept: 'application/json',
        // Content-Type is set per-request in the interceptor so FormData uploads
        // can omit it and let the XHR runtime auto-set multipart + boundary.
      },
      validateStatus: () => true,
    });

    // Request interceptor: attach JWT, set Content-Type, and encrypt body.
    this.instance.interceptors.request.use(async (config) => {
      const token = await options.tokenProvider();
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      const locale = options.localeProvider ? options.localeProvider() : 'en';
      config.headers = config.headers ?? {};
      config.headers['Accept-Language'] = locale;

      // WHY: FormData uploads must NOT have an explicit Content-Type — the XHR
      // runtime sets it with the correct multipart boundary. If we leave
      // 'application/json' from the instance defaults the backend's decrypt-body
      // middleware sees the wrong content-type, its multipart guard misses, and
      // the request is rejected as a missing AES envelope (400).
      const isFormDataPayload =
        typeof FormData !== 'undefined' && config.data instanceof FormData;

      if (isFormDataPayload) {
        // WHY: AxiosHeaders uses internal storage — plain JS `delete` on the cast
        // Record does not call the class's delete() and leaves the header live.
        // Must use the class method so the XHR runtime can auto-set
        // Content-Type: multipart/form-data; boundary=... from the FormData.
        if (config.headers instanceof AxiosHeaders) {
          config.headers.delete('Content-Type');
        }
        // WHY: axios v1's default transformRequest detects FormData by
        // `Object.prototype.toString.call(data) === '[object FormData]'` and by
        // `instanceof FormData`. On React Native (Hermes) the polyfilled FormData
        // does not always pass these checks reliably, which makes axios fall
        // through to `JSON.stringify(data)` — the server then receives `"{}"`
        // instead of multipart. Setting transformRequest to identity bypasses
        // every default transformer and guarantees FormData is sent untouched.
        config.transformRequest = [(data) => data];
        // WHY: bump timeout to the upload budget — multipart uploads over
        // cellular routinely take longer than the 10s JSON default, which
        // surfaces as `ECONNABORTED` → "Network error" in the UI.
        config.timeout = MULTIPART_UPLOAD_TIMEOUT_MS;
        return config;
      }

      config.headers['Content-Type'] = 'application/json';

      // Encrypt body for POST/PUT/PATCH. For requests with no data (like POST /favorite),
      // send an empty encrypted envelope so the backend's decryptBody middleware doesn't reject it.
      const methodsWithBody = ['POST', 'PUT', 'PATCH'];
      if (methodsWithBody.includes(config.method?.toUpperCase() ?? '')) {
        const bodyData = config.data ?? {};
        // WHY: backend's decryptBody middleware expects plaintext to be
        // `{ data: <T> }` (mirroring the response side). Wrap before encrypt
        // so the contract is symmetric.
        config.data = encryptEnvelope({ data: bodyData }, this.aesKey);
      }
      if (options.enableLogging) {
         
        console.log(`[HTTP →] ${config.method?.toUpperCase()} ${config.baseURL ?? ''}${config.url ?? ''}`);
      }
      return config;
    });

    // Response interceptor: decrypt envelopes back into plain JSON.
    this.instance.interceptors.response.use(
      (response) => {
        if (isEnvelope(response.data)) {
          try {
            response.data = decryptEnvelope(response.data, this.aesKey);
          } catch (err) {
            if (options.enableLogging) {
               
              console.log(`[HTTP ←] decrypt failed: ${(err as Error).message}`);
            }
          }
        }
        if (options.enableLogging) {
           
          console.log(`[HTTP ←] ${response.status} ${response.config.url ?? ''}`);
        }
        return response;
      },
      (error: unknown) => Promise.reject(error),
    );
  }

  async request<T>(config: AxiosRequestConfig): Promise<Result<T, Failure>> {
    try {
      const response = await this.instance.request<unknown>(config);
      if (response.status >= 200 && response.status < 300) {
        const dataEnvelope = response.data;
        if (isRecipelyDataBody<T>(dataEnvelope)) {
          return ok(dataEnvelope.data);
        }
        // Backwards compat / non-/api/v1 responses (eg /health) come through unchanged.
        return ok(dataEnvelope as T);
      }
      return this.failWithUnauthorizedHook(failureFromResponse(response.status, response.data));
    } catch (error: unknown) {
      return this.failWithUnauthorizedHook(mapAxiosError(error));
    }
  }

  /**
   * Wraps a mapped failure in `fail()` and fires the `onUnauthorized` hook when
   * the failure is an `UnauthorizedFailure`. Detecting via the mapped failure
   * (rather than the raw status) covers both the `validateStatus` path and the
   * thrown-AxiosError path uniformly. The returned value is unchanged.
   */
  private failWithUnauthorizedHook<T>(failure: Failure): Result<T, Failure> {
    if (failure instanceof UnauthorizedFailure) {
      this.options.onUnauthorized?.();
    }
    return fail(failure);
  }

  /**
   * Uploads a `FormData` payload via raw `XMLHttpRequest`, bypassing axios
   * entirely. axios v1's XHR adapter is unreliable for RN multipart on Android:
   * its FormData detection (`Object.prototype.toString.call`) misses RN's
   * polyfilled FormData and the request body is JSON-stringified to `"{}"`,
   * which surfaces to the user as "Network error". XHR is what every reliable
   * RN upload library uses under the hood.
   *
   * `url` may be relative (resolved against `baseUrl`) or absolute (used as-is,
   * needed for endpoints mounted outside `/api/v1` like `/upload`).
   */
  async uploadMultipart<T>(
    url: string,
    formData: FormData,
    onProgress?: (event: UploadProgressEvent) => void,
  ): Promise<Result<T, Failure>> {
    const fullUrl = /^https?:\/\//i.test(url)
      ? url
      : `${this.options.baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
    const token = await this.options.tokenProvider();
    const locale = this.options.localeProvider ? this.options.localeProvider() : 'en';
    const enableLogging = this.options.enableLogging === true;
    const aesKey = this.aesKey;

    return new Promise<Result<T, Failure>>((resolve) => {
      if (enableLogging) {

        console.log(`[HTTP → multipart] POST ${fullUrl}`);
      }
      const xhr = new XMLHttpRequest();
      xhr.open('POST', fullUrl, true);
      xhr.timeout = MULTIPART_UPLOAD_TIMEOUT_MS;
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('Accept-Language', locale);
      if (token !== null) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      // WHY: deliberately NOT setting Content-Type — the XHR runtime sets it
      // to `multipart/form-data; boundary=...` from the FormData object. Any
      // explicit value breaks the boundary contract and the backend's
      // multer/decryptBody middleware rejects the request.

      if (onProgress !== undefined && xhr.upload) {
        xhr.upload.onprogress = (ev: ProgressEvent): void => {
          onProgress({ loaded: ev.loaded, total: ev.total });
        };
      }

      xhr.onload = (): void => {
        const status = xhr.status;
        const responseText = xhr.responseText;
        if (enableLogging) {

          console.log(`[HTTP ← multipart] ${status} ${fullUrl}`);
        }
        let body: unknown;
        try {
          body = JSON.parse(responseText);
        } catch {
          body = responseText;
        }
        if (isEnvelope(body)) {
          try {
            body = decryptEnvelope(body, aesKey);
          } catch (err) {
            if (enableLogging) {

              console.log(`[HTTP ← multipart] decrypt failed: ${(err as Error).message}`);
            }
          }
        }
        if (status >= 200 && status < 300) {
          if (isRecipelyDataBody<T>(body)) {
            resolve(ok(body.data));
            return;
          }
          resolve(ok(body as T));
          return;
        }
        if (status === 401) {
          this.options.onUnauthorized?.();
        }
        resolve(fail(failureFromResponse(status, body)));
      };

      xhr.onerror = (): void => {
        if (enableLogging) {

          console.log(`[HTTP ← multipart] network error ${fullUrl} (status=${xhr.status}, body="${xhr.responseText}")`);
        }
        // WHY: XHR onerror fires for connection-level failures (DNS, TCP,
        // unreadable file URI, cleartext blocked). Surface as NetworkFailure
        // with the status (0 == no response) so the UI can show something
        // concrete instead of axios's opaque "Network Error" string.
        resolve(fail(new NetworkFailure(`Network error (status ${xhr.status || 0})`)));
      };

      xhr.ontimeout = (): void => {
        if (enableLogging) {

          console.log(`[HTTP ← multipart] timeout ${fullUrl}`);
        }
        resolve(fail(new TimeoutFailure('Request timed out')));
      };

      xhr.send(formData);
    });
  }
}

const isRecipelyDataBody = <T>(body: unknown): body is RecipelyDataBody<T> => {
  return typeof body === 'object' && body !== null && 'data' in body;
};

// WHY: Recipely backend wraps errors as { error: { code, message, field? } }
// inside the AES envelope. We decrypt in the response interceptor, then map
// `code` → domain Failure class (see `failureFromResponse`) so controller/store
// code never sees HTTP quirks.
const mapAxiosError = (error: unknown): Failure => {
  if (error instanceof EnvelopeDecryptError) {
    return new ValidationFailure(`Bad envelope: ${error.message}`);
  }
  if (!(error instanceof AxiosError)) {
    return new UnknownFailure('Unexpected error', error);
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new TimeoutFailure('Request timed out');
  }

  if (error.response) {
    return failureFromResponse(error.response.status, error.response.data);
  }
  if (error.request) {
    return new NetworkFailure(error.message || 'Network unreachable');
  }
  return new UnknownFailure(error.message, error);
};
