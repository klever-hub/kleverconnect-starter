import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { web, TransactionType } from '@klever/sdk-web';
import type { IContractRequest, ITransfer } from '@klever/sdk-web';
import { NETWORK_CONFIG as CENTRALIZED_CONFIG, type Network } from '../constants/network';

export type NetworkType = Network;

export interface Balance {
  amount: number;
  token: string;
  decimals: number;
}

export interface Transaction {
  to: string;
  from?: string;
  amount: number;
  token?: string;
  fee?: number;
  message?: string;
}

export interface TransactionResponse {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  blockNumber?: number;
  timestamp?: number;
}

export interface KleverContextType {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  address: string | null;

  // Network state
  network: NetworkType;

  // Balance state
  balance: Balance | null;
  isLoadingBalance: boolean;

  // Extension state
  extensionInstalled: boolean | undefined;
  searchingExtension: boolean;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: (network: NetworkType) => Promise<void>;
  refreshBalance: () => Promise<void>;
  sendTransaction: (tx: Transaction) => Promise<string>;

  // Error state
  error: Error | null;
}

const KleverContext = createContext<KleverContextType | undefined>(undefined);

export { KleverContext };

interface KleverProviderProps {
  children: ReactNode;
}

// Get network config from centralized location
const NETWORK_CONFIG = {
  mainnet: {
    api: CENTRALIZED_CONFIG.mainnet.api,
    node: CENTRALIZED_CONFIG.mainnet.nodeUrl,
  },
  testnet: {
    api: CENTRALIZED_CONFIG.testnet.api,
    node: CENTRALIZED_CONFIG.testnet.nodeUrl,
  },
  devnet: {
    api: CENTRALIZED_CONFIG.devnet.api,
    node: CENTRALIZED_CONFIG.devnet.nodeUrl,
  },
};

interface KleverHub {
  initialize: () => Promise<void>;
  onAccountChanged: (
    callback: (event: { chain: string | number; address: string }) => void
  ) => void;
  on?: (event: string, handler: (accounts: string[]) => void) => void;
  off?: (event: string, handler: (accounts: string[]) => void) => void;
}

interface KleverWeb {
  provider?: {
    api: string;
    node: string;
  };
  getAccountDetails: () => Promise<{ balance: number } | null>;
}

declare global {
  interface Window {
    kleverWeb?: KleverWeb;
    kleverHub?: KleverHub;
  }
}

// Track if account change listener is set up
let accountChangeListenerSetup = false;

