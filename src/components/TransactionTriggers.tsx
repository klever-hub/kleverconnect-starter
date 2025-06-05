import { useState, useRef, useEffect } from 'react';
import { useTransaction } from '../hooks/useTransaction';
import { convertTypedToEncodable } from '../utils/contractHelpers';
import type { TypedContractParam } from '../types/contract';
import { useKlever } from '../hooks/useKlever';
import { useToast } from '../hooks/useToast';
import { NetworkBadge } from './NetworkBadge';
import { CodeBlock } from './steps/CodeBlock';
import adderABI from '../assets/adder.abi.json';
import './TransactionTriggers.css';

interface ABIFunction {
  name: string;
  inputs: Array<{
    name: string;
    type: string;
  }>;
  outputs?: Array<{
    type: string;
  }>;
  mutability?: string;
  payableInTokens?: string[];
}

interface ContractABI {
  name?: string;
  endpoints: ABIFunction[];
  types?: unknown;
}

// Example contract addresses for testnet
const EXAMPLE_CONTRACTS = {
  adder: 'klv1qqqqqqqqqqqqqpgqxwklx9kjsraqctl36kqekhyh95u5cf8qgz5q33zltk', // Replace with actual deployed contract
};

interface RecentTransaction {
  hash: string;
  type: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
}

