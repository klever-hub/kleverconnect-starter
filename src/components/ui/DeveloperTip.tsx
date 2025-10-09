import { useState } from 'react';
import './DeveloperTip.css';

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

  return (
    <div className={`developer-tip developer-tip-${type}`}>
      <div className="tip-header">
        <span className="tip-icon">{icons[type]}</span>
        <strong className="tip-title">{title}</strong>
        {dismissible && (
          <button
            className="tip-dismiss"
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss tip"
          >
            ×
          </button>
        )}
      </div>
      <div className="tip-content">{children}</div>
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
    <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
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
