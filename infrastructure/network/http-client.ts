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
import { DEFAULT_REQUEST_TIMEOUT_MS } from '@infrastructure/constants/api';

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

export class HttpClient {
  private readonly instance: AxiosInstance;

  constructor(private readonly options: HttpClientOptions) {
    this.instance = axios.create({
      baseURL: options.baseUrl,
      timeout: options.timeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.instance.interceptors.request.use(async (config) => {
      const token = await options.tokenProvider();
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (options.enableLogging) {
        // eslint-disable-next-line no-console
        console.log(`[HTTP →] ${config.method?.toUpperCase()} ${config.baseURL ?? ''}${config.url ?? ''}`);
      }
      return config;
    });

    if (options.enableLogging) {
      this.instance.interceptors.response.use(
        (response) => {
          // eslint-disable-next-line no-console
          console.log(`[HTTP ←] ${response.status} ${response.config.url ?? ''}`);
          return response;
        },
        (error: unknown) => Promise.reject(error),
      );
    }
  }

  async request<T>(config: AxiosRequestConfig): Promise<Result<T, Failure>> {
    try {
      const response = await this.instance.request<T>(config);
      return ok(response.data);
    } catch (error: unknown) {
      return fail(mapAxiosError(error));
    }
  }
}

// WHY: Recipely backend wraps errors as { error: { code, message, field? } }.
// We map its code → domain Failure class so controller/store code never sees HTTP quirks.
const mapAxiosError = (error: unknown): Failure => {
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

const isRecipelyErrorBody = (body: unknown): body is RecipelyErrorBody => {
  return typeof body === 'object' && body !== null && 'error' in body;
};
