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
  const triggerRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

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

  // Focus management and keyboard handling
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Focus the modal itself first to ensure focus is inside
      setTimeout(() => {
        if (modalRef.current) {
          // Make the modal focusable temporarily
          modalRef.current.setAttribute('tabindex', '-1');
          modalRef.current.focus();

          // Then focus the first interactive element
          const focusableElements = modalRef.current.querySelectorAll(
            'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
          );

          if (focusableElements.length > 0) {
            (focusableElements[0] as HTMLElement).focus();
          }
        }
      }, 100);

      // Handle keyboard events
      const handleKeyDown = (event: KeyboardEvent) => {
        if (!modalRef.current) return;

        if (event.key === 'Escape') {
          setIsOpen(false);
          return;
        }

        // Tab trap
        if (event.key === 'Tab') {
          const focusableElements = modalRef.current.querySelectorAll(
            'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
          );

          if (focusableElements.length === 0) return;

          const focusableArray = Array.from(focusableElements) as HTMLElement[];
          const firstElement = focusableArray[0];
          const lastElement = focusableArray[focusableArray.length - 1];
          const activeElement = document.activeElement;

          // Check if focus is outside modal
          if (!modalRef.current.contains(activeElement)) {
            event.preventDefault();
            firstElement.focus();
            return;
          }

          if (event.shiftKey && activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          } else if (!event.shiftKey && activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      };

      // Use capture phase to intercept all keyboard events
      document.addEventListener('keydown', handleKeyDown, true);

      return () => {
        document.removeEventListener('keydown', handleKeyDown, true);
        // Remove tabindex when unmounting
        if (modalRef.current) {
          modalRef.current.removeAttribute('tabindex');
        }
      };
    } else {
      // Restore focus when modal closes
      if (previousActiveElement.current && previousActiveElement.current.focus) {
        // Use setTimeout to ensure the modal is fully closed
        setTimeout(() => {
          previousActiveElement.current?.focus();
        }, 0);
      }
    }
  }, [isOpen]);

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
      <button
        ref={triggerRef}
        className="faucet-button"
        onClick={() => setIsOpen(true)}
        title="Request test funds"
        aria-label="Open faucet modal to request test funds"
      >
        <span className="faucet-icon">💧</span>
        <span className="faucet-label">Faucet</span>
      </button>

      {isOpen &&
        createPortal(
          <div
            className="faucet-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="faucet-title"
          >
            <div className="faucet-modal" ref={modalRef}>
              <div className="faucet-header">
                <h3 id="faucet-title">Testnet Faucet</h3>
                <button
                  className="faucet-close"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close faucet modal"
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
              {/* Invisible focusable element to detect when focus leaves the modal */}
              <div
                tabIndex={0}
                style={{ position: 'absolute', left: '-9999px' }}
                aria-hidden="true"
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
