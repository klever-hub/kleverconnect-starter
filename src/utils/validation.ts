/**
 * Form validation utilities for transaction inputs
 * Provides user-friendly validation with helpful error messages
 */

import { isValidAddress, isValidContractAddress } from '@klever/connect-core';
import { VALIDATION_RULES } from '@/constants';
import type { ValidationResult, FormValidationResult } from '@/types';

/**
 * Validates a Klever address using official SDK validation
 * @param address - Address to validate
 * @returns Validation result with error message if invalid
 * @example
 * const result = validateKleverAddress('klv1abc...');
 * if (!result.isValid) {
 *   console.error(result.error);
 * }
 */
export const validateKleverAddress = (address: string): ValidationResult => {
  if (!address || address.trim() === '') {
    return { isValid: false, error: 'Address is required' };
  }

  if (!isValidAddress(address)) {
    return {
      isValid: false,
      error: 'Invalid Klever address format. Must start with "klv1" followed by 38+ characters',
    };
  }

  return { isValid: true };
};

/**
 * Validates a smart contract address using official SDK validation
 * @param address - Contract address to validate
 * @returns Validation result
 * @example
 * validateContractAddress('klv1qqq...')
 */
export const validateContractAddress = (address: string): ValidationResult => {
  if (!address || address.trim() === '') {
    return { isValid: false, error: 'Contract address is required' };
  }
  // Then check if it's specifically a contract address
  if (!isValidContractAddress(address)) {
    return {
      isValid: false,
      error:
        'Invalid contract address. Contract addresses must be valid bech32 and start with "klv1qqqqqq"',
    };
  }

  return { isValid: true };
};

/**
 * Validates a token amount
 * @param amount - Amount as string
 * @param balance - Available balance (optional)
 * @param tokenSymbol - Token symbol for error messages (default: 'tokens')
 * @returns Validation result
 * @example
 * const result = validateAmount('10.5', 100, 'KLV');
 * if (result.isValid) {
 *   // Proceed with transaction
 * }
 */
export const validateAmount = (
  amount: string,
  balance?: number,
  tokenSymbol: string = 'KLV'
): ValidationResult => {
  if (!amount || amount.trim() === '') {
    return { isValid: false, error: 'Amount is required' };
  }

  const numAmount = parseFloat(amount);

  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Amount must be a valid number' };
  }

  if (numAmount <= 0) {
    return { isValid: false, error: 'Amount must be greater than zero' };
  }

  if (
    (tokenSymbol === 'KLV' || tokenSymbol === 'KFI') &&
    numAmount < VALIDATION_RULES.MIN_TRANSFER_AMOUNT
  ) {
    return {
      isValid: false,
      error: `Amount must be at least ${VALIDATION_RULES.MIN_TRANSFER_AMOUNT} ${tokenSymbol}`,
    };
  }

  if (balance !== undefined && numAmount > balance) {
    return {
      isValid: false,
      error: `Insufficient balance. You have ${balance.toFixed(6)} ${tokenSymbol}`,
    };
  }

  return { isValid: true };
};

/**
 * Validates a KDA token ID
 * @param kdaId - KDA token identifier
 * @returns Validation result
 * @example
 * validateKdaId('KFI') // Valid
 * validateKdaId('invalid-token') // Invalid
 */
export const validateKdaId = (kdaId: string): ValidationResult => {
  if (!kdaId || kdaId.trim() === '') {
    return { isValid: false, error: 'KDA ID is required' };
  }

  if (!VALIDATION_RULES.KDA_ID_REGEX.test(kdaId)) {
    return {
      isValid: false,
      error: 'Invalid KDA ID format. Should contain only uppercase letters, numbers, and hyphens',
    };
  }

  if (
    kdaId.length < VALIDATION_RULES.KDA_ID_MIN_LENGTH ||
    kdaId.length > VALIDATION_RULES.KDA_ID_MAX_LENGTH
  ) {
    return {
      isValid: false,
      error: `KDA ID must be between ${VALIDATION_RULES.KDA_ID_MIN_LENGTH} and ${VALIDATION_RULES.KDA_ID_MAX_LENGTH} characters`,
    };
  }

  return { isValid: true };
};