export const KleverProvider = ({ children }: KleverProviderProps) => {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  // Network state - initialize from localStorage or default to testnet
  const [network, setNetwork] = useState<NetworkType>(() => {
    const savedNetwork = localStorage.getItem('klever-network');
    return (savedNetwork as NetworkType) || 'testnet';
  });

  // Balance state
  const [balance, setBalance] = useState<Balance | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Extension state
  const [extensionInstalled, setExtensionInstalled] = useState<boolean | undefined>();
  const [searchingExtension, setSearchingExtension] = useState(true);

  // Error state
  const [error, setError] = useState<Error | null>(null);

  // Use ref to avoid circular dependency
  const refreshBalanceRef = useRef<((addr?: string) => Promise<void>) | null>(null);

  // Refresh balance
  const refreshBalance = useCallback(
    async (addr?: string) => {
      const walletAddress = addr || address;
      if (!walletAddress || !window.kleverWeb) return;

      try {
        setIsLoadingBalance(true);
        setError(null);

        const account = await window.kleverWeb.getAccountDetails();
        if (account) {
          setBalance({
            amount: account.balance / 1_000_000 || 0, // Convert from precision 6
            token: 'KLV',
            decimals: 6,
          });
        }
      } catch (err) {
        // if account is not found, set balance to null
        // no error is thrown in this case
        setBalance(null);
        console.error('Balance error:', err);
      } finally {
        setIsLoadingBalance(false);
      }
    },
    [address]
  );

  // Setup account change listener
  const setupAccountChangeListener = useCallback(() => {
    if (window.kleverHub?.onAccountChanged && !accountChangeListenerSetup) {
      window.kleverHub.onAccountChanged((e) => {
        if ((e.chain === 'KLV' || e.chain === 1) && e.address.length === 62) {
          setAddress(e.address);
          setIsConnected(true);
          if (refreshBalanceRef.current) {
            refreshBalanceRef.current(e.address);
          }
        } else {
          setIsConnected(false);
          setAddress(null);
          setBalance(null);
        }
      });
      accountChangeListenerSetup = true;
    }
  }, []);

  // Auto-connect if extension is available and wallet was previously connected
  const connectExtension = useCallback(async () => {
    if (typeof window !== 'undefined' && window.kleverWeb?.provider) {
      window.kleverWeb.provider = NETWORK_CONFIG[network];
    }
    web.setProvider(NETWORK_CONFIG[network]);

    try {
      if (!web.isKleverWebActive()) {
        if (window.kleverHub !== undefined) {
          await window.kleverHub.initialize();
          setupAccountChangeListener();
        } else {
          await web.initialize();
        }
      }
      const addr = web.getWalletAddress();
      if (addr && addr.startsWith('klv') && addr.length === 62) {
        setAddress(addr);
        setIsConnected(true);
        setupAccountChangeListener();
        // Refresh balance after auto-connect
        if (refreshBalanceRef.current) {
          await refreshBalanceRef.current(addr);
        }
      }
    } catch {
      // Silent fail for auto-connect
    }
  }, [network, setupAccountChangeListener]);

  // Store refreshBalance in ref before using it
  useEffect(() => {
    refreshBalanceRef.current = refreshBalance;
  }, [refreshBalance]);

  // Initialize and check connection
  useEffect(() => {
    const init = async () => {
      if (typeof window !== 'undefined') {
        // Check if extension exists
        if (window.kleverWeb !== undefined) {
          setExtensionInstalled(true);
          // Try to auto-connect
          await connectExtension();
        } else {
          setExtensionInstalled(false);
        }
        setSearchingExtension(false);
      }
    };

    init();

    // Check again after a delay in case extension loads late
    const timer = setTimeout(init, 1000);

    return () => clearTimeout(timer);
  }, [connectExtension]);

  // Update provider when network changes
  useEffect(() => {
    if (extensionInstalled && window.kleverWeb?.provider) {
      window.kleverWeb.provider = NETWORK_CONFIG[network];
      web.setProvider(NETWORK_CONFIG[network]);
    }
  }, [network, extensionInstalled]);

  // Connect wallet
  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);

      if (!extensionInstalled) {
        throw new Error(
          'Klever extension not found. Please install it from https://chromewebstore.google.com/detail/klever-wallet/ifclboecfhkjbpmhgehodcjpciihhmif'
        );
      }

      // Set provider based on network
      if (window.kleverWeb?.provider) {
        window.kleverWeb.provider = NETWORK_CONFIG[network];
      }

      // Also update web SDK settings
      web.setProvider(NETWORK_CONFIG[network]);

      // Initialize extension only if not already active
      if (!web.isKleverWebActive()) {
        if (window.kleverHub !== undefined) {
          await window.kleverHub.initialize();
          setupAccountChangeListener();
        } else {
          await web.initialize();
        }
      }

      // Get wallet address
      const addr = web.getWalletAddress();
      if (addr && addr.startsWith('klv') && addr.length === 62) {
        setAddress(addr);
        setIsConnected(true);
        setupAccountChangeListener();
        // Refresh balance after successful connection with the new address
        await refreshBalance(addr);
      } else {
        throw new Error('Invalid wallet address. Please switch to a KLV wallet.');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to connect wallet');
      setError(error);
      console.error('Connect error:', err);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [extensionInstalled, network, refreshBalance, setupAccountChangeListener]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      setError(null);

      // Reset state immediately
      setIsConnected(false);
      setAddress(null);
      setBalance(null);

      // Note: The Klever extension doesn't have a true disconnect method
      // The wallet remains connected at the extension level
      // We just clear the local state to simulate disconnection
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to disconnect wallet');
      setError(error);
      console.error('Disconnect error:', err);
    }
  }, []);

  // Switch network
  const switchNetwork = useCallback(
    async (newNetwork: NetworkType) => {
      try {
        setError(null);

        // Update provider
        if (window.kleverWeb?.provider) {
          window.kleverWeb.provider = NETWORK_CONFIG[newNetwork];
        }

        setNetwork(newNetwork);

        // Save network to localStorage
        localStorage.setItem('klever-network', newNetwork);

        // Refresh balance for new network
        if (isConnected) {
          await refreshBalance();
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to switch network');
        setError(error);
        console.error('Switch network error:', err);
      }
    },
    [isConnected, refreshBalance]
  );

  // Send transaction
  const sendTransaction = useCallback(
    async (tx: Transaction): Promise<string> => {
      if (!address || !window.kleverWeb) {
        throw new Error('Wallet not connected');
      }

      try {
        setError(null);

        // Build transfer payload
        const payload: ITransfer = {
          receiver: tx.to,
          amount: tx.amount * 1_000_000, // Convert to precision 6
          kda: tx.token || 'KLV',
        };

        const contractRequest: IContractRequest[] = [
          {
            type: TransactionType.Transfer,
            payload: {
              ...payload,
              sender: address,
              nonce: 0, // Will be set by KleverWeb
            },
          },
        ];

        // Build, sign, and broadcast transaction
        const unsignedTx = await web.buildTransaction(contractRequest);

        const signedTx = await web.signTransaction(unsignedTx);
        const response = await web.broadcastTransactions([signedTx]);

        if (response?.data?.txsHashes && response.data.txsHashes.length > 0) {
          const hash = response.data.txsHashes[0];

          // Refresh balance after transaction
          setTimeout(() => {
            if (refreshBalanceRef.current) {
              refreshBalanceRef.current();
            }
          }, 3000);

          return hash;
        } else {
          throw new Error(response?.error || 'Transaction failed to broadcast');
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to send transaction');
        setError(error);
        console.error('Transaction error:', err);
        throw error;
      }
    },
    [address]
  );

  const value: KleverContextType = {
    isConnected,
    isConnecting,
    address,
    network,
    balance,
    isLoadingBalance,
    extensionInstalled,
    searchingExtension,
    connect,
    disconnect,
    switchNetwork,
    refreshBalance,
    sendTransaction,
    error,
  };

  return <KleverContext.Provider value={value}>{children}</KleverContext.Provider>;
};
