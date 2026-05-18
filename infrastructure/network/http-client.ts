import axios, { type AxiosInstance, type AxiosRequestConfig, AxiosError, AxiosHeaders, type AxiosProgressEvent } from 'axios';
import { fail, ok, type Result } from '@core/result/result';
import {
  type Failure,
  NetworkFailure,
  NotFoundFailure,
  UnauthorizedFailure,
  UnknownFailure,
  ValidationFailure,
} from '@core/failure';
import { API_AES_KEY_HEX, DEFAULT_REQUEST_TIMEOUT_MS } from '@infrastructure/constants/api';
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
}

interface RecipelyErrorBody {
  error?: {
    code?: string;
    message?: string;
    field?: string;
  };
}

interface RecipelyDataBody<T> {
  data: T;
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
      return fail(failureFromResponse(response.status, response.data));
    } catch (error: unknown) {
      return fail(mapAxiosError(error));
    }
  }

  // Routes through this.instance so the request interceptor handles auth +
  // Content-Type omission for FormData, and the response interceptor handles
  // AES decryption — no duplicate logic here.
  uploadMultipart<T>(
    url: string,
    formData: FormData,
    onProgress?: (event: AxiosProgressEvent) => void,
  ): Promise<Result<T, Failure>> {
    return this.request<T>({
      method: 'POST',
      url,
      data: formData,
      ...(onProgress !== undefined ? { onUploadProgress: onProgress } : {}),
    });
  }
}

const isRecipelyDataBody = <T>(body: unknown): body is RecipelyDataBody<T> => {
  return typeof body === 'object' && body !== null && 'data' in body;
};

const isRecipelyErrorBody = (body: unknown): body is RecipelyErrorBody => {
  return typeof body === 'object' && body !== null && 'error' in body;
};

// WHY: Recipely backend wraps errors as { error: { code, message, field? } }
// inside the AES envelope. We decrypt in the response interceptor, then map
// `code` → domain Failure class so controller/store code never sees HTTP quirks.
const mapAxiosError = (error: unknown): Failure => {
  if (error instanceof EnvelopeDecryptError) {
    return new ValidationFailure(`Bad envelope: ${error.message}`);
  }
  if (!(error instanceof AxiosError)) {
    return new UnknownFailure('Unexpected error', error);
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return new NetworkFailure('Request timed out');
  }

  if (error.response) {
    return failureFromResponse(error.response.status, error.response.data);
  }
  if (error.request) {
    return new NetworkFailure(error.message || 'Network unreachable');
  }
  return new UnknownFailure(error.message, error);
};

const failureFromResponse = (status: number, body: unknown): Failure => {
  const envelope = isRecipelyErrorBody(body) ? body.error : undefined;
  const message = envelope?.message ?? `HTTP ${status}`;

  if (envelope?.code) {
    switch (envelope.code) {
      case 'validation':
        return new ValidationFailure(message, envelope.field);
      case 'unprocessable':
        // 422: request was received but a required piece (e.g. missing image or
        // field) was absent. Surface as ValidationFailure so the UI treats it as
        // "fix your input"; field tells the UI which input was missing.
        return new ValidationFailure(message, envelope.field);
      case 'unauthorized':
        return new UnauthorizedFailure(message);
      case 'not_found':
        return new NotFoundFailure(message);
      case 'conflict':
        // WHY: no ConflictFailure on mobile yet — surface as Validation so UX reads it
        // as "fix your input" (email already taken, etc.). Promote to its own class when
        // the UI needs to distinguish 409 from 400.
        return new ValidationFailure(message, envelope.field);
    }
  }

  if (status === 401 || status === 403) return new UnauthorizedFailure(message);
  if (status === 404) return new NotFoundFailure(message);
  if (status >= 400 && status < 500) return new ValidationFailure(message);
  return new UnknownFailure(message);
};
