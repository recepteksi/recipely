import { MIN_PASSWORD } from '@presentation/app/register/model/password-rules';

/** Scores password strength from 0–4 (length + upper + digit + symbol). */
export const computeStrength = (password: string): number => {
  let s = 0;
  if (password.length >= MIN_PASSWORD) s++;
  if (/[A-Z]/.test(password)) s++;
  if (/[0-9]/.test(password)) s++;
  if (/[^A-Za-z0-9]/.test(password)) s++;
  return s;
};
