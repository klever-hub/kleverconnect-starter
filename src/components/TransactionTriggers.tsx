import { useState, useRef, useEffect } from 'react';
import { useTransaction } from '../hooks/useTransaction';
import type { TransactionResults } from '../hooks/useTransaction';
import { convertTypedToEncodable } from '../utils/contractHelpers';
import type { TypedContractParam } from '../types/contract';
import { useKlever } from '../hooks/useKlever';
import { useToast } from '../hooks/useToast';
import { NetworkBadge } from './NetworkBadge';
import { ThemeToggle } from './ThemeToggle';
import { CodeBlock } from './steps/CodeBlock';
import type { ContractABI, DecodedReturnData } from '../utils/abiDecoder';
import adderABI from '../assets/adder.abi.json';
import diceABI from '../assets/dice.abi.json';
import factorialABI from '../assets/factorial.abi.json';
import './TransactionTriggers.css';

interface ABIFunction {
  name: string;
  inputs: Array<{
    name: string;
    type: string;
  }>;
  outputs?: Array<{
    type: string;
    name?: string;
  }>;
  mutability?: 'readonly' | 'mutable';
  payableInTokens?: string[];
}

interface EnumVariant {
  name: string;
  discriminant: number;
}

interface TypeDefinition {
  type: string;
  variants?: EnumVariant[];
  fields?: Array<{
    name: string;
    type: string;
  }>;
}

interface ExtendedContractABI extends ContractABI {
  name?: string;
  endpoints: ABIFunction[];
  types?: Record<string, TypeDefinition>;
}

