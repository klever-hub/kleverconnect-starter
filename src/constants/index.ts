/**
 * Application-wide constants
 * Centralized configuration for magic numbers, URLs, and repeated values
 */

/**
 * Polling intervals in milliseconds
 */
export const POLLING_INTERVALS = {
  /** Balance auto-refresh interval */
  BALANCE_REFRESH: 2500,
  /** Transaction status monitoring interval */
  TRANSACTION_STATUS: 1500,
  /** Faucet status check interval */
  FAUCET_CHECK: 3000,
} as const;

/**
 * Local storage keys
 */
export const LOCAL_STORAGE_KEYS = {
  THEME: 'theme',
  BALANCE_AUTO_REFRESH: 'balance-auto-refresh',
  RECENT_TRANSACTIONS: 'recentTransactions',
  TUTORIAL_PROGRESS: 'tutorial-progress',
  RECENT_ADDRESSES: 'recent-addresses',
} as const;

/**
 * Validation rules
 * Note: Address validation uses official SDK functions from @klever/connect-core
 * (isValidAddress, isValidContractAddress)
 */
export const VALIDATION_RULES = {
  /** Minimum transfer amount */
  MIN_TRANSFER_AMOUNT: 0.000001,
  /** Maximum number of addresses to keep in history */
  MAX_ADDRESS_HISTORY: 10,
  /** Maximum number of transactions to keep in history */
  MAX_TRANSACTION_HISTORY: 10,
  /** KDA ID validation regex (uppercase letters, numbers, hyphens) */
  KDA_ID_REGEX: /^[A-Z0-9-]+$/,
  /** KDA ID minimum length */
  KDA_ID_MIN_LENGTH: 2,
  /** KDA ID maximum length */
  KDA_ID_MAX_LENGTH: 10,
} as const;

/**
 * Animation durations in milliseconds
 */
export const ANIMATION_DURATIONS = {
  /** Slot machine balance animation */
  SLOT_MACHINE: 500,
  /** Toast notification display time */
  TOAST_DISPLAY: 5000,
  /** Theme transition */
  THEME_TRANSITION: 300,
} as const;

/**
 * UI constants
 */
export const UI_CONSTANTS = {
  /** Mobile breakpoint in pixels */
  MOBILE_BREAKPOINT: 768,
  /** Default address display - characters to show at start */
  ADDRESS_DISPLAY_START: 6,
  /** Default address display - characters to show at end */
  ADDRESS_DISPLAY_END: 4,
  /** Transaction hash display - characters to show at start */
  TX_HASH_DISPLAY_START: 8,
  /** Transaction hash display - characters to show at end */
  TX_HASH_DISPLAY_END: 6,
} as const;
