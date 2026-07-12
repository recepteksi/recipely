/**
 * Full-screen / section content for a failure: a warm title and a plain,
 * actionable body. Always localized — never a raw backend string or stack
 * trace.
 */
export interface FailureContent {
  title: string;
  body: string;
}
