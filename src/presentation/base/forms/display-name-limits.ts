/**
 * Maximum display-name length (characters), mirroring `DisplayNameSchema` in
 * the backend (`shared.validators.ts`). Shared by the register and edit-profile
 * forms so neither can let the user type a name the server will reject: without
 * a client-side cap the over-limit name only fails at save time, as a bare 400.
 */
export const DISPLAY_NAME_MAX = 80;
