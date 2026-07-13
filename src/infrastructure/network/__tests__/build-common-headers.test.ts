import { buildCommonHeaders } from '@infrastructure/network/build-common-headers';
import type { HttpClientOptions } from '@infrastructure/network/http-client-options';

const makeOptions = (overrides: Partial<HttpClientOptions> = {}): HttpClientOptions => ({
  baseUrl: 'https://api.test',
  tokenProvider: () => Promise.resolve('tok'),
  localeProvider: () => 'en',
  ...overrides,
});

describe('buildCommonHeaders', () => {
  it('attaches the bearer token and the active language', async () => {
    const headers = await buildCommonHeaders(makeOptions());

    expect(headers['Authorization']).toBe('Bearer tok');
    expect(headers['Accept-Language']).toBe('en');
  });

  it('omits Authorization when there is no session', async () => {
    const headers = await buildCommonHeaders(
      makeOptions({ tokenProvider: () => Promise.resolve(null) }),
    );

    expect(headers['Authorization']).toBeUndefined();
    expect(headers['Accept-Language']).toBe('en');
  });

  // The regression: the language must be read per request, so a switch is
  // picked up by the very next call instead of the one captured at wiring time.
  it('reads the locale on every call, so a language switch applies immediately', async () => {
    let locale = 'en';
    const options = makeOptions({ localeProvider: () => locale });

    const before = await buildCommonHeaders(options);
    locale = 'tr';
    const after = await buildCommonHeaders(options);

    expect(before['Accept-Language']).toBe('en');
    expect(after['Accept-Language']).toBe('tr');
  });
});
