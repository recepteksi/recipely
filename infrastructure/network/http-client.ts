import axios, { type AxiosInstance, type AxiosRequestConfig, AxiosError } from 'axios';
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

export class HttpClient {
  private readonly instance: AxiosInstance;
  private readonly aesKey: Uint8Array;

  constructor(private readonly options: HttpClientOptions) {
    this.aesKey = keyFromHex(API_AES_KEY_HEX);

    this.instance = axios.create({
      baseURL: options.baseUrl,
      timeout: options.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      // Tell axios to NOT throw on non-2xx so our interceptor can decrypt the
      // error body before mapAxiosError sees it.
      validateStatus: () => true,
    });

    // Request interceptor: attach JWT and encrypt body if present.
    this.instance.interceptors.request.use(async (config) => {
      const token = await options.tokenProvider();
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (config.data !== undefined && config.data !== null) {
        // WHY: backend's decryptBody middleware expects plaintext to be
        // `{ data: <T> }` (mirroring the response side). Wrap before encrypt
        // so the contract is symmetric.
        config.data = encryptEnvelope({ data: config.data }, this.aesKey);
      }
      if (options.enableLogging) {
        // eslint-disable-next-line no-console
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
              // eslint-disable-next-line no-console
              console.log(`[HTTP ←] decrypt failed: ${(err as Error).message}`);
            }
          }
        }
        if (options.enableLogging) {
          // eslint-disable-next-line no-console
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
