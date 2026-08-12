/** Thrown for expected, user-facing import problems. The message is safe to display as-is.
 * Anything else (driver/network errors) must never reach the client — log it and show a generic message instead. */
export class ImportUserError extends Error {}
