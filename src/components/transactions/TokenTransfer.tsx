import { useState } from 'react';
import {
  useKlever,
  useTransaction,
  useTransactionMonitor,
  type TransactionMonitorStatus,
  type TransactionMonitorResult,
} from '@klever/connect-react';
import type { ITransactionResponse, TransactionReceipt } from '@klever/connect-provider';
import { parseUnits, COMMON_ASSETS } from '@klever/connect-core';
import { useToast } from '@/hooks';
import { TransactionResult } from '@/components/ui/TransactionResult';
import type { RecentTransaction } from './TransactionHistory';
import { validateKleverAddress, validateAmount, validateKdaId } from '@/utils/validation';
import '@/components/ui/FormValidation.css';

interface TokenTransferProps {
  tokenType: 'KLV' | 'KDA';
  onTransactionComplete: (tx: RecentTransaction) => void;
  onTransactionStatusUpdate?: (hash: string, status: 'confirmed' | 'failed') => void;
}

/**
 * Get the precision for a token/asset
 * Checks COMMON_ASSETS first, then fetches from API if needed
 */
async function getAssetPrecision(assetId: string, apiUrl: string): Promise<number> {
  // Check if it's a common asset (KLV or KFI)
  const commonAsset = COMMON_ASSETS[assetId as keyof typeof COMMON_ASSETS];
  if (commonAsset) {
    return commonAsset.precision;
  }

  // Fetch from API for other assets
  try {
    const response = await fetch(`${apiUrl}/v1.0/assets/${assetId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch asset info: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data?.asset?.precision ?? 0; // Default to 0 if not found
  } catch (error) {
    console.warn(`Failed to fetch precision for ${assetId}, defaulting to 0:`, error);
    return 0; // Default precision
  }
}

export const TokenTransfer = ({
  tokenType,
  onTransactionComplete,
  onTransactionStatusUpdate,
}: TokenTransferProps) => {
  const { isConnected, currentNetwork, provider } = useKlever();
  const { addToast } = useToast();

  const [recipient, setRecipient] = useState(
    'klv13pujlg8a8v9ypv2v499tqlzqqptqf6f3as44f0s6l46zsyjzu28sdqd7x0'
  );
  const [amount, setAmount] = useState('');
  const [kdaId, setKdaId] = useState('');
  const [result, setResult] = useState<{
    hash: string;
    status: 'pending' | 'confirmed' | 'failed';
    results?: ITransactionResponse | null;
  } | null>(null);

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
      setResult((prev) => (prev ? { ...prev, status: status.status } : null));
    },
    onComplete: (monitorResult: TransactionMonitorResult) => {
      // Update parent component
      if (onTransactionStatusUpdate) {
        onTransactionStatusUpdate(monitorResult.hash, monitorResult.status);
      }

      // Update local state with full results
      setResult({
        hash: monitorResult.hash,
        status: monitorResult.status,
        results: monitorResult.transaction,
      });

      // Show toast
      if (monitorResult.status === 'confirmed') {
        addToast({ title: 'Success', message: 'Transaction confirmed!', type: 'success' });
      } else {
        addToast({ title: 'Error', message: 'Transaction failed', type: 'error' });
      }
    },
    onError: (error: Error) => {
      console.error('Error monitoring transaction:', error);
    },
  });

  const { sendKLV, sendKDA, isLoading, reset } = useTransaction({
    onSuccess: async (receipt: TransactionReceipt) => {
      const txType = tokenType === 'KLV' ? `Send ${amount} KLV` : `Send ${amount} ${kdaId}`;

      const newTx: RecentTransaction = {
        hash: receipt.hash,
        type: txType,
        timestamp: new Date(),
        status: 'pending',
      };
      onTransactionComplete(newTx);

      // Set pending state
      setResult({ hash: receipt.hash, status: 'pending' });

      // Start monitoring the transaction
      monitor(receipt.hash);
    },
    onError: (error: Error) => {
      addToast({
        title: 'Error',
        message: `Transaction failed: ${error.message}`,
        type: 'error',
      });
    },
  });

  // Validation handlers
  const validateField = (field: string, value: string) => {
    let validation: { isValid: boolean; error?: string };

    switch (field) {
      case 'recipient':
        validation = validateKleverAddress(value);
        break;
      case 'amount':
        validation = validateAmount(value);
        break;
      case 'kdaId':
        validation = validateKdaId(value);
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

  const handleSend = async () => {
    // Mark all fields as touched
    setTouched({
      recipient: true,
      amount: true,
      ...(tokenType === 'KDA' && { kdaId: true }),
    });

    // Validate all fields
    const recipientValidation = validateKleverAddress(recipient);
    const amountValidation = validateAmount(amount);
    const kdaValidation = tokenType === 'KDA' ? validateKdaId(kdaId) : { isValid: true };

    const newErrors: Record<string, string> = {};
    if (!recipientValidation.isValid) newErrors.recipient = recipientValidation.error || '';
    if (!amountValidation.isValid) newErrors.amount = amountValidation.error || '';
    if (!kdaValidation.isValid) newErrors.kdaId = kdaValidation.error || '';

    setErrors(newErrors);

    // Stop if there are errors
    if (Object.keys(newErrors).length > 0) {
      addToast({
        title: 'Validation Error',
        message: 'Please fix the errors before submitting',
        type: 'error',
      });
      return;
    }

    try {
      // Clear previous result
      setResult(null);
      reset();

      // Get the asset ID (KLV or the KDA ID)
      const assetId = tokenType === 'KLV' ? 'KLV' : kdaId;

      // Get the API URL from the provider's network config
      const apiUrl = provider?.getNetwork().config.api || 'https://api.testnet.klever.org';

      // Get the precision for this asset
      const precision = await getAssetPrecision(assetId, apiUrl);

      // Convert to minimum units using parseUnits with correct precision
      const amountInUnits = Number(parseUnits(amount, precision));

      // Send tokens using the appropriate helper method
      if (tokenType === 'KLV') {
        await sendKLV(recipient, amountInUnits);
      } else {
        await sendKDA(recipient, amountInUnits, kdaId);
      }

      // Clear form after successful submission
      setRecipient('');
      setAmount('');
      setKdaId('');
    } catch (error) {
      console.error(`Failed to send ${tokenType}:`, error);
      addToast({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to send transaction',
        type: 'error',
      });
    }
  };

  return (
    <div className="transaction-card">
      <div className="card-header">
        <h3>
          <span className="card-icon">{tokenType === 'KLV' ? '💸' : '💎'}</span>
          {tokenType} Transfer
        </h3>
      </div>
      <div className="card-content">
        {/* Recipient Address Field */}
        <div className={`form-group ${errors.recipient && touched.recipient ? 'error' : ''}`}>
          <label>Recipient Address</label>
          <input
            type="text"
            className="form-input"
            placeholder="klv..."
            value={recipient}
            onChange={(e) => {
              setRecipient(e.target.value);
              if (touched.recipient) validateField('recipient', e.target.value);
            }}
            onBlur={() => handleBlur('recipient', recipient)}
            disabled={!isConnected || isLoading}
          />
          {errors.recipient && touched.recipient && (
            <span className="validation-icon error-icon">❌</span>
          )}
          {errors.recipient && touched.recipient && (
            <span className="error-message">{errors.recipient}</span>
          )}
        </div>

        {/* KDA ID Field (only for KDA transfers) */}
        {tokenType === 'KDA' && (
          <div className={`form-group ${errors.kdaId && touched.kdaId ? 'error' : ''}`}>
            <label>KDA ID</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., KFI, DVK"
              value={kdaId}
              onChange={(e) => {
                setKdaId(e.target.value.toUpperCase());
                if (touched.kdaId) validateField('kdaId', e.target.value);
              }}
              onBlur={() => handleBlur('kdaId', kdaId)}
              disabled={!isConnected || isLoading}
            />
            {errors.kdaId && touched.kdaId && (
              <span className="validation-icon error-icon">❌</span>
            )}
            {errors.kdaId && touched.kdaId && <span className="error-message">{errors.kdaId}</span>}
          </div>
        )}

        {/* Amount Field */}
        <div className={`form-group ${errors.amount && touched.amount ? 'error' : ''}`}>
          <label>Amount {tokenType === 'KLV' && '(KLV)'}</label>
          <input
            type="number"
            className="form-input"
            placeholder="0.0"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (touched.amount) validateField('amount', e.target.value);
            }}
            onBlur={() => handleBlur('amount', amount)}
            disabled={!isConnected || isLoading}
            step="0.000001"
            min="0"
          />
          {errors.amount && touched.amount && (
            <span className="validation-icon error-icon">❌</span>
          )}
          {errors.amount && touched.amount && (
            <span className="error-message">{errors.amount}</span>
          )}
        </div>

        <button
          onClick={handleSend}
          disabled={!isConnected || isLoading || !currentNetwork}
          className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
        >
          {isLoading ? 'Sending...' : `Send ${tokenType}`}
        </button>

        {/* Display transaction result */}
        {result && (
          <TransactionResult
            hash={result.hash}
            status={result.status}
            results={result.results}
            provider={provider}
          />
        )}
      </div>
    </div>
  );
};
