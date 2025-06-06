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

interface KdaTransferProps {
  onTransactionComplete: (tx: RecentTransaction) => void;
  onTransactionStatusUpdate?: (hash: string, status: 'confirmed' | 'failed') => void;
}

export const KdaTransfer = ({ onTransactionComplete, onTransactionStatusUpdate }: KdaTransferProps) => {
  const { isConnected, network } = useKlever();
  const { sendKDA, waitForTransaction, getTransactionWithResults, isLoading } = useTransaction();
  const { addToast } = useToast();
  const isMountedRef = useRef(true);

  const [tokenRecipient, setTokenRecipient] = useState('');
  const [kdaId, setKdaId] = useState('');
  const [kdaAmount, setKdaAmount] = useState('');
  const [kdaResult, setKdaResult] = useState<{
    hash: string;
    status: 'pending' | 'confirmed' | 'failed';
    results?: TransactionResults | null;
  } | null>(null);
  const [isWaitingForKda, setIsWaitingForKda] = useState(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

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
        onTransactionComplete(newTx);

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
            // Fetch transaction results
            const txDetails = result.hash ? await getTransactionWithResults(result.hash) : null;

            const finalStatus = confirmed ? 'confirmed' : 'failed';
            setKdaResult({
              hash: result.hash || '',
              status: finalStatus,
              results: txDetails,
            });
            setIsWaitingForKda(false);

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
            setKdaResult({ hash: result.hash || '', status: 'failed' });
            setIsWaitingForKda(false);
            
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
      setIsWaitingForKda(false);
    }
  };

  return (
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
          <TransactionResult
            hash={kdaResult.hash}
            status={kdaResult.status}
            results={kdaResult.results}
            network={network as Network}
          />
        )}
      </div>
    </div>
  );
};