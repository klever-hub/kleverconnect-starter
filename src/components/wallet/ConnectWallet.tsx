import { useKlever } from '@klever/connect-react';
import { useToast } from '@/hooks/useToast';
import { useEffect, useRef, useState } from 'react';
import { formatAddress, copyToClipboard } from '@/utils';
import { AddressQRModal } from '@/components/wallet/AddressQRModal';
import './ConnectWallet.css';

export const ConnectWallet = () => {
  const toast = useToast();
  const prevConnectedRef = useRef(false);
  const prevErrorRef = useRef<Error | null | undefined>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const {
    isConnected,
    isConnecting,
    address,
    extensionInstalled,
    searchingExtension,
    currentNetwork,
    connect,
    disconnect,
    error,
  } = useKlever();

  const handleCopyToClipboard = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      toast.success('Copied!', 'Address copied to clipboard');
    } else {
      toast.error('Copy Failed', 'Failed to copy address');
    }
  };

  // Handle connection success and address changes
  useEffect(() => {
    if (isConnected && address) {
      console.log('ConnectWallet - Address:', address);

      if (!prevConnectedRef.current) {
        // Initial connection
        toast.success('Wallet Connected', `Connected to ${formatAddress(address)}`);
      }
    }
    prevConnectedRef.current = isConnected;
  }, [isConnected, address]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track address changes
  const prevAddressRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (address && prevAddressRef.current && address !== prevAddressRef.current) {
      console.log('Account changed from', prevAddressRef.current, 'to', address);
      toast.info('Account Changed', `Switched to ${formatAddress(address)}`);
    }
    prevAddressRef.current = address;
  }, [address, toast]);

  // Handle errors
  useEffect(() => {
    if (error && error !== prevErrorRef.current) {
      toast.error('Connection Error', error.message);
    }
    prevErrorRef.current = error;
  }, [error, toast]);

  const handleConnect = () => {
    try {
      connect();
    } catch {
      // Error is handled by the context and will trigger the error toast
    }
  };

  const handleDisconnect = () => {
    try {
      disconnect();
      toast.info('Wallet Disconnected', 'Your wallet has been disconnected');
    } catch {
      // Error is handled by the context
    }
  };

  if (searchingExtension) {
    return (
      <div className="wallet-connect">
        <button disabled className="btn-connect">
          <span className="connecting-spinner"></span>
          Checking Extension...
        </button>
      </div>
    );
  }

  if (extensionInstalled === false) {
    return (
      <div className="wallet-connect">
        <button
          className="btn-connect"
          onClick={() =>
            window.open(
              'https://chromewebstore.google.com/detail/klever-wallet/ifclboecfhkjbpmhgehodcjpciihhmif',
              '_blank'
            )
          }
        >
          Install Klever Extension
        </button>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <>
        <div className="wallet-connected">
          <button
            className="wallet-qr-btn"
            onClick={() => setShowQRModal(true)}
            title="Show QR code"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </button>
          <button
            className="wallet-address"
            onClick={() => handleCopyToClipboard(address)}
            title="Click to copy address"
          >
            <span className="address-value">{formatAddress(address)}</span>
            <svg
              className="copy-icon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
          <button onClick={handleDisconnect} className="btn-disconnect">
            Disconnect
          </button>
        </div>

        {showQRModal && (
          <AddressQRModal
            address={address}
            network={currentNetwork}
            onClose={() => setShowQRModal(false)}
          />
        )}
      </>
    );
  }

  return (
    <div className="wallet-connect">
      <button onClick={handleConnect} disabled={isConnecting} className="btn-connect">
        {isConnecting ? (
          <>
            <span className="connecting-spinner"></span>
            Connecting...
          </>
        ) : (
          <>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.4 11H3M8.5 11L3 5.5M8.5 11L3 16.5M9 21H21V3H9" />
            </svg>
            Connect Wallet
          </>
        )}
      </button>
    </div>
  );
};
