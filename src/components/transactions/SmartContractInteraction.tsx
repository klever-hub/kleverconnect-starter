import { useState, useRef } from 'react';
import { useKlever, useTransactionMonitor } from '@klever/connect-react';
import type { TransactionMonitorStatus, TransactionMonitorResult } from '@klever/connect-react';
import type { ITransactionResponse } from '@klever/connect-provider';
import { ABIDecoder, Contract, loadABI } from '@klever/connect-contracts';
import type { DecodedReturnData, ContractABI, ABIEndpoint } from '@klever/connect-contracts';
import { useToast } from '@/hooks';
import { TransactionResult } from '@/components/ui/TransactionResult';
import { CodeBlock } from '@/components/tutorial/steps/CodeBlock';
import adderABIData from '@/assets/adder.abi.json';
import diceABIData from '@/assets/dice.abi.json';
import factorialABIData from '@/assets/factorial.abi.json';
import type { RecentTransaction } from './TransactionHistory';
import { validateContractAddress, validateAmount } from '@/utils/validation';
import { SmartContractTip } from '@/components/ui/DeveloperTip';
import '@/components/ui/FormValidation.css';

// Cast ABI data to proper types
const adderABI = loadABI(adderABIData);
const diceABI = loadABI(diceABIData);
const factorialABI = loadABI(factorialABIData);

interface SmartContractInteractionProps {
  onTransactionComplete: (tx: RecentTransaction) => void;
  onTransactionStatusUpdate?: (hash: string, status: 'confirmed' | 'failed') => void;
}

const EXAMPLE_CONTRACTS = {
  adder: 'klv1qqqqqqqqqqqqqpgq047u8r93juez59vquuhcglxg8lvgt9080n0q2ecetn',
  dice: 'klv1qqqqqqqqqqqqqpgqaz3ul663fcfs5vzuytc9y07750407gta0n0q57kjzh',
  factorial: 'klv1qqqqqqqqqqqqqpgqmcy5hujnhqrxd82z93tc0wpeezsm05yp0n0qenh6hq',
};

