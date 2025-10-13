import { useState } from 'react';
import { CodeBlock } from '@/components/tutorial/steps/CodeBlock';
import type { DecodedReturnData, DecodedReturnValue } from '@klever/connect-contracts';
import type { IProvider, ITransactionResponse } from '@klever/connect-provider';

interface TransactionResultProps {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  results?: ITransactionResponse | null;
  decodedData?: DecodedReturnData | null;
  functionInfo?: {
    name: string;
    outputs?: Array<{ type: string; name?: string }>;
  };
  provider?: IProvider;
}

type ResultTab = 'overview' | 'details' | 'receipts' | 'logs';

export const TransactionResult = ({
  hash,
  status,
  results,
  decodedData,
  functionInfo,
  provider,
}: TransactionResultProps) => {
  const [activeTab, setActiveTab] = useState<ResultTab>('overview');

  const hasReceipts = results?.receipts && results.receipts.length > 0;
  const hasDetails = results?.contract && results.contract.length > 0;
  const hasLogs = results?.logs && Object.keys(results.logs).length > 0;

  return (
    <div className="execution-result">
      <h4>Transaction Result</h4>

      {/* Tabs Navigation */}
      <div className="result-tabs">
        <button
          className={`result-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span className="tab-icon">📊</span>
          <span>Overview</span>
        </button>
        {hasDetails && (
          <button
            className={`result-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <span className="tab-icon">📝</span>
            <span>Details</span>
          </button>
        )}
        {hasReceipts && (
          <button
            className={`result-tab ${activeTab === 'receipts' ? 'active' : ''}`}
            onClick={() => setActiveTab('receipts')}
          >
            <span className="tab-icon">📄</span>
            <span>Receipts</span>
            <span className="tab-badge">{results?.receipts?.length || 0}</span>
          </button>
        )}
        {hasLogs && (
          <button
            className={`result-tab ${activeTab === 'logs' ? 'active' : ''}`}
            onClick={() => setActiveTab('logs')}
          >
            <span className="tab-icon">📋</span>
            <span>Logs</span>
            <span className="tab-badge">
              {results?.logs ? Object.keys(results.logs.events).length : 0}
            </span>
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="result-tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="result-content">
            <div className="result-item">
              <span className="result-label">Transaction Hash:</span>
              <div className="result-hash-wrapper">
                <code className="result-value" title={hash}>
                  {hash.slice(0, 10)}...{hash.slice(-10)}
                </code>
                <button
                  className="copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(hash);
                  }}
                  title="Copy full hash"
                >
                  📋
                </button>
              </div>
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
            {results?.status === 'failed' && results?.resultCode && (
              <div className="result-item">
                <span className="result-label">Failure Reason:</span>
                <span className="result-error">{results.resultCode}</span>
              </div>
            )}

            {/* Show decoded return values in overview */}
            {decodedData && decodedData.values.length > 0 && (
              <div className="decoded-results">
                <h5>📦 Return Values</h5>
                <div className="decoded-values">
                  {decodedData.values.map((decodedValue: DecodedReturnValue, index: number) => {
                    return (
                      <div key={index} className="result-item">
                        <span className="result-label">
                          {functionInfo?.outputs?.[index]?.name || `Return Value ${index + 1}`}
                          <span className="type-hint">({decodedValue.type})</span>
                        </span>
                        <span className="result-value">
                          {typeof decodedValue.value === 'object' ? (
                            <CodeBlock
                              language="json"
                              code={JSON.stringify(decodedValue.value, null, 2)}
                            />
                          ) : (
                            String(decodedValue.value)
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Summary info */}
            {results?.receipts && results.receipts.length > 0 && (
              <div className="result-item">
                <span className="result-label">Receipts:</span>
                <span>{results.receipts.length} receipt(s)</span>
              </div>
            )}

            {status !== 'pending' && (
              <div className="result-actions">
                <a
                  href={
                    provider?.getTransactionUrl(hash) ||
                    `https://kleverscan.org/transaction/${hash}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  View on Explorer →
                </a>
              </div>
            )}
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && hasDetails && (
          <div className="result-content">
            <h5>📝 Transfer Details</h5>
            <CodeBlock language="json" code={JSON.stringify(results?.contract, null, 2)} />
          </div>
        )}

        {/* Receipts Tab */}
        {activeTab === 'receipts' && hasReceipts && (
          <div className="result-content">
            <h5>📄 Transaction Receipts ({results?.receipts?.length})</h5>
            <CodeBlock language="json" code={JSON.stringify(results?.receipts, null, 2)} />
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && hasLogs && (
          <div className="result-content">
            <h5>📋 Transaction Logs</h5>
            <CodeBlock language="json" code={JSON.stringify(results?.logs, null, 2)} />
          </div>
        )}
      </div>
    </div>
  );
};
