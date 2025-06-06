import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useKlever } from '../hooks/useKlever';
import { useToast } from '../hooks/useToast';
import './Faucet.css';

interface FaucetStatus {
  canRequest: boolean;
  message?: string;
  nextRequestTime?: string;
}

export const Faucet = () => {
  const { address, network } = useKlever();
  const { addToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<FaucetStatus | null>(null);
  const [success, setSuccess] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Only show on testnet/devnet
  const shouldShowFaucet = network !== 'mainnet' && address;

  // Check faucet status
  const checkFaucetStatus = async () => {
    if (!address) return;

    setChecking(true);
    try {
      const apiUrl =
        network === 'testnet' ? 'https://api.testnet.klever.org' : 'https://api.devnet.klever.org';

      const response = await fetch(`${apiUrl}/v1.0/transaction/send-user-funds/${address}/status`);
      const { data } = await response.json();

      if (response.ok) {
        setStatus({
          canRequest: data.status === 'Available',
          message:
            data.status === 'Available'
              ? 'You can request funds'
              : 'Please wait 24 hours between requests',
          nextRequestTime: data.nextRequestTime,
        });
      } else {
        setStatus({
          canRequest: true,
          message: 'Unable to check status',
        });
      }
    } catch (error) {
      console.error('Error checking faucet status:', error);
      setStatus({
        canRequest: true,
        message: 'Unable to check status',
      });
    } finally {
      setChecking(false);
    }
  };

  // Request funds from faucet
  const requestFunds = async () => {
    if (!address || !status?.canRequest) return;

    setLoading(true);
    setSuccess(false);

    try {
      const apiUrl =
        network === 'testnet' ? 'https://api.testnet.klever.org' : 'https://api.devnet.klever.org';

      const response = await fetch(`${apiUrl}/v1.0/transaction/send-user-funds/${address}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const { data } = await response.json();

      if (response.ok) {
        setSuccess(true);
        addToast({
          title: 'Success!',
          message: `Test funds sent to your wallet`,
          type: 'success',
        });

        setStatus({
          canRequest: false,
          message: 'Funds sent! Please wait 24 hours before requesting again.',
        });

        // Close modal after 2 seconds
        setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
        }, 2000);
      } else {
        addToast({
          title: 'Request Failed',
          message: data.message || 'Please try again later',
          type: 'error',
        });
      }
    } catch (error) {
      console.error('Error requesting funds:', error);
      addToast({
        title: 'Connection Error',
        message: 'Failed to connect to faucet',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Check status when modal opens
  useEffect(() => {
    if (isOpen && address) {
      checkFaucetStatus();
    }
  }, [isOpen, address]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!shouldShowFaucet) {
    return null;
  }

  return (
    <>
      <button className="faucet-button" onClick={() => setIsOpen(true)} title="Request test funds">
        <span className="faucet-icon">💧</span>
        <span className="faucet-label">Faucet</span>
      </button>

      {isOpen &&
        createPortal(
          <div className="faucet-overlay">
            <div className="faucet-modal" ref={modalRef}>
              <div className="faucet-header">
                <h3>Testnet Faucet</h3>
                <button
                  className="faucet-close"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="faucet-content">
                <p className="faucet-description">Request free {network} KLV for testing</p>

                {/* Address Display */}
                <div className="faucet-address">
                  <span className="faucet-address-label">Your Address</span>
                  <code className="faucet-address-value">
                    {address.slice(0, 10)}...{address.slice(-8)}
                  </code>
                </div>

                {/* Status Display */}
                {checking ? (
                  <div className="faucet-status checking">
                    <span className="faucet-spinner">⏳</span>
                    <span>Checking availability...</span>
                  </div>
                ) : (
                  status && (
                    <div
                      className={`faucet-status ${status.canRequest ? 'available' : 'unavailable'}`}
                    >
                      <span className="status-icon">{status.canRequest ? '✅' : '⏰'}</span>
                      <div className="status-text">
                        <p>{status.message}</p>
                        {status.nextRequestTime && (
                          <p className="status-time">
                            Next request: {new Date(status.nextRequestTime).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                )}

                {/* Request Button */}
                <button
                  className={`faucet-request-btn ${success ? 'success' : ''}`}
                  onClick={requestFunds}
                  disabled={loading || !status?.canRequest || success}
                >
                  {loading ? (
                    <>
                      <span className="btn-spinner">🔄</span>
                      <span>Requesting...</span>
                    </>
                  ) : success ? (
                    <>
                      <span>✅</span>
                      <span>Funds Sent!</span>
                    </>
                  ) : (
                    <>
                      <span>💧</span>
                      <span>Request Test Funds</span>
                    </>
                  )}
                </button>

                {/* Info */}
                <div className="faucet-info">
                  <p>• You will receive test KLV for development</p>
                  <p>• Can request once every 24 hours</p>
                  <p>• These funds have no real value</p>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
