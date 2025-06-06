import { useState, useRef, useEffect } from 'react';
import { useTransaction } from '../../hooks/useTransaction';
import { useKlever } from '../../hooks/useKlever';
import { useToast } from '../../hooks/useToast';
import { TransactionResult } from '../TransactionResult';
import { CodeBlock } from '../steps/CodeBlock';
import { convertTypedToEncodable } from '../../utils/contractHelpers';
import type { TypedContractParam } from '../../types/contract';
import type { TransactionResults } from '../../hooks/useTransaction';
import type { ContractABI, DecodedReturnData } from '../../utils/abiDecoder';
import type { Network } from '../../constants/network';
import adderABI from '../../assets/adder.abi.json';
import diceABI from '../../assets/dice.abi.json';
import factorialABI from '../../assets/factorial.abi.json';

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

interface RecentTransaction {
  hash: string;
  type: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
}

interface SmartContractInteractionProps {
  onTransactionComplete: (tx: RecentTransaction) => void;
  onTransactionStatusUpdate?: (hash: string, status: 'confirmed' | 'failed') => void;
}

const EXAMPLE_CONTRACTS = {
  adder: 'klv1qqqqqqqqqqqqqpgqxwklx9kjsraqctl36kqekhyh95u5cf8qgz5q33zltk',
  dice: 'klv1qqqqqqqqqqqqqpgqees9prr7ma632ngknhqe55x8wkz49ha5gz5q7vxkn7',
  factorial: 'klv1qqqqqqqqqqqqqpgq4mzhj8ae67slc6cfsjvslw89v4pug5uygz5qdx28tm',
};

export const SmartContractInteraction = ({ onTransactionComplete, onTransactionStatusUpdate }: SmartContractInteractionProps) => {
  const { isConnected, network } = useKlever();
  const {
    callSmartContract,
    queryContract,
    waitForTransaction,
    getTransactionWithResults,
    parseContractResponse,
    decodeTransactionWithABI,
    isLoading,
  } = useTransaction();
  const { addToast } = useToast();
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Smart Contract States
  const [contractAddress, setContractAddress] = useState(EXAMPLE_CONTRACTS.adder);
  const [selectedFunction, setSelectedFunction] = useState<ABIFunction | null>(null);
  const [functionInputs, setFunctionInputs] = useState<Record<string, string>>({});
  const [queryResult, setQueryResult] = useState<{ parsed: unknown; raw: unknown } | null>(null);
  const [executionResult, setExecutionResult] = useState<{
    hash: string;
    status: 'pending' | 'confirmed' | 'failed';
    results?: TransactionResults | null;
    decodedData?: DecodedReturnData | null;
  } | null>(null);
  const [uploadedABI, setUploadedABI] = useState<ExtendedContractABI | null>(
    adderABI as ExtendedContractABI
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<'adder' | 'dice' | 'factorial' | 'custom'>('adder');
  const [isWaitingForTx, setIsWaitingForTx] = useState(false);
  const [paymentToken, setPaymentToken] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');

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
          onTransactionComplete(newTx);

          // Clear inputs
          setFunctionInputs({});
          setPaymentAmount('');

          // Set waiting state
          setIsWaitingForTx(true);
          setExecutionResult({ hash: result.hash, status: 'pending' });

          // Wait for confirmation
          waitForTransaction(result.hash)
            .then(async (confirmed) => {
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

              const finalStatus = confirmed ? 'confirmed' : 'failed';
              setExecutionResult({
                hash: result.hash || '',
                status: finalStatus,
                results: txDetails,
                decodedData,
              });
              setIsWaitingForTx(false);

              // Update parent component about status change
              if (onTransactionStatusUpdate && result.hash) {
                onTransactionStatusUpdate(result.hash, finalStatus);
              }

              // Only show toast if component is still mounted
              if (confirmed && isMountedRef.current) {
                addToast({ title: 'Success', message: 'Transaction confirmed!', type: 'success' });
              }
            })
            .catch(() => {
              setExecutionResult({ hash: result.hash || '', status: 'failed' });
              setIsWaitingForTx(false);
              
              // Update parent component about failure
              if (onTransactionStatusUpdate && result.hash) {
                onTransactionStatusUpdate(result.hash, 'failed');
              }
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
        const abi = JSON.parse(e.target?.result as string) as ContractABI;
        setSelectedPreset('custom');
        setUploadedABI(abi as ExtendedContractABI);
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

  return (
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
          <TransactionResult
            hash={executionResult.hash}
            status={executionResult.status}
            results={executionResult.results}
            decodedData={executionResult.decodedData}
            network={network as Network}
            functionInfo={selectedFunction || undefined}
          />
        )}
      </div>
    </div>
  );
};