import { useState, useCallback } from 'react';
import { web, TransactionType } from '@klever/sdk-web';
import type { IContractRequest, ITransfer, ISmartContract } from '@klever/sdk-web';
import { useKlever } from './useKlever';
import { useToast } from './useToast';
import { contractParam, isEncodableParam } from '../utils/contractHelpers';
import type { EncodableParam } from '../types/contract';
import {
  decodeTransactionResults,
  extractReturnDataFromLogs,
  decodeReturnData,
  type ContractABI,
  type DecodedReturnData,
} from '../utils/abiDecoder';

// Re-export TransactionType from SDK for convenience
export { TransactionType };

// Re-export contract param helpers
export { contractParam };

// Transaction result interface
export interface TransactionResult {
  hash?: string;
  error?: string;
  success: boolean;
}

// Transaction details from API
export interface TransactionResults {
  receipts?: Array<{
    type?: string;
    typeStr?: string;
    value?: unknown;
    results?: unknown[];
    [key: string]: unknown;
  }>;
  contract?: Array<{
    type?: number;
    typeStr?: string;
    parameter?: unknown;
    [key: string]: unknown;
  }>;
  logs?: {
    events?: Array<{
      identifier?: string;
      address?: string;
      topics?: string[];
      data?: string | string[];
      order?: number;
    }>;
    [key: string]: unknown;
  };
  status?: string;
  resultCode?: string;
  [key: string]: unknown;
}

// API endpoints based on network
const API_ENDPOINTS = {
  mainnet: 'https://api.mainnet.klever.org',
  testnet: 'https://api.testnet.klever.org',
  devnet: 'https://api.devnet.klever.org',
} as const;

