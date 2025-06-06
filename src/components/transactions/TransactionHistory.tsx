import React from 'react';
import { useToast } from '../../hooks/useToast';
import { getExplorerUrl, type Network } from '../../constants/network';

interface RecentTransaction {
  hash: string;
  type: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
}

interface TransactionHistoryProps {
  transactions: RecentTransaction[];
  network: Network;
  onClear: () => void;
}

export const TransactionHistory = React.memo(({ transactions, network, onClear }: TransactionHistoryProps) => {
  const { addToast } = useToast();

  const copyTransactionHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    addToast({ title: 'Success', message: 'Transaction hash copied!', type: 'success' });
  };

  const copyAllTransactionHashes = () => {
    const hashes = transactions.map((tx) => tx.hash).join('\n');
    navigator.clipboard.writeText(hashes);
    addToast({ title: 'Success', message: 'Transaction hashes copied!', type: 'success' });
  };

  if (transactions.length === 0) {
    return null;
  }

  return (
    <div className="transaction-history-section">
      <div className="section-header">
        <h2>Recent Transactions</h2>
        <div className="section-actions">
          <button onClick={copyAllTransactionHashes} className="btn btn-sm btn-outline">
            📋 Copy All
          </button>
          <button onClick={onClear} className="btn btn-sm btn-outline">
            🗑️ Clear History
          </button>
        </div>
      </div>

      <div className="transaction-list">
        {transactions.map((tx) => (
          <div key={tx.hash} className={`transaction-item status-${tx.status}`}>
            <div className="transaction-info">
              <span className="transaction-type">{tx.type}</span>
              <span className="transaction-time">{tx.timestamp.toLocaleTimeString()}</span>
            </div>
            <div className="transaction-hash">
              <code>
                {tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}
              </code>
              <button
                onClick={() => copyTransactionHash(tx.hash)}
                className="copy-btn"
                title="Copy hash"
              >
                📋
              </button>
            </div>
            <div className="transaction-actions">
              <span className={`transaction-status ${tx.status}`}>
                {tx.status === 'pending' && '⏳ '}
                {tx.status === 'confirmed' && '✅ '}
                {tx.status === 'failed' && '❌ '}
                {tx.status}
              </span>
              <a
                href={getExplorerUrl(network, tx.hash)}
                target="_blank"
                rel="noopener noreferrer"
                className="explorer-link"
              >
                View →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});