import { CodeBlock } from './steps/CodeBlock';
import type { TransactionResults } from '../hooks/useTransaction';
import type { DecodedReturnData } from '../utils/abiDecoder';
import { getExplorerUrl, type Network } from '../constants/network';

interface TransactionResultProps {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  results?: TransactionResults | null;
  decodedData?: DecodedReturnData | null;
  network: Network;
  functionInfo?: {
    name: string;
    outputs?: Array<{ type: string; name?: string }>;
  };
}

export const TransactionResult = ({
  hash,
  status,
  results,
  decodedData,
  network,
  functionInfo,
}: TransactionResultProps) => {
  return (
    <div className="execution-result">
      <h4>Transaction Result</h4>
      <div className="result-content">
        <div className="result-item">
          <span className="result-label">Transaction Hash:</span>
          <code className="result-value">{hash}</code>
        </div>
        <div className="result-item">
          <span className="result-label">Status:</span>
          <span className={`result-status ${status}`}>
            {status === 'pending' && '⏳ Pending'}
            {status === 'confirmed' && '✅ Confirmed'}
            {status === 'failed' && '❌ Failed'}
          </span>
        </div>

        {/* Show failure reason if transaction failed */}
        {results?.status === 'fail' && results?.resultCode && (
          <div className="result-item">
            <span className="result-label">Failure Reason:</span>
            <span className="result-error">{results.resultCode}</span>
          </div>
        )}

        {/* Transaction Details */}
        {results && (
          <>
            {/* Show decoded return values if available */}
            {decodedData && decodedData.values.length > 0 && (
              <div className="decoded-results">
                <h5>Decoded Return Values:</h5>
                <div className="decoded-values">
                  {decodedData.values.map((decodedValue, index) => (
                    <div key={index} className="result-item">
                      <span className="result-label">
                        {functionInfo?.outputs?.[index]?.name || `Return Value ${index + 1}`}
                        ({decodedValue.type}):
                      </span>
                      <span className="result-value">
                        {typeof decodedValue.value === 'object'
                          ? JSON.stringify(decodedValue.value, null, 2)
                          : String(decodedValue.value)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Show raw hex values for reference */}
                <details className="raw-data-details">
                  <summary>Raw Hex Values</summary>
                  <CodeBlock
                    language="json"
                    code={JSON.stringify(decodedData.raw, null, 2)}
                  />
                </details>
              </div>
            )}

            {results.receipts && results.receipts.length > 0 && (
              <div className="result-item">
                <span className="result-label">Receipts:</span>
                <span>{results.receipts.length} receipt(s)</span>
              </div>
            )}

            {/* Show transfer details or receipts */}
            {results.contract && results.contract.length > 0 && (
              <div className="contract-results">
                <h5>Transfer Details:</h5>
                <CodeBlock
                  language="json"
                  code={JSON.stringify(results.contract, null, 2)}
                />
              </div>
            )}

            {/* Show all receipts */}
            {results.receipts && results.receipts.length > 0 && (
              <div className="contract-results">
                <h5>Transaction Receipts:</h5>
                <CodeBlock
                  language="json"
                  code={JSON.stringify(results.receipts, null, 2)}
                />
              </div>
            )}

            {/* Show logs if available */}
            {results.logs && (
              <div className="transaction-logs">
                <h5>Transaction Logs:</h5>
                <CodeBlock
                  language="json"
                  code={JSON.stringify(results.logs, null, 2)}
                />
              </div>
            )}
          </>
        )}

        {status !== 'pending' && (
          <div className="result-actions">
            <a
              href={getExplorerUrl(network, hash)}
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
  );
};