// Transaction hook
export const useTransaction = () => {
  const { address, isConnected, network } = useKlever();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Send transaction
  const sendTransaction = useCallback(
    async (
      type: TransactionType,
      payload: ITransfer | ISmartContract
    ): Promise<TransactionResult> => {
      if (!isConnected || !address) {
        const error = 'Wallet not connected';
        addToast({
          title: 'Error',
          message: error,
          type: 'error',
        });
        return { success: false, error };
      }

      setIsLoading(true);
      setTxHash(null);

      try {
        const contractRequest: IContractRequest[] = [
          {
            type,
            payload: {
              ...payload,
              sender: address,
              nonce: 0, // Will be set by SDK
            },
          },
        ];

        // Build, sign and broadcast transaction
        const unsignedTx = await web.buildTransaction(contractRequest);
        const signedTx = await web.signTransaction(unsignedTx);
        const response = await web.broadcastTransactions([signedTx]);

        if (response?.data?.txsHashes && response.data.txsHashes.length > 0) {
          const hash = response.data.txsHashes[0];
          setTxHash(hash);
          addToast({
            title: 'Success',
            message: `Transaction sent! Hash: ${hash.slice(0, 8)}...${hash.slice(-8)}`,
            type: 'success',
          });
          return { success: true, hash };
        }

        throw new Error(response?.error || 'Transaction failed');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
        addToast({
          title: 'Error',
          message: errorMessage,
          type: 'error',
        });
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, address, addToast]
  );

  // Helper functions for common transactions
  const sendKLV = useCallback(
    async (receiver: string, amount: number): Promise<TransactionResult> => {
      const payload: ITransfer = {
        receiver,
        amount: amount * 1e6, // Convert to precision 6
        kda: 'KLV',
      };

      return sendTransaction(TransactionType.Transfer, payload);
    },
    [sendTransaction]
  );

  const sendKDA = useCallback(
    async (receiver: string, amount: number, kdaId: string): Promise<TransactionResult> => {
      const payload: ITransfer = {
        receiver,
        amount: amount * 1e6, // Assuming precision 6, adjust as needed
        kda: kdaId,
      };

      return sendTransaction(TransactionType.Transfer, payload);
    },
    [sendTransaction]
  );

  // Helper to build call input for smart contracts
  const buildCallInput = useCallback(
    (functionName: string, args: EncodableParam<unknown>[] = []): string => {
      // Encode args
      const inputs = args.map((arg) => {
        if (isEncodableParam(arg)) {
          return arg.encode();
        }
        throw new Error('Invalid argument type. Use contractParam helpers.');
      });

      // Join method name and arguments with '@' separator
      const dataString = [functionName, ...inputs].join('@');

      // Convert to base64 for transmission
      return btoa(dataString);
    },
    []
  );

  const callSmartContract = useCallback(
    async (
      contractAddress: string,
      functionName: string,
      args: EncodableParam<unknown>[] = [],
      value?: number,
      token: string = 'KLV'
    ): Promise<TransactionResult> => {
      if (!isConnected || !address) {
        const error = 'Wallet not connected';
        addToast({
          title: 'Error',
          message: error,
          type: 'error',
        });
        return { success: false, error };
      }

      setIsLoading(true);
      setTxHash(null);

      try {
        // Build call input
        const callInput = buildCallInput(functionName, args);

        // Build payload
        const payload: ISmartContract = {
          scType: 0, // InvokeType = 0 for execute
          address: contractAddress,
          ...(value && { callValue: { [token]: value } }),
        };

        // Build transaction with call input as second parameter
        const contractRequest: IContractRequest = {
          type: TransactionType.SmartContract,
          payload: {
            ...payload,
            sender: address,
            nonce: 0, // Will be set by SDK
          },
        };

        const unsignedTx = await web.buildTransaction([contractRequest], [callInput]);
        const signedTx = await web.signTransaction(unsignedTx);
        const response = await web.broadcastTransactions([signedTx]);

        if (response?.data?.txsHashes && response.data.txsHashes.length > 0) {
          const hash = response.data.txsHashes[0];
          setTxHash(hash);
          addToast({
            title: 'Success',
            message: `Transaction sent! Hash: ${hash.slice(0, 8)}...${hash.slice(-8)}`,
            type: 'success',
          });
          return { success: true, hash };
        }

        throw new Error(response?.error || 'Transaction failed');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
        addToast({
          title: 'Error',
          message: errorMessage,
          type: 'error',
        });
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, address, addToast, buildCallInput]
  );

  // Fetch transaction with results
  const getTransactionWithResults = useCallback(
    async (hash: string): Promise<TransactionResults | null> => {
      try {
        const response = await fetch(
          `${API_ENDPOINTS[network]}/v1.0/transaction/${hash}?withResults=true`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch transaction: ${response.statusText}`);
        }
        const data = await response.json();
        return (data?.data?.transaction as TransactionResults) || null;
      } catch (error) {
        console.error('Error fetching transaction results:', error);
        return null;
      }
    },
    [network]
  );

  // Wait for transaction confirmation
  const waitForTransaction = useCallback(
    async (hash: string, timeout: number = 60000): Promise<boolean> => {
      const startTime = Date.now();

      while (Date.now() - startTime < timeout) {
        try {
          const response = await fetch(`${API_ENDPOINTS[network]}/v1.0/transaction/${hash}`);
          if (response.ok) {
            const data = await response.json();
            if (data?.data?.transaction?.status === 'success') {
              addToast({
                title: 'Success',
                message: 'Transaction confirmed!',
                type: 'success',
              });
              return true;
            } else if (data?.data?.transaction?.status === 'fail') {
              addToast({
                title: 'Error',
                message: 'Transaction failed',
                type: 'error',
              });
              return false;
            }
          }
        } catch (error) {
          console.error('Error checking transaction:', error);
        }

        // Wait 2 seconds before next check
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      addToast({
        title: 'Warning',
        message: 'Transaction confirmation timeout',
        type: 'warning',
      });
      return false;
    },
    [addToast, network]
  );

  // Decode transaction data (utility function)
  const decodeTransactionData = useCallback(
    (data: string[]): { functionName: string; args: string[] } | null => {
      if (!data || data.length === 0) return null;

      try {
        // First element is usually the function name
        const bytes = data[0].match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || [];
        const decoder = new TextDecoder();
        const functionName = decoder.decode(new Uint8Array(bytes));

        // Rest are arguments
        const args = data.slice(1).map((hex) => {
          try {
            // Try to decode as UTF-8 string first
            const argBytes = hex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || [];
            const argDecoder = new TextDecoder();
            return argDecoder.decode(new Uint8Array(argBytes));
          } catch {
            // If that fails, return the hex value
            return hex;
          }
        });

        return { functionName, args };
      } catch (error) {
        console.error('Error decoding transaction data:', error);
        return null;
      }
    },
    []
  );

  // Query smart contract (read-only)
  const queryContract = useCallback(
    async (
      contractAddress: string,
      functionName: string,
      args: EncodableParam<unknown>[] = []
    ): Promise<unknown> => {
      try {
        // Convert arguments to base64-encoded values for query API
        const encodedArgs = args.map((arg) => {
          if (isEncodableParam(arg)) {
            return arg.encodeBase64();
          } else {
            throw new Error('Invalid argument type. Use contractParam helpers.');
          }
        });

        const body = {
          ScAddress: contractAddress,
          FuncName: functionName,
          Arguments: encodedArgs,
        };

        // Make API call to query contract
        const response = await fetch(`${API_ENDPOINTS[network]}/v1.0/sc/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            // Handle cases where response is not JSON
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
          }
          throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        // Return the data property of the response
        return result?.data || null;
      } catch (error) {
        console.error('Contract query error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Contract query failed';
        throw new Error(errorMessage);
      }
    },
    [network]
  );

  // Helper function to convert base64 to hex (browser-compatible)
  const base64ToHex = (base64: string): string => {
    // Decode base64 to binary string
    const binaryString = atob(base64);
    // Convert to hex
    let hex = '';
    for (let i = 0; i < binaryString.length; i++) {
      const byte = binaryString.charCodeAt(i);
      hex += byte.toString(16).padStart(2, '0');
    }
    return hex;
  };

  // Helper function to parse contract response data
  const parseContractResponse = useCallback(
    (data: unknown, functionName?: string, abi?: ContractABI): unknown => {
      // Check if this is a standard return format
      if (data && typeof data === 'object' && 'returnData' in data) {
        const returnData = (data as { returnData: unknown }).returnData;

        // If it's an array of return, return collection
        if (Array.isArray(returnData) && returnData.length > 0) {
          // Convert base64 to hex
          const hexValues = returnData
            .map((item: unknown) => {
              if (typeof item === 'string') {
                return base64ToHex(item);
              }
              return '';
            })
            .filter((hex) => hex !== '');

          // If ABI is provided, try to decode the values
          if (abi && functionName) {
            try {
              const endpoint = abi.endpoints.find((ep) => ep.name === functionName);
              if (endpoint && endpoint.outputs) {
                const decodedResult = decodeReturnData(hexValues, endpoint, abi);
                // If we successfully decoded, return the decoded values
                if (decodedResult.values.length > 0) {
                  // If single value, return just the value
                  if (decodedResult.values.length === 1) {
                    return decodedResult.values[0].value;
                  }
                  // Multiple values, return as array
                  return decodedResult.values.map((v) => v.value);
                }
              }
            } catch (error) {
              console.error('Failed to decode with ABI:', error);
              // Fall through to return hex values
            }
          }

          // Return hex values if no ABI or decoding failed
          if (hexValues.length === 1) {
            return hexValues[0];
          }
          return hexValues;
        }

        // Single return value
        if (typeof returnData === 'string') {
          const hexValue = base64ToHex(returnData);

          // If ABI is provided, try to decode the value
          if (abi && functionName) {
            try {
              const endpoint = abi.endpoints.find((ep) => ep.name === functionName);
              if (endpoint && endpoint.outputs && endpoint.outputs.length > 0) {
                const decodedResult = decodeReturnData([hexValue], endpoint, abi);

                // If we successfully decoded, return the decoded value
                if (decodedResult.values.length > 0) {
                  return decodedResult.values[0].value;
                }
              }
            } catch (error) {
              console.error('Failed to decode with ABI:', error);
              // Fall through to return hex value
            }
          }

          return hexValue;
        }
      }

      // If it's another format, try to extract relevant data
      if (data && typeof data === 'object' && 'returnCode' in data) {
        // Avoid rendering raw response object
        const returnCode = (data as { returnCode: number }).returnCode;
        return returnCode === 0 ? true : false;
      }

      return data;
    },
    []
  );

  // Helper to convert managed buffer to hex
  const convertManagedBufferToHex = useCallback((data: unknown): string => {
    try {
      if (typeof data === 'string') {
        // In browser, we'll just return the hex string as-is
        // The actual conversion logic would depend on how the data is encoded
        return data;
      } else if (data && typeof data === 'object' && 'toString' in data) {
        return (data as { toString: () => string }).toString();
      }
      return '';
    } catch (e) {
      console.error('Failed to convert managed buffer:', e);
      return '';
    }
  }, []);

  // Decode transaction results using ABI
  const decodeTransactionWithABI = useCallback(
    (
      results: TransactionResults,
      functionName: string,
      abi?: ContractABI
    ): DecodedReturnData | null => {
      try {
        const { decoded } = decodeTransactionResults(results, functionName, abi);
        return decoded;
      } catch (error) {
        console.error('Failed to decode transaction results:', error);
        return null;
      }
    },
    []
  );

  // Extract and decode return values from transaction logs
  const getDecodedReturnValues = useCallback((results: TransactionResults): string[] | null => {
    try {
      return extractReturnDataFromLogs(results.logs);
    } catch (error) {
      console.error('Failed to extract return values:', error);
      return null;
    }
  }, []);

  return {
    sendTransaction,
    sendKLV,
    sendKDA,
    callSmartContract,
    queryContract,
    waitForTransaction,
    getTransactionWithResults,
    decodeTransactionData,
    parseContractResponse,
    convertManagedBufferToHex,
    decodeTransactionWithABI,
    getDecodedReturnValues,
    isLoading,
    txHash,
    TransactionType,
  };
};
