/**
 * Code Review types
 *
 * Defines structures for code review and auto-fix functionality
 */

/**
 * Review issue severity
 */
export type IssueSeverity = 'error' | 'warning' | 'info';

/**
 * Review issue
 */
export interface ReviewIssue {
  severity: IssueSeverity;
  line?: number;
  message: string;
  fix?: string;
}

/**
 * Review result
 */
export interface ReviewResult {
  passed: boolean;
  issues: ReviewIssue[];
  suggestions: string[];
  fixedCode?: string;
}

/**
 * Code review configuration
 */
export interface CodeReviewConfig {
  /** Whether to automatically fix discovered issues */
  autoFix?: boolean;
  /** Maximum number of fix rounds */
  maxFixRounds?: number;
}
