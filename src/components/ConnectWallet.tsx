import { useKlever } from '../hooks/useKlever';
import { useToast } from '../hooks/useToast';
import { useEffect, useRef } from 'react';
import './ConnectWallet.css';

export const ConnectWallet = () => {
  const toast = useToast();
  const prevConnectedRef = useRef(false);
  const prevErrorRef = useRef<Error | null>(null);
  const {
    isConnected,
    isConnecting,
    address,
    extensionInstalled,
    searchingExtension,
    connect,
    disconnect,
    error,
  } = useKlever();

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied!', 'Address copied to clipboard');
    } catch {
      toast.error('Copy Failed', 'Failed to copy address');
    }
  };

  // Handle connection success
  useEffect(() => {
    if (isConnected && address && !prevConnectedRef.current) {
      const formattedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
      toast.success('Wallet Connected', `Connected to ${formattedAddress}`);
    }
    prevConnectedRef.current = isConnected;
  }, [isConnected, address, toast]);

  // Handle errors
  useEffect(() => {
    if (error && error !== prevErrorRef.current) {
      toast.error('Connection Error', error.message);
    }
    prevErrorRef.current = error;
  }, [error, toast]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch {
      // Error is handled by the context and will trigger the error toast
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.info('Wallet Disconnected', 'Your wallet has been disconnected');
    } catch {
      // Error is handled by the context
    }
  };

  if (isConnected && address) {
    return (
      <div className="wallet-connected">
        <button
          className="wallet-address"
          onClick={() => copyToClipboard(address)}
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
    );
  }

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
        <a href="https://klever.io/en/wallet" target="_blank" rel="noopener noreferrer">
          <button className="btn-connect">Install Klever Extension</button>
        </a>
      </div>
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
