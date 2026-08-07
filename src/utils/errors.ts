import { isAxiosError } from 'axios';

/**
 * Pulls a human-readable message out of an unknown thrown value.
 *
 * Catch clauses are typed `unknown` rather than `any` so a caught value cannot
 * be dereferenced without a check. This centralises the one place that has to
 * do the narrowing, including the API's `{ message }` / `{ error }` shapes.
 */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string }
      | undefined;

    return data?.message || data?.error || error.message || fallback;
  }

  if (error instanceof Error) return error.message || fallback;
  if (typeof error === 'string' && error.trim()) return error;

  return fallback;
}

/** HTTP status of a failed request, when there was a response at all. */
export function getErrorStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}
