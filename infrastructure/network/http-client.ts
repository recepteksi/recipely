import axios, { type AxiosInstance, type AxiosRequestConfig, AxiosError } from 'axios';
import { fail, ok, type Result } from '@core/result/result';
import {
  type Failure,
  NetworkFailure,
  NotFoundFailure,
  UnauthorizedFailure,
  UnknownFailure,
} from '@core/failure';

export interface HttpClientOptions {
  baseUrl: string;
  tokenProvider: () => Promise<string | null>;
}

export class HttpClient {
  private readonly instance: AxiosInstance;

  constructor(private readonly options: HttpClientOptions) {
    this.instance = axios.create({ baseURL: options.baseUrl });
    this.instance.interceptors.request.use(async (config) => {
      const token = await options.tokenProvider();
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
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

const mapAxiosError = (error: unknown): Failure => {
  if (error instanceof AxiosError) {
    if (error.response) {
      const status = error.response.status;
      if (status === 401 || status === 403) {
        return new UnauthorizedFailure(`HTTP ${status}`);
      }
      if (status === 404) {
        return new NotFoundFailure(`HTTP ${status}`);
      }
      return new UnknownFailure(`HTTP ${status}`, error);
    }
    if (error.request) {
      return new NetworkFailure(error.message);
    }
    return new UnknownFailure(error.message, error);
  }
  return new UnknownFailure('Unexpected error', error);
};
