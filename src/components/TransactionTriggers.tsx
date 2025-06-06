import { useState, useEffect } from 'react';
import { useKlever } from '../hooks/useKlever';
import { NetworkBadge } from './NetworkBadge';
import { ThemeToggle } from './ThemeToggle';
import { CodeBlock } from './steps/CodeBlock';
import { SEO } from './SEO';
import type { Network } from '../constants/network';
import { KlvTransfer } from './transactions/KlvTransfer';
import { KdaTransfer } from './transactions/KdaTransfer';
import { SmartContractInteraction } from './transactions/SmartContractInteraction';
import { TransactionHistory } from './transactions/TransactionHistory';
import './TransactionTriggers.css';

export interface RecentTransaction {
  hash: string;
  type: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
}

export const TransactionTriggers = () => {
  const { isConnected, network } = useKlever();

  // Tab state
  const [activeTab, setActiveTab] = useState<'klv' | 'kda' | 'contract'>('klv');

  // Transaction History
  const [transactions, setTransactions] = useState<RecentTransaction[]>(() => {
    const saved = localStorage.getItem('recentTransactions');
    if (!saved) return [];

    // Parse and convert timestamp strings back to Date objects
    const parsed = JSON.parse(saved);
    return parsed.map((tx: RecentTransaction) => ({
      ...tx,
      timestamp: new Date(tx.timestamp),
    }));
  });

  // Save transactions to localStorage
  useEffect(() => {
    localStorage.setItem('recentTransactions', JSON.stringify(transactions));
  }, [transactions]);

  return (
    <div className="transaction-page">
      <SEO
        title="Klever Transaction Playground - Test Blockchain Transactions"
        description="Interactive playground for testing Klever blockchain transactions. Send KLV, transfer KDA tokens, and interact with smart contracts. Perfect for developers learning Web3."
        keywords="Klever transactions, blockchain playground, KLV transfer, KDA tokens, smart contract testing, Web3 examples, Klever testnet"
        url="https://kleverconnect-starter.kleverlabs.dev/transactions"
      />
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          Transaction <span className="gradient-text">Playground</span>
        </h1>
        <p className="page-subtitle">
          Test token transfers and smart contract interactions on {network}
        </p>
        <div className="header-controls">
          <NetworkBadge />
          <ThemeToggle />
        </div>
      </div>

      {/* Connection Warning */}
      {!isConnected && (
        <div className="connection-warning">
          <div className="warning-icon">⚠️</div>
          <div className="warning-content">
            <h3>Wallet Not Connected</h3>
            <p>Please connect your Klever wallet to use transaction features</p>
          </div>
        </div>
      )}

      {isConnected && (
        <>
          {/* Tab Navigation */}
          <div className="tabs-container">
            <div className="tabs-header">
              <button
                className={`tab-item ${activeTab === 'klv' ? 'active' : ''}`}
                onClick={() => setActiveTab('klv')}
              >
                <span className="tab-icon">💰</span>
                <span className="tab-label">Send KLV</span>
              </button>
              <button
                className={`tab-item ${activeTab === 'kda' ? 'active' : ''}`}
                onClick={() => setActiveTab('kda')}
              >
                <span className="tab-icon">🪙</span>
                <span className="tab-label">Send KDA</span>
              </button>
              <button
                className={`tab-item ${activeTab === 'contract' ? 'active' : ''}`}
                onClick={() => setActiveTab('contract')}
              >
                <span className="tab-icon">📜</span>
                <span className="tab-label">Smart Contract</span>
              </button>
              <div
                className="tab-indicator"
                style={{
                  transform: `translateX(${activeTab === 'klv' ? '0' : activeTab === 'kda' ? '100%' : '200%'})`,
                }}
              ></div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Send KLV Tab */}
            {activeTab === 'klv' && (
              <KlvTransfer
                onTransactionComplete={(tx: RecentTransaction) => {
                  setTransactions((prev) => [tx, ...prev.slice(0, 9)]);
                }}
                onTransactionStatusUpdate={(hash: string, status: 'confirmed' | 'failed') => {
                  setTransactions((prev) =>
                    prev.map((tx) => (tx.hash === hash ? { ...tx, status } : tx))
                  );
                }}
              />
            )}

            {/* Send KDA Tab */}
            {activeTab === 'kda' && (
              <KdaTransfer
                onTransactionComplete={(tx: RecentTransaction) => {
                  setTransactions((prev) => [tx, ...prev.slice(0, 9)]);
                }}
                onTransactionStatusUpdate={(hash: string, status: 'confirmed' | 'failed') => {
                  setTransactions((prev) =>
                    prev.map((tx) => (tx.hash === hash ? { ...tx, status } : tx))
                  );
                }}
              />
            )}

            {/* Smart Contract Tab */}
            {activeTab === 'contract' && (
              <SmartContractInteraction
                onTransactionComplete={(tx: RecentTransaction) => {
                  setTransactions((prev) => [tx, ...prev.slice(0, 9)]);
                }}
                onTransactionStatusUpdate={(hash: string, status: 'confirmed' | 'failed') => {
                  setTransactions((prev) =>
                    prev.map((tx) => (tx.hash === hash ? { ...tx, status } : tx))
                  );
                }}
              />
            )}
          </div>

          {/* Transaction History */}
          <TransactionHistory
            transactions={transactions}
            network={network as Network}
            onClear={() => {
              setTransactions([]);
              localStorage.removeItem('recentTransactions');
            }}
          />
        </>
      )}

      {/* Code Examples Section */}
      <div className="examples-section">
        <h2>Code Examples</h2>
        <p>Learn how to implement these transactions in your own dApp</p>

        <div className="examples-grid">
          <div className="example-card">
            <h3>
              <span className="example-icon">💰</span>
              Send KLV
            </h3>
            <CodeBlock
              language="typescript"
              code={`import { useTransaction } from './hooks/useTransaction';

const { sendKLV, waitForTransaction } = useTransaction();

// Send 10 KLV
const result = await sendKLV('klv1...receiver', 10);
if (result.success && result.hash) {
  await waitForTransaction(result.hash);
}`}
            />
          </div>

          <div className="example-card">
            <h3>
              <span className="example-icon">🪙</span>
              Send KDA
            </h3>
            <CodeBlock
              language="typescript"
              code={`import { useTransaction } from './hooks/useTransaction';

const { sendKDA, waitForTransaction } = useTransaction();

// Send 100 tokens of KDA-ABC123
const result = await sendKDA(
  'klv1...receiver', 
  100, 
  'KDA-ABC123'
);
if (result.success && result.hash) {
  await waitForTransaction(result.hash);
}`}
            />
          </div>

          <div className="example-card">
            <h3>
              <span className="example-icon">🔍</span>
              Query Smart Contract
            </h3>
            <CodeBlock
              language="typescript"
              code={`import { useTransaction } from './hooks/useTransaction';
import { contractParam } from '../utils/contractHelpers';

const { queryContract } = useTransaction();

// Query a view function (read-only, no fees)
const result = await queryContract(
  'klv1qqq...contract',
  'getBalance',
  [contractParam.address('klv1...')]
);

// Query without parameters
const totalSupply = await queryContract(
  'klv1qqq...contract',
  'totalSupply',
  []
);`}
            />
          </div>

          <div className="example-card">
            <h3>
              <span className="example-icon">⚡</span>
              Execute Smart Contract
            </h3>
            <CodeBlock
              language="typescript"
              code={`import { useTransaction } from './hooks/useTransaction';
import { contractParam } from '../utils/contractHelpers';

const { callSmartContract, waitForTransaction } = useTransaction();

// Execute a state-changing function
const args = [
  contractParam.address('klv1...receiver'),
  contractParam.bigUint('1000000')
];

const result = await callSmartContract(
  'klv1qqq...contract',
  'transfer',
  args,
  5 * 1e6 // optional: send 5 KLV with the call
);

if (result.success && result.hash) {
  await waitForTransaction(result.hash);
}`}
            />
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="help-section">
        <h3>Need Help?</h3>
        <p>
          Check out our{' '}
          <a href="/examples" target="_blank">
            examples documentation
          </a>{' '}
          or visit the{' '}
          <a href="https://forum.klever.org" target="_blank" rel="noopener noreferrer">
            Klever Forum
          </a>{' '}
          for support.
        </p>
      </div>
    </div>
  );
};
