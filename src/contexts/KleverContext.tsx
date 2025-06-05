import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { web, TransactionType } from '@klever/sdk-web';
import type { IContractRequest, ITransfer } from '@klever/sdk-web';

export type NetworkType = 'mainnet' | 'testnet' | 'devnet';

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

// Network configurations
const NETWORK_CONFIG = {
  mainnet: {
    api: 'https://api.mainnet.klever.org',
    node: 'https://node.mainnet.klever.org',
  },
  testnet: {
    api: 'https://api.testnet.klever.org',
    node: 'https://node.testnet.klever.org',
  },
  devnet: {
    api: 'https://api.devnet.klever.org',
    node: 'https://node.devnet.klever.org',
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

  // Track manual disconnect to prevent auto-reconnect
  const hasManuallyDisconnected = useRef(false);

  // Load connection state from localStorage
  useEffect(() => {
    const savedConnectionState = localStorage.getItem('klever-was-connected');
    if (savedConnectionState === 'false') {
      hasManuallyDisconnected.current = true;
    }
  }, []);

  // Check for existing connection
  const checkExistingConnection = useCallback(async () => {
    // Don't auto-reconnect if user manually disconnected
    if (hasManuallyDisconnected.current) {
      return;
    }

    try {
      // First check if extension is available
      if (!window.kleverWeb || !window.kleverHub) {
        return;
      }

      // Set provider based on saved network
      if (window.kleverWeb?.provider) {
        window.kleverWeb.provider = NETWORK_CONFIG[network];
      }
      
      // Also update web SDK settings
      web.setProvider(NETWORK_CONFIG[network]);

      // Try multiple approaches to restore connection
      
      // Approach 1: Check if web is already active
      if (web.isKleverWebActive()) {
        const addr = web.getWalletAddress();
        if (addr && addr.startsWith('klv') && addr.length === 62) {
          setAddress(addr);
          setIsConnected(true);
          localStorage.setItem('klever-was-connected', 'true');
          if (refreshBalanceRef.current) {
            await refreshBalanceRef.current(addr);
          }
          return;
        }
      }

      // Approach 2: Try to initialize and get address
      try {
        // Initialize the hub if not already done
        if (window.kleverHub && !web.isKleverWebActive()) {
          await window.kleverHub.initialize();
          
          // Small delay to ensure initialization completes
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Try to get address again
          const addr = web.getWalletAddress();
          if (addr && addr.startsWith('klv') && addr.length === 62) {
            setAddress(addr);
            setIsConnected(true);
            localStorage.setItem('klever-was-connected', 'true');
            
            // Setup account change listener
            window.kleverHub.onAccountChanged((e) => {
              if (hasManuallyDisconnected.current) {
                return;
              }
              
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
            
            if (refreshBalanceRef.current) {
              await refreshBalanceRef.current(addr);
            }
          }
        }
      } catch {
        // If initialization fails, it likely means user hasn't connected before
        console.log('Extension available but wallet not previously connected');
      }
    } catch (err) {
      console.error('Failed to check existing connection:', err);
    }
  }, [network]);

  // Check if extension is installed
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 5;
    const retryDelay = 500; // Start with 500ms
    
    const checkExtension = async () => {
      if (typeof window !== 'undefined') {
        const isInstalled = window.kleverWeb !== undefined;
        
        if (isInstalled) {
          setExtensionInstalled(true);
          setSearchingExtension(false);

          // Give extension time to fully initialize
          await new Promise(resolve => setTimeout(resolve, 200));
          
          if (!isConnected && !hasManuallyDisconnected.current) {
            // Check if already connected
            await checkExistingConnection();
          }
        } else if (retryCount < maxRetries) {
          // Retry with exponential backoff
          retryCount++;
          setTimeout(checkExtension, retryDelay * retryCount);
        } else {
          // Extension not found after all retries
          setExtensionInstalled(false);
          setSearchingExtension(false);
        }
      }
    };

    // Start checking
    checkExtension();

    return () => {
      // Cleanup - no timers to clear since we handle them internally
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove dependencies to run only once on mount

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

  // Connect wallet
  const connect = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);
      hasManuallyDisconnected.current = false; // Reset the flag when connecting

      if (!extensionInstalled) {
        throw new Error(
          'Klever extension not found. Please install it from https://klever.io/en/wallet'
        );
      }

      // Set provider based on network
      if (window.kleverWeb?.provider) {
        window.kleverWeb.provider = NETWORK_CONFIG[network];
      }
      
      // Also update web SDK settings
      web.setProvider(NETWORK_CONFIG[network]);

      // Initialize extension
      if (!web.isKleverWebActive()) {
        if (window.kleverHub !== undefined) {
          await window.kleverHub.initialize();

          // Setup account change listener
          window.kleverHub.onAccountChanged((e) => {
            // Don't handle account changes if user manually disconnected
            if (hasManuallyDisconnected.current) {
              return;
            }

            if ((e.chain === 'KLV' || e.chain === 1) && e.address.length === 62) {
              setAddress(e.address);
              setIsConnected(true);
              if (refreshBalanceRef.current) {
                refreshBalanceRef.current(e.address);
              }
            } else {
              // Reset state directly instead of calling disconnect
              setIsConnected(false);
              setAddress(null);
              setBalance(null);
            }
          });
        } else {
          await web.initialize();
        }
      }

      // Get wallet address
      const addr = web.getWalletAddress();
      if (addr && addr.startsWith('klv') && addr.length === 62) {
        setAddress(addr);
        setIsConnected(true);
        // Save connection state
        localStorage.setItem('klever-was-connected', 'true');
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
  }, [extensionInstalled, network, refreshBalance]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      setError(null);
      hasManuallyDisconnected.current = true; // Set flag to prevent auto-reconnect
      
      // Save disconnection state
      localStorage.setItem('klever-was-connected', 'false');

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

  useEffect(() => {
    refreshBalanceRef.current = refreshBalance;
  }, [refreshBalance]);

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

        console.log('Transaction broadcast response:', response);

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

  // Listen for account changes
  useEffect(() => {
    if (!extensionInstalled) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (accounts[0] !== address) {
        setAddress(accounts[0]);
        if (refreshBalanceRef.current) {
          refreshBalanceRef.current(accounts[0]);
        }
      }
    };

    // Setup listeners if available
    if (window.kleverHub?.on) {
      window.kleverHub.on('accountsChanged', handleAccountsChanged);

      return () => {
        if (window.kleverHub?.off) {
          window.kleverHub.off('accountsChanged', handleAccountsChanged);
        }
      };
    }
  }, [address, disconnect, extensionInstalled]);

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
