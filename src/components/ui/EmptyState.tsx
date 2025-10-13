/**
 * Empty State Component
 * Displays friendly messages when there's no content to show
 */

import { type ReactNode } from 'react';
import './EmptyState.css';

interface EmptyStateProps {
  /** Emoji or icon to display */
  icon?: string;
  /** Title of the empty state */
  title: string;
  /** Description text */
  description: string;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Additional content */
  children?: ReactNode;
}

/**
 * Generic empty state component
 */
export const EmptyState = ({
  icon = '📭',
  title,
  description,
  action,
  children,
}: EmptyStateProps) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {action && (
        <button className="empty-state-action btn-primary" onClick={action.onClick}>
          {action.label}
        </button>
      )}
      {children}
    </div>
  );
};

/**
 * Empty state for when there are no transactions
 */
export const NoTransactionsEmpty = ({
  onCreateTransaction,
}: {
  onCreateTransaction?: () => void;
}) => (
  <EmptyState
    icon="🚀"
    title="No Transactions Yet"
    description="Start your Web3 journey by sending your first transaction!"
    action={
      onCreateTransaction
        ? {
            label: 'Send Transaction',
            onClick: onCreateTransaction,
          }
        : undefined
    }
  >
    <div className="empty-state-tips">
      <p>💡 First time? Try sending a small amount to test</p>
      <p>💡 Use the Faucet to get free testnet KLV</p>
      <p>💡 All transactions are saved in your browser</p>
    </div>
  </EmptyState>
);

/**
 * Empty state for when wallet is not connected
 */
export const WalletNotConnectedEmpty = ({ onConnect }: { onConnect: () => void }) => (
  <EmptyState
    icon="🔌"
    title="Wallet Not Connected"
    description="Connect your Klever wallet to get started"
    action={{
      label: 'Connect Wallet',
      onClick: onConnect,
    }}
  />
);

/**
 * Empty state for no balance
 */
export const NoBalanceEmpty = () => (
  <EmptyState
    icon="💰"
    title="No Balance Available"
    description="Get some testnet KLV to start testing transactions"
  >
    <p style={{ marginTop: '1rem', color: 'var(--text-tertiary)' }}>
      Click the Faucet button in the header to request free testnet funds
    </p>
  </EmptyState>
);
