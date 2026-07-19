/**
 * Progress callback shape for multipart uploads. Decoupled from axios so
 * callers don't need to import axios types just to receive byte counts.
 */
export interface UploadProgressEvent {
  loaded: number;
  total: number;
}