/**
 * Validates a complete transfer form
 * @param recipient - Recipient address
 * @param amount - Transfer amount
 * @param kdaId - KDA ID (optional, required for KDA transfers)
 * @param balance - Available balance (optional)
 * @param tokenSymbol - Token symbol for error messages
 * @returns Form validation result with all errors
 * @example
 * const result = validateTransferForm(
 *   'klv1abc...',
 *   '10.5',
 *   'KFI',
 *   100,
 *   'KLV'
 * );
 * if (!result.isValid) {
 *   console.log(result.errors);
 * }
 */
export const validateTransferForm = (
  recipient: string,
  amount: string,
  kdaId?: string,
  balance?: number,
  tokenSymbol: string = 'tokens'
): FormValidationResult => {
  const errors: Record<string, string> = {};

  const addressValidation = validateKleverAddress(recipient);
  if (!addressValidation.isValid) {
    errors.recipient = addressValidation.error!;
  }

  const amountValidation = validateAmount(amount, balance, tokenSymbol);
  if (!amountValidation.isValid) {
    errors.amount = amountValidation.error!;
  }

  if (kdaId) {
    const kdaValidation = validateKdaId(kdaId);
    if (!kdaValidation.isValid) {
      errors.kdaId = kdaValidation.error!;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates smart contract function inputs
 * @param inputs - Map of input name to value
 * @param requiredInputs - Array of required input names
 * @returns Validation result
 * @example
 * const result = validateContractInputs(
 *   { param1: '5', param2: '10' },
 *   ['param1', 'param2']
 * );
 */
export const validateContractInputs = (
  inputs: Record<string, string>,
  requiredInputs: string[]
): FormValidationResult => {
  const errors: Record<string, string> = {};

  for (const inputName of requiredInputs) {
    const value = inputs[inputName];
    if (!value || value.trim() === '') {
      errors[inputName] = `${inputName} is required`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Validates an email address (for future features)
 * @param email - Email address
 * @returns Validation result
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Invalid email format',
    };
  }

  return { isValid: true };
};

/**
 * Validates a URL (for future features)
 * @param url - URL to validate
 * @returns Validation result
 */
export const validateUrl = (url: string): ValidationResult => {
  if (!url || url.trim() === '') {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: 'Invalid URL format',
    };
  }
};

/**
 * Validates a numeric string within a range
 * @param value - Value to validate
 * @param min - Minimum value (optional)
 * @param max - Maximum value (optional)
 * @param fieldName - Field name for error message
 * @returns Validation result
 */
export const validateNumericRange = (
  value: string,
  min?: number,
  max?: number,
  fieldName: string = 'Value'
): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const numValue = parseFloat(value);

  if (isNaN(numValue)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }

  if (min !== undefined && numValue < min) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${min}`,
    };
  }

  if (max !== undefined && numValue > max) {
    return {
      isValid: false,
      error: `${fieldName} must be at most ${max}`,
    };
  }

  return { isValid: true };
};

/**
 * Validates required field (non-empty string)
 * @param value - Value to validate
 * @param fieldName - Field name for error message
 * @returns Validation result
 */
export const validateRequired = (value: string, fieldName: string = 'Field'): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  return { isValid: true };
};

/**
 * Validates string length
 * @param value - Value to validate
 * @param minLength - Minimum length (optional)
 * @param maxLength - Maximum length (optional)
 * @param fieldName - Field name for error message
 * @returns Validation result
 */
export const validateLength = (
  value: string,
  minLength?: number,
  maxLength?: number,
  fieldName: string = 'Field'
): ValidationResult => {
  if (minLength !== undefined && value.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} characters`,
    };
  }

  if (maxLength !== undefined && value.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at most ${maxLength} characters`,
    };
  }

  return { isValid: true };
};

/**
 * Validates a hex string (for contract parameters)
 * @param value - Hex string to validate
 * @param fieldName - Field name for error message
 * @returns Validation result
 */
export const validateHexString = (value: string, fieldName: string = 'Value'): ValidationResult => {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const hexRegex = /^(0x)?[0-9a-fA-F]+$/;
  if (!hexRegex.test(value)) {
    return {
      isValid: false,
      error: `${fieldName} must be a valid hex string`,
    };
  }

  return { isValid: true };
};