// Example contract addresses for testnet
const EXAMPLE_CONTRACTS = {
  adder: 'klv1qqqqqqqqqqqqqpgqxwklx9kjsraqctl36kqekhyh95u5cf8qgz5q33zltk',
  dice: 'klv1qqqqqqqqqqqqqpgqees9prr7ma632ngknhqe55x8wkz49ha5gz5q7vxkn7',
  factorial: 'klv1qqqqqqqqqqqqqpgq4mzhj8ae67slc6cfsjvslw89v4pug5uygz5qdx28tm',
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
    waitForTransaction,
    getTransactionWithResults,
    parseContractResponse,
    decodeTransactionWithABI,
    isLoading,
  } = useTransaction();
  const { addToast } = useToast();

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

  // Token Transfer States
  const [tokenRecipient, setTokenRecipient] = useState('');
  const [klvAmount, setKlvAmount] = useState('');
  const [kdaId, setKdaId] = useState('');
  const [kdaAmount, setKdaAmount] = useState('');

  // Transfer Results
  const [klvResult, setKlvResult] = useState<{
    hash: string;
    status: string;
    results?: TransactionResults | null;
  } | null>(null);
  const [kdaResult, setKdaResult] = useState<{
    hash: string;
    status: string;
    results?: TransactionResults | null;
  } | null>(null);
  const [isWaitingForKlv, setIsWaitingForKlv] = useState(false);
  const [isWaitingForKda, setIsWaitingForKda] = useState(false);

  // Smart Contract States
  const [contractAddress, setContractAddress] = useState(EXAMPLE_CONTRACTS.adder);
  const [selectedFunction, setSelectedFunction] = useState<ABIFunction | null>(null);
  const [functionInputs, setFunctionInputs] = useState<Record<string, string>>({});
  const [queryResult, setQueryResult] = useState<{ parsed: unknown; raw: unknown } | null>(null);
  const [executionResult, setExecutionResult] = useState<{
    hash: string;
    status: string;
    results?: TransactionResults | null;
    decodedData?: DecodedReturnData | null;
  } | null>(null);
  const [uploadedABI, setUploadedABI] = useState<ExtendedContractABI | null>(
    adderABI as ExtendedContractABI
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<'adder' | 'dice' | 'factorial' | 'custom'>(
    'adder'
  );
  const [isWaitingForTx, setIsWaitingForTx] = useState(false);
  const [paymentToken, setPaymentToken] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');

  // Save transactions to localStorage
  useEffect(() => {
    localStorage.setItem('recentTransactions', JSON.stringify(transactions));
  }, [transactions]);

  // Transaction handlers
  const handleSendKLV = async () => {
    if (!tokenRecipient || !klvAmount) {
      addToast({ title: 'Error', message: 'Please fill in all fields', type: 'error' });
      return;
    }

    try {
      // Clear previous result
      setKlvResult(null);

      const result = await sendKLV(tokenRecipient, parseFloat(klvAmount));

      if (result.success && result.hash) {
        const newTx: RecentTransaction = {
          hash: result.hash,
          type: `Send ${klvAmount} KLV`,
          timestamp: new Date(),
          status: 'pending',
        };
        setTransactions((prev) => [newTx, ...prev.slice(0, 9)]);

        // Clear form
        setTokenRecipient('');
        setKlvAmount('');

        // Set waiting state
        setIsWaitingForKlv(true);
        setKlvResult({ hash: result.hash, status: 'pending' });

        // Wait for confirmation
        waitForTransaction(result.hash)
          .then(async (confirmed) => {
            setTransactions((prev) =>
              prev.map((tx) =>
                tx.hash === result.hash ? { ...tx, status: confirmed ? 'confirmed' : 'failed' } : tx
              )
            );

            // Fetch transaction results
            const txDetails = result.hash ? await getTransactionWithResults(result.hash) : null;

            setKlvResult({
              hash: result.hash || '',
              status: confirmed ? 'confirmed' : 'failed',
              results: txDetails,
            });
            setIsWaitingForKlv(false);

            if (confirmed) {
              addToast({ title: 'Success', message: 'Transaction confirmed!', type: 'success' });
            }
          })
          .catch(() => {
            setTransactions((prev) =>
              prev.map((tx) => (tx.hash === result.hash ? { ...tx, status: 'failed' } : tx))
            );
            setKlvResult({ hash: result.hash || '', status: 'failed' });
            setIsWaitingForKlv(false);
          });
      }
    } catch (error) {
      addToast({
        title: 'Error',
        message: `Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
      setIsWaitingForKlv(false);
    }
  };

  const handleSendKDA = async () => {
    if (!tokenRecipient || !kdaId || !kdaAmount) {
      addToast({ title: 'Error', message: 'Please fill in all fields', type: 'error' });
      return;
    }

    try {
      // Clear previous result
      setKdaResult(null);

      const result = await sendKDA(tokenRecipient, parseFloat(kdaAmount), kdaId);

      if (result.success && result.hash) {
        const newTx: RecentTransaction = {
          hash: result.hash,
          type: `Send ${kdaAmount} ${kdaId}`,
          timestamp: new Date(),
          status: 'pending',
        };
        setTransactions((prev) => [newTx, ...prev.slice(0, 9)]);

        // Clear form
        setTokenRecipient('');
        setKdaId('');
        setKdaAmount('');

        // Set waiting state
        setIsWaitingForKda(true);
        setKdaResult({ hash: result.hash, status: 'pending' });

        // Wait for confirmation
        waitForTransaction(result.hash)
          .then(async (confirmed) => {
            setTransactions((prev) =>
              prev.map((tx) =>
                tx.hash === result.hash ? { ...tx, status: confirmed ? 'confirmed' : 'failed' } : tx
              )
            );

            // Fetch transaction results
            const txDetails = result.hash ? await getTransactionWithResults(result.hash) : null;

            setKdaResult({
              hash: result.hash || '',
              status: confirmed ? 'confirmed' : 'failed',
              results: txDetails,
            });
            setIsWaitingForKda(false);

            if (confirmed) {
              addToast({ title: 'Success', message: 'Transaction confirmed!', type: 'success' });
            }
          })
          .catch(() => {
            setTransactions((prev) =>
              prev.map((tx) => (tx.hash === result.hash ? { ...tx, status: 'failed' } : tx))
            );
            setKdaResult({ hash: result.hash || '', status: 'failed' });
            setIsWaitingForKda(false);
          });
      }
    } catch (error) {
      addToast({
        title: 'Error',
        message: `Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
      setIsWaitingForKda(false);
    }
  };

  const handleSmartContractCall = async () => {
    if (!selectedFunction || !contractAddress) {
      addToast({ title: 'Error', message: 'Please select a function', type: 'error' });
      return;
    }

    try {
      const params: TypedContractParam[] = selectedFunction.inputs.map((input) => ({
        type: input.type as TypedContractParam['type'],
        value: functionInputs[input.name] || '',
      }));

      const encodableParams = params.map(convertTypedToEncodable);

      if (selectedFunction.mutability === 'readonly') {
        const result = await queryContract(contractAddress, selectedFunction.name, encodableParams);
        // Parse the contract response with ABI
        const parsedResult = parseContractResponse(
          result,
          selectedFunction.name,
          uploadedABI || undefined
        );
        // Store both parsed and raw results
        setQueryResult({ parsed: parsedResult, raw: result });

        addToast({ title: 'Success', message: 'Query successful!', type: 'success' });
      } else {
        // Clear previous results
        setQueryResult(null);
        setExecutionResult(null);

        // Check if function is payable and prepare payment
        let paymentValue: number | undefined;
        let paymentTokenId = 'KLV';

        if (
          selectedFunction.payableInTokens &&
          selectedFunction.payableInTokens.length > 0 &&
          paymentAmount
        ) {
          paymentValue = parseFloat(paymentAmount) * 1e6; // Convert to precision 6

          // If a specific token is selected (not wildcard), use it
          if (paymentToken && paymentToken !== '*') {
            paymentTokenId = paymentToken;
          }
        }

        const result = await callSmartContract(
          contractAddress,
          selectedFunction.name,
          encodableParams,
          paymentValue,
          paymentTokenId
        );

        if (result.success && result.hash) {
          const newTx: RecentTransaction = {
            hash: result.hash,
            type: `Call ${selectedFunction.name}()`,
            timestamp: new Date(),
            status: 'pending',
          };
          setTransactions((prev) => [newTx, ...prev.slice(0, 9)]);

          // Clear inputs
          setFunctionInputs({});
          setPaymentAmount('');
          // Keep token selection for next transaction

          // Set waiting state
          setIsWaitingForTx(true);
          setExecutionResult({ hash: result.hash, status: 'pending' });

          // Wait for confirmation
          waitForTransaction(result.hash)
            .then(async (confirmed) => {
              setTransactions((prev) =>
                prev.map((tx) =>
                  tx.hash === result.hash
                    ? { ...tx, status: confirmed ? 'confirmed' : 'failed' }
                    : tx
                )
              );

              // Fetch transaction results
              const txDetails = result.hash ? await getTransactionWithResults(result.hash) : null;

              // Decode return values if we have ABI and transaction results
              let decodedData: DecodedReturnData | null = null;
              if (txDetails && uploadedABI && selectedFunction) {
                decodedData = decodeTransactionWithABI(
                  txDetails,
                  selectedFunction.name,
                  uploadedABI
                );
              }

              setExecutionResult({
                hash: result.hash || '',
                status: confirmed ? 'confirmed' : 'failed',
                results: txDetails,
                decodedData,
              });
              setIsWaitingForTx(false);

              if (confirmed) {
                addToast({ title: 'Success', message: 'Transaction confirmed!', type: 'success' });
              }
            })
            .catch(() => {
              setTransactions((prev) =>
                prev.map((tx) => (tx.hash === result.hash ? { ...tx, status: 'failed' } : tx))
              );
              setExecutionResult({ hash: result.hash || '', status: 'failed' });
              setIsWaitingForTx(false);
            });
        }
      }
    } catch (error) {
      addToast({
        title: 'Error',
        message: `Contract call failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
    }
  };

  const processABIFile = (file: File) => {
    if (!file.name.endsWith('.json')) {
      addToast({ title: 'Error', message: 'Please upload a JSON file', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const abi = JSON.parse(e.target?.result as string) as ExtendedContractABI;
        setSelectedPreset('custom');
        setUploadedABI(abi);
        setSelectedFunction(null);
        setFunctionInputs({});
        addToast({ title: 'Success', message: 'ABI uploaded successfully!', type: 'success' });
      } catch {
        addToast({ title: 'Error', message: 'Invalid ABI file', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  const handleABIUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processABIFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processABIFile(files[0]);
    }
  };

  const clearTransactionHistory = () => {
    setTransactions([]);
    localStorage.removeItem('recentTransactions');
    addToast({ title: 'Success', message: 'Transaction history cleared', type: 'info' });
  };

  const copyAllTransactionHashes = () => {
    const hashes = transactions.map((tx) => tx.hash).join('\n');
    navigator.clipboard.writeText(hashes);
    addToast({ title: 'Success', message: 'Transaction hashes copied!', type: 'success' });
  };

  const copyTransactionHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    addToast({ title: 'Success', message: 'Transaction hash copied!', type: 'success' });
  };

  // Explorer URL based on network
  const getExplorerUrl = (hash: string) => {
    const baseUrl =
      network === 'mainnet' ? 'https://kleverscan.org' : `https://${network}.kleverscan.org`;
    return `${baseUrl}/transaction/${hash}`;
  };

  return (
    <div className="transaction-page">
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
                onClick={() => {
                  setActiveTab('klv');
                  setKdaResult(null);
                  setExecutionResult(null);
                }}
              >
                <span className="tab-icon">💰</span>
                <span className="tab-label">Send KLV</span>
              </button>
              <button
                className={`tab-item ${activeTab === 'kda' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('kda');
                  setKlvResult(null);
                  setExecutionResult(null);
                }}
              >
                <span className="tab-icon">🪙</span>
                <span className="tab-label">Send KDA</span>
              </button>
              <button
                className={`tab-item ${activeTab === 'contract' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('contract');
                  setKlvResult(null);
                  setKdaResult(null);
                }}
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
              <div className="transaction-card">
                <div className="card-header">
                  <h3>Send KLV</h3>
                  <span className="badge badge-primary">Native Token</span>
                </div>
                <div className="card-content">
                  <div className="form-group">
                    <label>Recipient Address</label>
                    <input
                      type="text"
                      placeholder="klv1..."
                      value={tokenRecipient}
                      onChange={(e) => setTokenRecipient(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Amount (KLV)</label>
                    <input
                      type="number"
                      placeholder="0.0"
                      value={klvAmount}
                      onChange={(e) => setKlvAmount(e.target.value)}
                      className="form-input"
                      step="0.000001"
                    />
                  </div>
                  <button
                    onClick={handleSendKLV}
                    disabled={!isConnected || isLoading || isWaitingForKlv}
                    className="btn btn-primary"
                  >
                    {isLoading ? (
                      'Sending...'
                    ) : isWaitingForKlv ? (
                      <>
                        <span className="spinner"></span> Waiting for confirmation...
                      </>
                    ) : (
                      'Send KLV'
                    )}
                  </button>

                  {/* KLV Transaction Result */}
                  {klvResult && (
                    <div className="execution-result">
                      <h4>Transaction Result</h4>
                      <div className="result-content">
                        <div className="result-item">
                          <span className="result-label">Transaction Hash:</span>
                          <code className="result-value">{klvResult.hash}</code>
                        </div>
                        <div className="result-item">
                          <span className="result-label">Status:</span>
                          <span className={`result-status ${klvResult.status}`}>
                            {klvResult.status === 'pending' && '⏳ Pending'}
                            {klvResult.status === 'confirmed' && '✅ Confirmed'}
                            {klvResult.status === 'failed' && '❌ Failed'}
                          </span>
                        </div>

                        {/* Show failure reason if transaction failed */}
                        {klvResult.results?.status === 'fail' && klvResult.results?.resultCode && (
                          <div className="result-item">
                            <span className="result-label">Failure Reason:</span>
                            <span className="result-error">{klvResult.results.resultCode}</span>
                          </div>
                        )}

                        {/* Transaction Details */}
                        {klvResult.results && (
                          <>
                            {klvResult.results.receipts &&
                              klvResult.results.receipts.length > 0 && (
                                <div className="result-item">
                                  <span className="result-label">Receipts:</span>
                                  <span>{klvResult.results.receipts.length} receipt(s)</span>
                                </div>
                              )}

                            {/* Show transfer details */}
                            {klvResult.results.contract &&
                              klvResult.results.contract.length > 0 && (
                                <div className="contract-results">
                                  <h5>Transfer Details:</h5>
                                  <CodeBlock
                                    language="json"
                                    code={JSON.stringify(klvResult.results.contract, null, 2)}
                                  />
                                </div>
                              )}

                            {/* Show all receipts */}
                            {klvResult.results.receipts &&
                              klvResult.results.receipts.length > 0 && (
                                <div className="contract-results">
                                  <h5>Transaction Receipts:</h5>
                                  <CodeBlock
                                    language="json"
                                    code={JSON.stringify(klvResult.results.receipts, null, 2)}
                                  />
                                </div>
                              )}

                            {/* Show logs if available */}
                            {klvResult.results.logs && (
                              <div className="transaction-logs">
                                <h5>Transaction Logs:</h5>
                                <CodeBlock
                                  language="json"
                                  code={JSON.stringify(klvResult.results.logs, null, 2)}
                                />
                              </div>
                            )}
                          </>
                        )}

                        {klvResult.status !== 'pending' && (
                          <div className="result-actions">
                            <a
                              href={getExplorerUrl(klvResult.hash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline btn-sm"
                            >
                              View on Explorer →
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Send KDA Tab */}
            {activeTab === 'kda' && (
              <div className="transaction-card">
                <div className="card-header">
                  <h3>Send KDA Token</h3>
                  <span className="badge badge-secondary">Custom Token</span>
                </div>
                <div className="card-content">
                  <div className="form-row">
                    <div className="form-group">
                      <label>KDA ID</label>
                      <input
                        type="text"
                        placeholder="KDA-XXX"
                        value={kdaId}
                        onChange={(e) => setKdaId(e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Amount</label>
                      <input
                        type="number"
                        placeholder="0.0"
                        value={kdaAmount}
                        onChange={(e) => setKdaAmount(e.target.value)}
                        className="form-input"
                        step="0.000001"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Recipient Address</label>
                    <input
                      type="text"
                      placeholder="klv1..."
                      value={tokenRecipient}
                      onChange={(e) => setTokenRecipient(e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <button
                    onClick={handleSendKDA}
                    disabled={!isConnected || isLoading || isWaitingForKda}
                    className="btn btn-secondary"
                  >
                    {isLoading ? (
                      'Sending...'
                    ) : isWaitingForKda ? (
                      <>
                        <span className="spinner"></span> Waiting for confirmation...
                      </>
                    ) : (
                      'Send KDA'
                    )}
                  </button>

                  {/* KDA Transaction Result */}
                  {kdaResult && (
                    <div className="execution-result">
                      <h4>Transaction Result</h4>
                      <div className="result-content">
                        <div className="result-item">
                          <span className="result-label">Transaction Hash:</span>
                          <code className="result-value">{kdaResult.hash}</code>
                        </div>
                        <div className="result-item">
                          <span className="result-label">Status:</span>
                          <span className={`result-status ${kdaResult.status}`}>
                            {kdaResult.status === 'pending' && '⏳ Pending'}
                            {kdaResult.status === 'confirmed' && '✅ Confirmed'}
                            {kdaResult.status === 'failed' && '❌ Failed'}
                          </span>
                        </div>

                        {/* Show failure reason if transaction failed */}
                        {kdaResult.results?.status === 'fail' && kdaResult.results?.resultCode && (
                          <div className="result-item">
                            <span className="result-label">Failure Reason:</span>
                            <span className="result-error">{kdaResult.results.resultCode}</span>
                          </div>
                        )}

                        {/* Transaction Details */}
                        {kdaResult.results && (
                          <>
                            {kdaResult.results.receipts &&
                              kdaResult.results.receipts.length > 0 && (
                                <div className="result-item">
                                  <span className="result-label">Receipts:</span>
                                  <span>{kdaResult.results.receipts.length} receipt(s)</span>
                                </div>
                              )}

                            {/* Show transfer details */}
                            {kdaResult.results.contract &&
                              kdaResult.results.contract.length > 0 && (
                                <div className="contract-results">
                                  <h5>Transfer Details:</h5>
                                  <CodeBlock
                                    language="json"
                                    code={JSON.stringify(kdaResult.results.contract, null, 2)}
                                  />
                                </div>
                              )}

                            {/* Show all receipts */}
                            {kdaResult.results.receipts &&
                              kdaResult.results.receipts.length > 0 && (
                                <div className="contract-results">
                                  <h5>Transaction Receipts:</h5>
                                  <CodeBlock
                                    language="json"
                                    code={JSON.stringify(kdaResult.results.receipts, null, 2)}
                                  />
                                </div>
                              )}

                            {/* Show logs if available */}
                            {kdaResult.results.logs && (
                              <div className="transaction-logs">
                                <h5>Transaction Logs:</h5>
                                <CodeBlock
                                  language="json"
                                  code={JSON.stringify(kdaResult.results.logs, null, 2)}
                                />
                              </div>
                            )}
                          </>
                        )}

                        {kdaResult.status !== 'pending' && (
                          <div className="result-actions">
                            <a
                              href={getExplorerUrl(kdaResult.hash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline btn-sm"
                            >
                              View on Explorer →
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Smart Contract Tab */}
            {activeTab === 'contract' && (
              <div className="transaction-card">
                <div className="card-header">
                  <h3>Contract Interaction</h3>
                  <span className="badge badge-advanced">Advanced</span>
                </div>
                <div className="card-content">
                  {/* Contract Preset Selection */}
                  <div className="form-group">
                    <label>Contract Type</label>
                    <div className="preset-buttons">
                      <button
                        className={`preset-btn ${selectedPreset === 'adder' ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedPreset('adder');
                          setUploadedABI(adderABI as ExtendedContractABI);
                          setContractAddress(EXAMPLE_CONTRACTS.adder);
                          setSelectedFunction(null);
                          setFunctionInputs({});
                          setQueryResult(null);
                          setExecutionResult(null);
                          setPaymentAmount('');
                          setPaymentToken('');
                        }}
                      >
                        🔢 Adder
                      </button>
                      <button
                        className={`preset-btn ${selectedPreset === 'dice' ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedPreset('dice');
                          setUploadedABI(diceABI as ExtendedContractABI);
                          setContractAddress(EXAMPLE_CONTRACTS.dice);
                          setSelectedFunction(null);
                          setFunctionInputs({});
                          setQueryResult(null);
                          setExecutionResult(null);
                          setPaymentAmount('');
                          setPaymentToken('');
                        }}
                      >
                        🎲 Dice
                      </button>
                      <button
                        className={`preset-btn ${selectedPreset === 'factorial' ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedPreset('factorial');
                          setUploadedABI(factorialABI as ExtendedContractABI);
                          setContractAddress(EXAMPLE_CONTRACTS.factorial);
                          setSelectedFunction(null);
                          setFunctionInputs({});
                          setQueryResult(null);
                          setExecutionResult(null);
                          setPaymentAmount('');
                          setPaymentToken('');
                        }}
                      >
                        ➗ Factorial
                      </button>
                      <button
                        className={`preset-btn ${selectedPreset === 'custom' ? 'active' : ''}`}
                        onClick={() => {
                          setSelectedPreset('custom');
                          setUploadedABI(null);
                          setContractAddress('');
                          setSelectedFunction(null);
                          setFunctionInputs({});
                          setQueryResult(null);
                          setExecutionResult(null);
                          setPaymentAmount('');
                          setPaymentToken('');
                        }}
                      >
                        📄 Custom
                      </button>
                    </div>
                  </div>

                  {/* ABI Upload - only show for custom */}
                  {selectedPreset === 'custom' && (
                    <div
                      className={`abi-upload-section ${isDragging ? 'dragging' : ''}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-outline"
                      >
                        📁 Upload ABI
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleABIUpload}
                        style={{ display: 'none' }}
                      />
                      {uploadedABI && (
                        <span className="abi-name">{uploadedABI.name || 'Custom ABI loaded'}</span>
                      )}
                      {!uploadedABI && <span className="abi-hint">or drag & drop JSON file</span>}
                    </div>
                  )}

                  {/* Contract Address */}
                  <div className="form-group">
                    <label>Contract Address</label>
                    <input
                      type="text"
                      placeholder="klv1..."
                      value={contractAddress}
                      onChange={(e) => setContractAddress(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  {/* Function Selection */}
                  {uploadedABI && (
                    <div className="form-group">
                      <label>Function</label>
                      <select
                        value={selectedFunction?.name || ''}
                        onChange={(e) => {
                          const func = uploadedABI.endpoints.find((f) => f.name === e.target.value);
                          setSelectedFunction(func || null);
                          setFunctionInputs({});
                          setQueryResult(null);
                          setExecutionResult(null);
                          setPaymentAmount('');
                          // Set default token if function is payable
                          if (func?.payableInTokens && func.payableInTokens.length > 0) {
                            setPaymentToken(
                              func.payableInTokens[0] === '*' ? '' : func.payableInTokens[0]
                            );
                          } else {
                            setPaymentToken('');
                          }
                        }}
                        className="form-select"
                      >
                        <option value="">Select a function</option>
                        {uploadedABI.endpoints.map((func) => (
                          <option key={func.name} value={func.name}>
                            {func.name}()
                            {func.mutability === 'readonly' ? '👁️' : '✏️'}
                            {func.payableInTokens && func.payableInTokens.length > 0 ? ' 💰' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Function Inputs */}
                  {selectedFunction && selectedFunction.inputs.length > 0 && (
                    <div className="function-inputs">
                      <h4>Function Parameters</h4>
                      {selectedFunction.inputs.map((input) => {
                        // Check if this input type is an enum
                        const enumType = uploadedABI?.types?.[input.type];
                        const isEnum = enumType?.type === 'enum';

                        return (
                          <div key={input.name} className="form-group">
                            <label>
                              {input.name} ({input.type})
                            </label>
                            {isEnum && enumType.variants ? (
                              <select
                                value={functionInputs[input.name] || ''}
                                onChange={(e) =>
                                  setFunctionInputs({
                                    ...functionInputs,
                                    [input.name]: e.target.value,
                                  })
                                }
                                className="form-select"
                              >
                                <option value="">Select {input.type}</option>
                                {enumType.variants.map((variant) => (
                                  <option key={variant.name} value={variant.discriminant}>
                                    {variant.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                placeholder={`Enter ${input.type}`}
                                value={functionInputs[input.name] || ''}
                                onChange={(e) =>
                                  setFunctionInputs({
                                    ...functionInputs,
                                    [input.name]: e.target.value,
                                  })
                                }
                                className="form-input"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Payment Fields for Payable Functions */}
                  {selectedFunction &&
                    selectedFunction.payableInTokens &&
                    selectedFunction.payableInTokens.length > 0 && (
                      <div className="payment-section">
                        <h4>Payment Details</h4>
                        <div className="form-row">
                          <div className="form-group">
                            <label>Token</label>
                            {selectedFunction.payableInTokens.includes('*') ? (
                              <input
                                type="text"
                                placeholder="Enter token ID (e.g., KLV, KDA-XXX)"
                                value={paymentToken}
                                onChange={(e) => setPaymentToken(e.target.value)}
                                className="form-input"
                              />
                            ) : (
                              <select
                                value={paymentToken || selectedFunction.payableInTokens[0]}
                                onChange={(e) => setPaymentToken(e.target.value)}
                                className="form-select"
                              >
                                {selectedFunction.payableInTokens.map((token) => (
                                  <option key={token} value={token}>
                                    {token}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                          <div className="form-group">
                            <label>Amount</label>
                            <input
                              type="number"
                              placeholder="0.0"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              className="form-input"
                              step="0.000001"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Execute Button */}
                  {selectedFunction && (
                    <button
                      onClick={handleSmartContractCall}
                      disabled={!isConnected || isLoading || isWaitingForTx}
                      className={`btn ${selectedFunction.mutability === 'readonly' ? 'btn-info' : 'btn-advanced'}`}
                    >
                      {isLoading ? (
                        'Processing...'
                      ) : isWaitingForTx ? (
                        <>
                          <span className="spinner"></span> Waiting for confirmation...
                        </>
                      ) : selectedFunction.mutability === 'readonly' ? (
                        'Query'
                      ) : (
                        'Execute'
                      )}
                    </button>
                  )}

                  {/* Query Result */}
                  {queryResult && (
                    <div className="query-result">
                      <h4>Query Result</h4>
                      {queryResult.parsed !== null && queryResult.parsed !== undefined ? (
                        <>
                          <div className="query-result-section">
                            <h5>Parsed Result:</h5>
                            <CodeBlock
                              language="json"
                              code={JSON.stringify(queryResult.parsed, null, 2)}
                            />
                          </div>
                          <div className="query-result-section">
                            <h5>Raw Result:</h5>
                            <CodeBlock
                              language="json"
                              code={JSON.stringify(queryResult.raw, null, 2)}
                            />
                          </div>
                        </>
                      ) : (
                        <div className="query-result-section">
                          <h5>Raw Result:</h5>
                          <CodeBlock
                            language="json"
                            code={JSON.stringify(queryResult.raw, null, 2)}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Execution Result */}
                  {executionResult && (
                    <div className="execution-result">
                      <h4>Transaction Result</h4>
                      <div className="result-content">
                        <div className="result-item">
                          <span className="result-label">Transaction Hash:</span>
                          <code className="result-value">{executionResult.hash}</code>
                        </div>
                        <div className="result-item">
                          <span className="result-label">Status:</span>
                          <span className={`result-status ${executionResult.status}`}>
                            {executionResult.status === 'pending' && '⏳ Pending'}
                            {executionResult.status === 'confirmed' && '✅ Confirmed'}
                            {executionResult.status === 'failed' && '❌ Failed'}
                          </span>
                        </div>

                        {/* Show failure reason if transaction failed */}
                        {executionResult.results?.status === 'fail' &&
                          executionResult.results?.resultCode && (
                            <div className="result-item">
                              <span className="result-label">Failure Reason:</span>
                              <span className="result-error">
                                {executionResult.results.resultCode}
                              </span>
                            </div>
                          )}

                        {/* Transaction Details */}
                        {executionResult.results && (
                          <>
                            {/* Show decoded return values if available */}
                            {executionResult.decodedData &&
                              executionResult.decodedData.values.length > 0 && (
                                <div className="decoded-results">
                                  <h5>Decoded Return Values:</h5>
                                  <div className="decoded-values">
                                    {executionResult.decodedData.values.map(
                                      (decodedValue, index) => (
                                        <div key={index} className="result-item">
                                          <span className="result-label">
                                            {selectedFunction?.outputs?.[index]?.name ||
                                              `Return Value ${index + 1}`}
                                            ({decodedValue.type}):
                                          </span>
                                          <span className="result-value">
                                            {typeof decodedValue.value === 'object'
                                              ? JSON.stringify(decodedValue.value, null, 2)
                                              : String(decodedValue.value)}
                                          </span>
                                        </div>
                                      )
                                    )}
                                  </div>

                                  {/* Show raw hex values for reference */}
                                  <details className="raw-data-details">
                                    <summary>Raw Hex Values</summary>
                                    <CodeBlock
                                      language="json"
                                      code={JSON.stringify(
                                        executionResult.decodedData.raw,
                                        null,
                                        2
                                      )}
                                    />
                                  </details>
                                </div>
                              )}

                            {executionResult.results.receipts &&
                              executionResult.results.receipts.length > 0 && (
                                <div className="result-item">
                                  <span className="result-label">Receipts:</span>
                                  <span>{executionResult.results.receipts.length} receipt(s)</span>
                                </div>
                              )}

                            {/* Show all receipts */}
                            {executionResult.results.receipts &&
                              executionResult.results.receipts.length > 0 && (
                                <div className="contract-results">
                                  <h5>Transaction Receipts:</h5>
                                  <CodeBlock
                                    language="json"
                                    code={JSON.stringify(executionResult.results.receipts, null, 2)}
                                  />
                                </div>
                              )}

                            {/* Show logs if available */}
                            {executionResult.results.logs && (
                              <div className="transaction-logs">
                                <h5>Transaction Logs:</h5>
                                <CodeBlock
                                  language="json"
                                  code={JSON.stringify(executionResult.results.logs, null, 2)}
                                />
                              </div>
                            )}
                          </>
                        )}

                        {executionResult.status !== 'pending' && (
                          <div className="result-actions">
                            <a
                              href={getExplorerUrl(executionResult.hash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline btn-sm"
                            >
                              View on Explorer →
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Transaction History */}
          {transactions.length > 0 && (
            <div className="transaction-history-section">
              <div className="section-header">
                <h2>Recent Transactions</h2>
                <div className="section-actions">
                  <button onClick={copyAllTransactionHashes} className="btn btn-sm btn-outline">
                    📋 Copy All
                  </button>
                  <button onClick={clearTransactionHistory} className="btn btn-sm btn-outline">
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
                        href={getExplorerUrl(tx.hash)}
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
          )}
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
