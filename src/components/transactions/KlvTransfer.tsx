import { useState, useRef, useEffect } from 'react';
import { useTransaction } from '../../hooks/useTransaction';
import { useKlever } from '../../hooks/useKlever';
import { useToast } from '../../hooks/useToast';
import { TransactionResult } from '../TransactionResult';
import type { TransactionResults } from '../../hooks/useTransaction';
import type { Network } from '../../constants/network';

interface RecentTransaction {
  hash: string;
  type: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
}

interface KlvTransferProps {
  onTransactionComplete: (tx: RecentTransaction) => void;
  onTransactionStatusUpdate?: (hash: string, status: 'confirmed' | 'failed') => void;
}

export const KlvTransfer = ({ onTransactionComplete, onTransactionStatusUpdate }: KlvTransferProps) => {
  const { isConnected, network } = useKlever();
  const { sendKLV, waitForTransaction, getTransactionWithResults, isLoading } = useTransaction();
  const { addToast } = useToast();
  const isMountedRef = useRef(true);

  const [tokenRecipient, setTokenRecipient] = useState('');
  const [klvAmount, setKlvAmount] = useState('');
  const [klvResult, setKlvResult] = useState<{
    hash: string;
    status: 'pending' | 'confirmed' | 'failed';
    results?: TransactionResults | null;
  } | null>(null);
  const [isWaitingForKlv, setIsWaitingForKlv] = useState(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
        onTransactionComplete(newTx);

        // Clear form
        setTokenRecipient('');
        setKlvAmount('');

        // Set waiting state
        setIsWaitingForKlv(true);
        setKlvResult({ hash: result.hash, status: 'pending' });

        // Wait for confirmation
        waitForTransaction(result.hash)
          .then(async (confirmed) => {
            // Fetch transaction results
            const txDetails = result.hash ? await getTransactionWithResults(result.hash) : null;

            const finalStatus = confirmed ? 'confirmed' : 'failed';
            setKlvResult({
              hash: result.hash || '',
              status: finalStatus,
              results: txDetails,
            });
            setIsWaitingForKlv(false);

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
            setKlvResult({ hash: result.hash || '', status: 'failed' });
            setIsWaitingForKlv(false);
            
            // Update parent component about failure
            if (onTransactionStatusUpdate && result.hash) {
              onTransactionStatusUpdate(result.hash, 'failed');
            }
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

  return (
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
          <TransactionResult
            hash={klvResult.hash}
            status={klvResult.status}
            results={klvResult.results}
            network={network as Network}
          />
        )}
      </div>
    </div>
  );
};