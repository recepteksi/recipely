/** One parsed field-level entry out of a (possibly multi-field) `ValidationFailure.message`. */
export interface ValidationFieldError {
  field?: string;
  message: string;
}