export const SmartContractInteraction = ({
  onTransactionComplete,
  onTransactionStatusUpdate,
}: SmartContractInteractionProps) => {
  const { isConnected, wallet, provider } = useKlever();
  const { addToast } = useToast();

  // Smart Contract States
  const [contractAddress, setContractAddress] = useState(EXAMPLE_CONTRACTS.adder);
  const [selectedFunction, setSelectedFunction] = useState<ABIEndpoint | null>(null);
  const [functionInputs, setFunctionInputs] = useState<Record<string, string>>({});
  const [queryResult, setQueryResult] = useState<unknown | null>(null);
  const [executionResult, setExecutionResult] = useState<{
    hash: string;
    status: 'pending' | 'confirmed' | 'failed';
    results?: ITransactionResponse | null;
    returnData?: DecodedReturnData;
  } | null>(null);
  const [uploadedABI, setUploadedABI] = useState<ContractABI | null>(adderABI);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<'adder' | 'dice' | 'factorial' | 'custom'>(
    'adder'
  );
  const [isWaitingForTx, setIsWaitingForTx] = useState(false);
  const [paymentToken, setPaymentToken] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);

  // Validation state
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Set up transaction monitor
  const { monitor } = useTransactionMonitor({
    initialDelay: 1500,
    fetchResults: true,
    provider: provider,
    onStatusUpdate: (status: TransactionMonitorStatus) => {
      // Update local state with current status
      setExecutionResult((prev) => (prev ? { ...prev, status: status.status } : null));
    },
    onComplete: async (result: TransactionMonitorResult) => {
      // Update parent component
      if (onTransactionStatusUpdate) {
        onTransactionStatusUpdate(result.hash, result.status);
      }

      if (result.status === 'failed' || !result.transaction) {
        setIsWaitingForTx(false);
        addToast({
          title: 'Transaction Failed',
          message: 'The transaction has failed.',
          type: 'error',
        });
        return;
      }

      // get the return data if any
      const returnData = result.transaction.logs?.events?.find(
        (e) => e.identifier === 'ReturnData'
      )?.data;

      let decodeData: DecodedReturnData = {
        raw: returnData || [],
        values: [],
      };
      // check if need to decode
      if (
        uploadedABI &&
        selectedFunction &&
        returnData &&
        returnData.length > 0 &&
        selectedFunction.outputs &&
        selectedFunction.outputs.length > 0
      ) {
        const decoder = new ABIDecoder(uploadedABI);
        decodeData = decoder.decodeFunctionResultsWithMetadata(
          selectedFunction.name,
          returnData,
          'hex'
        );
      }

      // Update local state with full results
      setExecutionResult({
        hash: result.hash,
        status: result.status,
        results: result.transaction,
        returnData: decodeData,
      });
      setIsWaitingForTx(false);

      // Show toast
      if (result.status === 'confirmed') {
        addToast({
          title: 'Success',
          message: 'Transaction confirmed!',
          type: 'success',
        });
      }
    },
    onError: (error: Error) => {
      console.error('Error monitoring transaction:', error);
      setIsWaitingForTx(false);
    },
  });

  // Create contract instance if all required data is available
  const contract =
    uploadedABI && contractAddress && wallet
      ? new Contract(contractAddress, uploadedABI, wallet)
      : null;

  // Validation handlers
  const validateField = (field: string, value: string) => {
    let validation: { isValid: boolean; error?: string };

    switch (field) {
      case 'contractAddress':
        validation = validateContractAddress(value);
        break;
      case 'paymentAmount':
        validation = validateAmount(value);
        break;
      default:
        return;
    }

    setErrors((prev) => ({
      ...prev,
      [field]: validation.error || '',
    }));
  };

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const handleSmartContractCall = async () => {
    if (!selectedFunction || !contractAddress) {
      addToast({ title: 'Error', message: 'Please select a function', type: 'error' });
      return;
    }

    if (!contract) {
      addToast({ title: 'Error', message: 'Please upload an ABI file first', type: 'error' });
      return;
    }

    try {
      if (!selectedFunction.inputs) {
        throw new Error('No inputs defined for selected function');
      }

      const params = selectedFunction.inputs.map((input) => functionInputs[input.name || ''] || '');

      if (selectedFunction.mutability === 'readonly') {
        // check if function exists in the contract
        if (!contract.hasFunction(selectedFunction.name)) {
          throw new Error(`Function ${selectedFunction.name} does not exist in contract`);
        }

        try {
          setIsQuerying(true);
          // DEMO NOTE: Using dynamic `call()` method for demonstration purposes.
          // If you know the function name ahead of time, you can call it directly:
          // e.g., `await contract.getSum()` instead of `contract.call('getSum', [])`
          // Direct calls provide better type safety and IDE autocomplete.
          const result = await contract.call(selectedFunction.name, ...params);
          // result will be parsed or raw in hex format if it cannot be parsed
          setQueryResult(result);
          addToast({ title: 'Success', message: 'Query successful!', type: 'success' });
        } catch (err) {
          addToast({
            title: 'Error',
            message: `Query failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
            type: 'error',
          });
        } finally {
          setIsQuerying(false);
        }
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

        // check if function exists in the contract
        if (!contract.hasFunction(selectedFunction.name)) {
          throw new Error(`Function ${selectedFunction.name} does not exist in contract`);
        }

        if (!wallet) {
          throw new Error('Wallet not connected');
        }

        // DEMO NOTE: Using dynamic `invoke()` method for demonstration purposes.
        // If you know the function name ahead of time, you can call it directly:
        // e.g., `await contract.add(5, 10)` instead of `contract.invoke('add', [5, 10])`
        // Direct calls provide better type safety and IDE autocomplete.
        const tx = await contract.invoke(selectedFunction.name, ...params, {
          value: { [paymentTokenId]: paymentValue },
        });

        const txHash = tx.hash;

        if (!txHash) {
          throw new Error('No transaction hash returned');
        }

        if (txHash) {
          const newTx: RecentTransaction = {
            hash: tx.hash,
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
          setExecutionResult({ hash: txHash, status: 'pending' });

          // Start monitoring the transaction
          monitor(txHash);
        } else {
          throw new Error('No transaction hash returned');
        }
      }
    } catch (error) {
      addToast({
        title: 'Error',
        message: `Contract call failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
      setIsWaitingForTx(false);
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

  // Determine if we're loading (either querying or waiting for transaction)
  const isLoading = isQuerying || isWaitingForTx;

  return (
    <div className="transaction-card">
      <div className="card-header">
        <h3>
          <span className="card-icon">📜</span>
          Contract Interaction
        </h3>
        <span className="badge badge-advanced">Advanced</span>
      </div>
      <div className="card-content">
        {/* Developer Tip */}
        <SmartContractTip />
        {/* Contract Preset Selection */}
        <div className="form-group">
          <label>Contract Type</label>
          <div className="preset-buttons">
            <button
              className={`preset-btn ${selectedPreset === 'adder' ? 'active' : ''}`}
              onClick={() => {
                setSelectedPreset('adder');
                setUploadedABI(adderABI);
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
                setUploadedABI(diceABI);
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
                setUploadedABI(factorialABI);
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
            <button onClick={() => fileInputRef.current?.click()} className="btn btn-outline">
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
        <div
          className={`form-group ${errors.contractAddress && touched.contractAddress ? 'error' : ''}`}
        >
          <label>Contract Address</label>
          <input
            type="text"
            placeholder="klv1qqq..."
            value={contractAddress}
            onChange={(e) => {
              setContractAddress(e.target.value);
              if (touched.contractAddress) validateField('contractAddress', e.target.value);
            }}
            onBlur={() => handleBlur('contractAddress', contractAddress)}
            className="form-input"
          />
          {errors.contractAddress && touched.contractAddress && (
            <span className="validation-icon error-icon">❌</span>
          )}
          {errors.contractAddress && touched.contractAddress && (
            <span className="error-message">{errors.contractAddress}</span>
          )}
        </div>

        {/* Function Selection */}
        {uploadedABI && (
          <div className="form-group">
            <label>Function</label>
            <select
              value={selectedFunction?.name || ''}
              onChange={(e) => {
                const func = uploadedABI.endpoints?.find((f) => f.name === e.target.value);
                setSelectedFunction(func || null);
                setFunctionInputs({});
                setQueryResult(null);
                setExecutionResult(null);
                setPaymentAmount('');
                // Set default token if function is payable
                if (func?.payableInTokens && func.payableInTokens.length > 0) {
                  setPaymentToken(func.payableInTokens[0] === '*' ? '' : func.payableInTokens[0]);
                } else {
                  setPaymentToken('');
                }
              }}
              className="form-select"
            >
              <option value="">Select a function</option>
              {uploadedABI.endpoints?.map((func) => (
                <option key={func.name} value={func.name}>
                  {func.name}()
                  {func.mutability === 'readonly' ? ' 👁️' : ' ✏️'}
                  {func.payableInTokens && func.payableInTokens.length > 0 ? ' 💰' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Function Inputs */}
        {selectedFunction && selectedFunction.inputs && selectedFunction.inputs.length > 0 && (
          <div className="function-inputs">
            <h4>Function Parameters</h4>
            {selectedFunction.inputs?.map((input) => {
              // Check if this input type is an enum
              const enumType = uploadedABI?.types?.[input.type];
              const isEnum = enumType?.type === 'enum';

              return (
                <div key={input.name} className="form-group">
                  <label>
                    {input.name || 'Parameter'} ({input.type})
                  </label>
                  {isEnum && enumType.variants ? (
                    <select
                      value={functionInputs[input.name || ''] || ''}
                      onChange={(e) =>
                        setFunctionInputs({
                          ...functionInputs,
                          [input.name || '']: e.target.value,
                        })
                      }
                      className="form-select"
                    >
                      <option value="">Select {input.type}</option>
                      {enumType.variants.map((variant) => {
                        // convert variant discriminant to hex string padding with 0 if needed
                        const value = variant.discriminant?.toString(16).padStart(2, '0');
                        return (
                          <option key={variant.name} value={value}>
                            {variant.name}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder={`Enter ${input.type}`}
                      value={functionInputs[input.name || ''] || ''}
                      onChange={(e) =>
                        setFunctionInputs({
                          ...functionInputs,
                          [input.name || '']: e.target.value,
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
                <div
                  className={`form-group ${errors.paymentAmount && touched.paymentAmount ? 'error' : ''}`}
                >
                  <label>Amount</label>
                  <input
                    type="number"
                    placeholder="0.0"
                    value={paymentAmount}
                    onChange={(e) => {
                      setPaymentAmount(e.target.value);
                      if (touched.paymentAmount) validateField('paymentAmount', e.target.value);
                    }}
                    onBlur={() => handleBlur('paymentAmount', paymentAmount)}
                    className="form-input"
                    step="0.000001"
                  />
                  {errors.paymentAmount && touched.paymentAmount && (
                    <span className="validation-icon error-icon">❌</span>
                  )}
                  {errors.paymentAmount && touched.paymentAmount && (
                    <span className="error-message">{errors.paymentAmount}</span>
                  )}
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
        {queryResult !== null && (
          <div className="query-result">
            <h4>Query Result</h4>
            <div className="query-result-section">
              <h5>✨ Parsed Result:</h5>
              <CodeBlock
                language="json"
                code={JSON.stringify(
                  queryResult,
                  (_key, value) => (typeof value === 'bigint' ? value.toString() : value),
                  2
                )}
              />
            </div>
          </div>
        )}

        {/* Execution Result */}
        {executionResult && (
          <TransactionResult
            hash={executionResult.hash}
            status={executionResult.status}
            results={executionResult.results}
            decodedData={executionResult.returnData}
            functionInfo={selectedFunction || undefined}
            provider={provider}
          />
        )}
      </div>
    </div>
  );
};
