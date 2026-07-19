import type { AxiosResponse } from 'axios';
import { decryptEnvelope } from '@infrastructure/crypto/aes-envelope';
import { isEnvelope } from '@infrastructure/network/is-envelope';
import type { HttpClientOptions } from '@infrastructure/network/http-client-options';
import { CharConstants } from '@core/constants';

/**
 * Builds the axios response interceptor that decrypts AES-GCM envelopes back
 * into plain JSON. A decrypt failure is logged (dev only) and the raw body is
 * left in place so downstream mapping can still fail cleanly.
 */
export const buildResponseInterceptor = (
  options: HttpClientOptions,
  aesKey: Uint8Array,
) => {
  return (response: AxiosResponse): AxiosResponse => {
    if (isEnvelope(response.data)) {
      try {
        response.data = decryptEnvelope(response.data, aesKey);
      } catch (err) {
        if (options.enableLogging) {
          console.log(`[HTTP ←] decrypt failed: ${(err as Error).message}`);
        }
      }
    }
    if (options.enableLogging) {
      console.log(`[HTTP ←] ${response.status} ${response.config.url ?? CharConstants.empty}`);
    }
    return response;
  };
};
