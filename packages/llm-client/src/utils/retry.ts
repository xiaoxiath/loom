/**
 * Shared retry utilities for LLM clients
 */

export interface RetryOptions {
  maxAttempts: number;
  delayMs: number;
  isRetryable: (error: any) => boolean;
}

/**
 * Retry operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Check if we should retry
      if (attempt >= options.maxAttempts || !options.isRetryable(error)) {
        throw error;
      }

      // Exponential backoff: 1s → 2s → 4s
      const delay = options.delayMs * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }

  throw lastError;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  // Rate limit
  if (error.status === 429) return true;

  // Server error
  if (error.status >= 500) return true;

  // Network errors
  if (error.code === 'ECONNRESET') return true;
  if (error.code === 'ETIMEDOUT') return true;

  return false;
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
