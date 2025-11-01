/**
 * Empty State Component
 * Displays friendly messages when there's no content to show
 */

import { type ReactNode } from 'react';
import { Button } from './Button';

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
    <div className="flex flex-col items-center justify-center py-12 sm:py-8 px-8 sm:px-4 text-center min-h-[300px] sm:min-h-[250px]">
      <div className="text-6xl sm:text-5xl mb-4 mt-8 sm:mt-2 animate-float">{icon}</div>
      <h3 className="text-2xl sm:text-xl font-semibold mb-2 text-gray-900 dark:text-gray-50">{title}</h3>
      <p className="text-base sm:text-sm text-gray-600 dark:text-gray-400 max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {action && (
        <Button className="mt-2" onClick={action.onClick}>
          {action.label}
        </Button>
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
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 flex flex-col gap-2 text-sm text-gray-400 dark:text-gray-500">
      <p className="m-0">💡 First time? Try sending a small amount to test</p>
      <p className="m-0">💡 Use the Faucet to get free testnet KLV</p>
      <p className="m-0">💡 All transactions are saved in your browser</p>
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
    <p className="mt-4 text-gray-400 dark:text-gray-500">
      Click the Faucet button in the header to request free testnet funds
    </p>
  </EmptyState>
);
