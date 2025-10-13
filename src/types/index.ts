/**
 * Shared TypeScript types and interfaces
 * Centralized type definitions used across the application
 */

import type { NetworkName } from '@klever/connect-core';
import type { TransactionStatus } from '@klever/connect-provider';

/**
 * Re-export NetworkName from connect-core as NetworkType for convenience
 */
export type { NetworkName };
export type NetworkType = NetworkName;

/**
 * Re-export TransactionStatus from connect-provider
 */
export type { TransactionStatus };

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Form validation result for single field
 */
export interface ValidationResult {
  /** Whether the field is valid */
  isValid: boolean;
  /** Error message if invalid */
  error?: string;
}

/**
 * Form validation result for multiple fields
 */
export interface FormValidationResult {
  /** Whether all fields are valid */
  isValid: boolean;
  /** Map of field names to error messages */
  errors: Record<string, string>;
}

/**
 * Toast notification options
 */
export interface ToastOptions {
  /** Toast title */
  title: string;
  /** Toast message */
  message: string;
  /** Toast type */
  type: ToastType;
  /** Display duration in milliseconds (optional) */
  duration?: number;
}

/**
 * Transaction information
 */
export interface Transaction {
  /** Transaction hash */
  hash: string;
  /** Transaction status */
  status: TransactionStatus;
  /** Transaction timestamp */
  timestamp: Date;
  /** Transaction type description */
  type: string;
  /** Transaction results (optional) */
  results?: unknown;
}

/**
 * Recent transaction for history display
 * Currently identical to Transaction, but can be extended with additional fields
 */
export type RecentTransaction = Transaction;

/**
 * Faucet status information
 */
export interface FaucetStatus {
  /** Whether user can request funds */
  canRequest: boolean;
  /** Status message */
  message?: string;
  /** Next request time (ISO string) */
  nextRequestTime?: string;
}
