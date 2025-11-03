import { useState } from 'react';

interface DeveloperTipProps {
  type?: 'tip' | 'warning' | 'info';
  title: string;
  children: React.ReactNode;
  dismissible?: boolean;
}

export const DeveloperTip = ({
  type = 'tip',
  title,
  children,
  dismissible = true,
}: DeveloperTipProps) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const icons = {
    tip: '💡',
    warning: '⚠️',
    info: 'ℹ️',
  };

  // Type-specific colors for border and background
  const typeStyles = {
    tip: 'border-l-[#4caf50] bg-[rgba(76,175,80,0.05)]',
    warning: 'border-l-[#ff9800] bg-[rgba(255,152,0,0.05)]',
    info: 'border-l-[#2196f3] bg-[rgba(33,150,243,0.05)]',
  };

  return (
    <div className={`rounded-lg p-4 md:p-3.5 mb-6 border-l-4 ${typeStyles[type]}`}>
      <div className="flex items-center gap-2 md:gap-1.5 mb-2">
        <span className="text-xl md:text-lg shrink-0">{icons[type]}</span>
        <strong className="flex-1 text-base md:text-sm font-semibold text-[var(--text-primary)]">{title}</strong>
        {dismissible && (
          <button
            className="bg-transparent border-0 text-2xl leading-none cursor-pointer text-[var(--text-tertiary)] p-0 w-6 h-6 flex items-center justify-center rounded transition-all duration-200 hover:bg-[rgba(0,0,0,0.1)] hover:text-[var(--text-primary)]"
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss tip"
          >
            ×
          </button>
        )}
      </div>
      <div className="text-sm md:text-[0.85rem] leading-relaxed text-[var(--text-secondary)] [&_p]:m-0 [&_strong]:text-[var(--text-primary)] [&_strong]:font-semibold">{children}</div>
    </div>
  );
};

// Preset tips for common scenarios
interface TestnetReminderTipProps {
  network: string;
}

export const TestnetReminderTip = ({ network }: TestnetReminderTipProps) => (
  <DeveloperTip type="warning" title={`You're on ${network}`}>
    <p>
      Transactions here use <strong>test tokens with no real value</strong>. Perfect for learning!
      Switch to mainnet in production.
    </p>
  </DeveloperTip>
);

export const FirstTransactionTip = () => (
  <DeveloperTip type="tip" title="First Transaction?">
    <ul className="ml-6 mt-2 list-disc [&_li]:mb-1">
      <li>Start with a small amount to test</li>
      <li>Double-check the recipient address</li>
      <li>Transaction fees are paid in KLV</li>
      <li>Use the Faucet for free testnet KLV</li>
    </ul>
  </DeveloperTip>
);

export const SmartContractTip = () => (
  <DeveloperTip type="info" title="Smart Contract Basics">
    <p>
      <strong>Readonly functions (👁️)</strong> are free to call and don't change blockchain state.{' '}
      <strong>Mutable functions (✏️)</strong> cost gas and modify contract state.
    </p>
  </DeveloperTip>
);