export const TransactionTriggers = () => {
  const { isConnected, network } = useKlever();
  const {
    sendKLV,
    sendKDA,
    callSmartContract,
    queryContract,
    parseContractResponse,
    isLoading,
    txHash,
    waitForTransaction,
  } = useTransaction();
  const { addToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Explorer URLs based on network
  const EXPLORER_URLS = {
    mainnet: 'https://kleverscan.org',
    testnet: 'https://testnet.kleverscan.org',
    devnet: 'https://devnet.kleverscan.org',
  };

  // State for different transaction types
  const [activeTab, setActiveTab] = useState<'transfer' | 'kda' | 'contract'>('transfer');

  // Transfer state
  const [transferReceiver, setTransferReceiver] = useState('');
  const [transferAmount, setTransferAmount] = useState('');

  // KDA state
  const [kdaReceiver, setKdaReceiver] = useState('');
  const [kdaAmount, setKdaAmount] = useState('');
  const [kdaId, setKdaId] = useState('');

  // Contract state
  const [contractAddress, setContractAddress] = useState('');
  const [contractABI, setContractABI] = useState<ContractABI | null>(null);
  const [selectedFunction, setSelectedFunction] = useState<string>('');
  const [functionArgs, setFunctionArgs] = useState<{ [key: string]: string }>({});
  const [contractValue, setContractValue] = useState('');

  // Recent transactions state - initialize from localStorage
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>(() => {
    try {
      const saved = localStorage.getItem('klever-recent-transactions');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        return parsed.map((tx: RecentTransaction & { timestamp: string }) => ({
          ...tx,
          timestamp: new Date(tx.timestamp),
        }));
      }
    } catch (error) {
      console.error('Error loading transactions from localStorage:', error);
    }
    return [];
  });

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('klever-recent-transactions', JSON.stringify(recentTransactions));
    } catch (error) {
      console.error('Error saving transactions to localStorage:', error);
    }
  }, [recentTransactions]);

  // Add transaction to recent list
  const addRecentTransaction = (hash: string, type: string) => {
    const newTx: RecentTransaction = {
      hash,
      type,
      timestamp: new Date(),
      status: 'pending',
    };
    setRecentTransactions((prev) => [newTx, ...prev.slice(0, 9)]); // Keep last 10
  };

  // Update transaction status
  const updateTransactionStatus = (hash: string, status: 'confirmed' | 'failed') => {
    setRecentTransactions((prev) => prev.map((tx) => (tx.hash === hash ? { ...tx, status } : tx)));
  };

  // Clear all transactions
  const clearTransactions = () => {
    setRecentTransactions([]);
    localStorage.removeItem('klever-recent-transactions');
    addToast({ title: 'Success', message: 'Transaction history cleared', type: 'success' });
  };

  // Copy transaction hash to clipboard
  const copyToClipboard = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      addToast({
        title: 'Copied!',
        message: 'Transaction hash copied to clipboard',
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      addToast({ title: 'Error', message: 'Failed to copy to clipboard', type: 'error' });
    }
  };

  // Handle KLV transfer
  const handleKLVTransfer = async () => {
    if (!transferReceiver || !transferAmount) {
      addToast({ title: 'Error', message: 'Please fill all fields', type: 'error' });
      return;
    }

    try {
      const result = await sendKLV(transferReceiver, parseFloat(transferAmount));
      if (result.success && result.hash) {
        addRecentTransaction(result.hash, `Send ${transferAmount} KLV`);
        // Wait for confirmation
        const confirmed = await waitForTransaction(result.hash);
        updateTransactionStatus(result.hash, confirmed ? 'confirmed' : 'failed');
        // Reset form
        if (confirmed) {
          setTransferReceiver('');
          setTransferAmount('');
        }
      }
    } catch (error) {
      console.error('Transfer error:', error);
    }
  };

  // Handle KDA transfer
  const handleKDATransfer = async () => {
    if (!kdaReceiver || !kdaAmount || !kdaId) {
      addToast({ title: 'Error', message: 'Please fill all fields', type: 'error' });
      return;
    }

    try {
      const result = await sendKDA(kdaReceiver, parseFloat(kdaAmount), kdaId);
      if (result.success && result.hash) {
        addRecentTransaction(result.hash, `Send ${kdaAmount} ${kdaId}`);
        // Wait for confirmation
        const confirmed = await waitForTransaction(result.hash);
        updateTransactionStatus(result.hash, confirmed ? 'confirmed' : 'failed');
        // Reset form
        if (confirmed) {
          setKdaReceiver('');
          setKdaAmount('');
          setKdaId('');
        }
      }
    } catch (error) {
      console.error('KDA transfer error:', error);
    }
  };

  // Handle ABI file upload
  const handleABIUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const abi = JSON.parse(e.target?.result as string);
        setContractABI(abi);
        setSelectedFunction('');
        setFunctionArgs({});
        addToast({ title: 'Success', message: 'ABI loaded successfully', type: 'success' });
      } catch {
        addToast({ title: 'Error', message: 'Invalid ABI file', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  // Load example ABI
  const loadExampleABI = () => {
    setContractABI(adderABI as ContractABI);
    setContractAddress(EXAMPLE_CONTRACTS.adder);
    setSelectedFunction('');
    setFunctionArgs({});
    addToast({ title: 'Success', message: 'Example ABI loaded', type: 'success' });
  };

  // Get selected function details
  const getSelectedFunctionDetails = (): ABIFunction | null => {
    if (!contractABI || !selectedFunction) return null;
    return contractABI.endpoints.find((f) => f.name === selectedFunction) || null;
  };

  // State for query results
  const [queryResult, setQueryResult] = useState<string | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  // Handle contract call
  const handleContractCall = async () => {
    if (!contractAddress || !selectedFunction) {
      addToast({ title: 'Error', message: 'Please select a contract and function', type: 'error' });
      return;
    }

    const functionDetails = getSelectedFunctionDetails();
    if (!functionDetails) return;

    try {
      // Build arguments array
      const args = functionDetails.inputs.map((input) => {
        const value = functionArgs[input.name] || '';
        const typedParam: TypedContractParam = {
          type: mapABITypeToContractParam(input.type) as TypedContractParam['type'],
          value: parseArgValue(value, input.type),
        };
        return convertTypedToEncodable(typedParam);
      });

      // Check if this is a view function
      if (functionDetails.mutability === 'readonly') {
        // Query the contract (read-only)
        setIsQuerying(true);
        setQueryResult(null);

        try {
          const result = await queryContract(contractAddress, selectedFunction, args);
          const parsedResult = parseContractResponse(result);

          // Display the result
          if (parsedResult !== null) {
            setQueryResult(
              typeof parsedResult === 'string'
                ? parsedResult
                : JSON.stringify(parsedResult, null, 2)
            );
            addToast({
              title: 'Success',
              message: 'Query completed successfully',
              type: 'success',
            });
          } else {
            addToast({ title: 'Info', message: 'Query returned no data', type: 'info' });
          }
        } catch (error) {
          addToast({
            title: 'Error',
            message: error instanceof Error ? error.message : 'Query failed',
            type: 'error',
          });
        } finally {
          setIsQuerying(false);
        }
      } else {
        // Execute the contract (state-changing)
        const value = contractValue ? parseFloat(contractValue) * 1e6 : undefined;
        const result = await callSmartContract(contractAddress, selectedFunction, args, value);

        if (result.success && result.hash) {
          addRecentTransaction(
            result.hash,
            `${selectedFunction}() on ${contractAddress.slice(0, 10)}...`
          );
          // Wait for confirmation
          const confirmed = await waitForTransaction(result.hash);
          updateTransactionStatus(result.hash, confirmed ? 'confirmed' : 'failed');
          // Reset form
          if (confirmed) {
            setFunctionArgs({});
            setContractValue('');
          }
        }
      }
    } catch (error) {
      console.error('Contract operation error:', error);
    }
  };

  // Map ABI types to contract param types
  const mapABITypeToContractParam = (abiType: string): string => {
    const typeMap: { [key: string]: string } = {
      Address: 'Address',
      ManagedBuffer: 'ManagedBuffer',
      BigUint: 'BigUint',
      BigInt: 'BigInt',
      u64: 'u64',
      u32: 'u32',
      i64: 'i64',
      i32: 'i32',
      bool: 'bool',
    };
    return typeMap[abiType] || 'ManagedBuffer';
  };

  // Parse argument value based on type
  const parseArgValue = (value: string, type: string): string | number | boolean => {
    switch (type) {
      case 'u64':
      case 'u32':
      case 'i64':
      case 'i32':
        return parseInt(value);
      case 'bool':
        return value.toLowerCase() === 'true';
      case 'BigUint':
      case 'BigInt':
        return value;
      default:
        return value;
    }
  };

  return (
    <div className="transaction-triggers">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Transaction Playground</h1>
          <p className="hero-subtitle">
            Test and trigger blockchain transactions with ease. Send tokens, interact with smart
            contracts, and explore the Klever blockchain capabilities.
          </p>
          <NetworkBadge />
        </div>
      </div>

      {!isConnected ? (
        <div className="connect-prompt">
          <div className="connect-card">
            <h2>🔗 Connect Your Wallet</h2>
            <p>
              To start sending transactions, please connect your Klever wallet using the button in
              the header.
            </p>
            <div className="features-preview">
              <div className="feature-item">
                <span className="feature-icon">💸</span>
                <span>Send KLV tokens</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🪙</span>
                <span>Transfer KDAs</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📄</span>
                <span>Smart Contract calls</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {txHash && (
            <div className="tx-status-card">
              <div className="tx-status-content">
                <div className="tx-status-icon">✅</div>
                <div className="tx-status-info">
                  <p className="tx-status-title">Transaction Submitted</p>
                  <p className="tx-hash">
                    <code>
                      {txHash.slice(0, 12)}...{txHash.slice(-12)}
                    </code>
                  </p>
                </div>
                <a
                  href={`${EXPLORER_URLS[network]}/transaction/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="explorer-link"
                >
                  View on Explorer →
                </a>
              </div>
            </div>
          )}

          <div className="tabs-container">
            <div className="tabs">
              <button
                className={`tab ${activeTab === 'transfer' ? 'active' : ''}`}
                onClick={() => setActiveTab('transfer')}
              >
                <span className="tab-icon">💰</span>
                Send KLV
              </button>
              <button
                className={`tab ${activeTab === 'kda' ? 'active' : ''}`}
                onClick={() => setActiveTab('kda')}
              >
                <span className="tab-icon">🪙</span>
                Send KDA
              </button>
              <button
                className={`tab ${activeTab === 'contract' ? 'active' : ''}`}
                onClick={() => setActiveTab('contract')}
              >
                <span className="tab-icon">📝</span>
                Smart Contract
              </button>
            </div>
          </div>

          <div className="tab-content">
            {activeTab === 'transfer' && (
              <div className="transaction-card">
                <div className="card-header">
                  <h2>Send KLV Tokens</h2>
                  <p>Transfer KLV to any address on the Klever blockchain</p>
                </div>
                <div className="card-body">
                  <div className="form-group">
                    <label>Receiver Address</label>
                    <input
                      type="text"
                      placeholder="klv1..."
                      value={transferReceiver}
                      onChange={(e) => setTransferReceiver(e.target.value)}
                      className="form-input"
                    />
                    <span className="input-hint">Enter a valid Klever address</span>
                  </div>
                  <div className="form-group">
                    <label>Amount (KLV)</label>
                    <input
                      type="number"
                      placeholder="0.0"
                      step="0.000001"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="form-input"
                    />
                    <span className="input-hint">Minimum: 0.000001 KLV</span>
                  </div>
                  <button
                    className="action-button primary"
                    onClick={handleKLVTransfer}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner"></span>
                        Sending...
                      </>
                    ) : (
                      <>Send KLV</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'kda' && (
              <div className="transaction-card">
                <div className="card-header">
                  <h2>Send KDA (Klever Digital Asset)</h2>
                  <p>Transfer any KDA token to another address</p>
                </div>
                <div className="card-body">
                  <div className="form-group">
                    <label>KDA ID</label>
                    <input
                      type="text"
                      placeholder="KDA-XXXXX"
                      value={kdaId}
                      onChange={(e) => setKdaId(e.target.value)}
                      className="form-input"
                    />
                    <span className="input-hint">The unique identifier of the KDA</span>
                  </div>
                  <div className="form-group">
                    <label>Receiver Address</label>
                    <input
                      type="text"
                      placeholder="klv1..."
                      value={kdaReceiver}
                      onChange={(e) => setKdaReceiver(e.target.value)}
                      className="form-input"
                    />
                    <span className="input-hint">Enter a valid Klever address</span>
                  </div>
                  <div className="form-group">
                    <label>Amount</label>
                    <input
                      type="number"
                      placeholder="0.0"
                      step="0.000001"
                      value={kdaAmount}
                      onChange={(e) => setKdaAmount(e.target.value)}
                      className="form-input"
                    />
                    <span className="input-hint">Check the KDA's precision</span>
                  </div>
                  <button
                    className="action-button primary"
                    onClick={handleKDATransfer}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner"></span>
                        Sending...
                      </>
                    ) : (
                      <>Send KDA</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'contract' && (
              <div className="transaction-card">
                <div className="card-header">
                  <h2>Smart Contract Interaction</h2>
                  <p>Call functions on deployed smart contracts</p>
                </div>
                <div className="card-body">
                  <div className="form-group">
                    <label>Contract Address</label>
                    <input
                      type="text"
                      placeholder="klv1qqq..."
                      value={contractAddress}
                      onChange={(e) => setContractAddress(e.target.value)}
                      className="form-input"
                    />
                    <span className="input-hint">The deployed contract address</span>
                  </div>

                  <div className="abi-section">
                    <label>Contract ABI</label>
                    <div className="abi-actions">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleABIUpload}
                        style={{ display: 'none' }}
                      />
                      <button
                        className="action-button secondary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        📁 Upload ABI
                      </button>
                      <button className="action-button secondary example" onClick={loadExampleABI}>
                        🧪 Load Example
                      </button>
                    </div>
                    {contractABI && (
                      <div className="abi-loaded">
                        <span className="success-icon">✅</span>
                        <span>ABI Loaded: {contractABI.name || 'Contract'}</span>
                      </div>
                    )}
                  </div>

                  {contractABI && (
                    <>
                      <div className="form-group">
                        <label>Select Function</label>
                        <select
                          value={selectedFunction}
                          onChange={(e) => {
                            setSelectedFunction(e.target.value);
                            setFunctionArgs({});
                          }}
                          className="form-input"
                        >
                          <option value="">-- Select Function --</option>
                          {contractABI.endpoints.map((func) => (
                            <option key={func.name} value={func.name}>
                              {func.name}
                              {func.mutability === 'readonly' && ' (view)'}
                              {func.payableInTokens && ' (payable)'}
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedFunction && getSelectedFunctionDetails() && (
                        <div className="function-details">
                          <h3>Function Arguments</h3>
                          {getSelectedFunctionDetails()!.inputs.length === 0 ? (
                            <p className="no-args">This function has no arguments</p>
                          ) : (
                            getSelectedFunctionDetails()!.inputs.map((input) => (
                              <div key={input.name} className="form-group">
                                <label>
                                  {input.name} <span className="type-badge">{input.type}</span>
                                </label>
                                <input
                                  type="text"
                                  placeholder={`Enter ${input.type}`}
                                  value={functionArgs[input.name] || ''}
                                  onChange={(e) =>
                                    setFunctionArgs({
                                      ...functionArgs,
                                      [input.name]: e.target.value,
                                    })
                                  }
                                  className="form-input"
                                />
                              </div>
                            ))
                          )}

                          {getSelectedFunctionDetails()!.mutability !== 'readonly' &&
                            getSelectedFunctionDetails()!.payableInTokens && (
                              <div className="form-group">
                                <label>
                                  Value (KLV) <span className="optional">Optional</span>
                                </label>
                                <input
                                  type="number"
                                  placeholder="0.0"
                                  step="0.000001"
                                  value={contractValue}
                                  onChange={(e) => setContractValue(e.target.value)}
                                  className="form-input"
                                />
                                <span className="input-hint">
                                  Amount to send with the transaction
                                </span>
                              </div>
                            )}

                          <button
                            className="action-button primary"
                            onClick={handleContractCall}
                            disabled={isLoading || isQuerying}
                          >
                            {isLoading || isQuerying ? (
                              <>
                                <span className="spinner"></span>
                                {isQuerying ? 'Querying...' : 'Calling...'}
                              </>
                            ) : (
                              <>
                                {getSelectedFunctionDetails()!.mutability === 'readonly'
                                  ? 'Query'
                                  : 'Call'}{' '}
                                Function
                              </>
                            )}
                          </button>

                          {queryResult &&
                            getSelectedFunctionDetails()!.mutability === 'readonly' && (
                              <div className="query-result">
                                <h4>Query Result:</h4>
                                <pre>
                                  <code>{queryResult}</code>
                                </pre>
                              </div>
                            )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {recentTransactions.length > 0 && (
            <div className="recent-transactions">
              <div className="transactions-header">
                <h2>Recent Transactions</h2>
                <button
                  className="clear-button"
                  onClick={clearTransactions}
                  title="Clear transaction history"
                >
                  🗑️ Clear History
                </button>
              </div>
              <div className="transactions-list">
                {recentTransactions.map((tx) => (
                  <div key={tx.hash} className={`transaction-item ${tx.status}`}>
                    <div className="tx-info">
                      <div className="tx-type">{tx.type}</div>
                      <div className="tx-time">{new Date(tx.timestamp).toLocaleTimeString()}</div>
                    </div>
                    <div className="tx-hash">
                      <code>
                        {tx.hash.slice(0, 8)}...{tx.hash.slice(-8)}
                      </code>
                      <button
                        className="copy-button"
                        onClick={() => copyToClipboard(tx.hash)}
                        title="Copy full hash"
                      >
                        📋
                      </button>
                    </div>
                    <div className="tx-actions">
                      <span className={`status-badge ${tx.status}`}>
                        {tx.status === 'pending' && '⏳'}
                        {tx.status === 'confirmed' && '✅'}
                        {tx.status === 'failed' && '❌'}
                        {tx.status}
                      </span>
                      <a
                        href={`${EXPLORER_URLS[network]}/transaction/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-link"
                      >
                        View →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

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

const { queryContract, parseContractResponse } = useTransaction();

// Query a view function (read-only, no fees)
const result = await queryContract(
  'klv1qqq...contract',
  'getBalance',
  [contractParam.address('klv1...')]
);

// Parse the response
const hexData = parseContractResponse(result);
console.log('Balance:', hexData);

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
    </div>
  );
};
