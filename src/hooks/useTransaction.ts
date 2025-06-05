import { useState, useCallback } from 'react';
import { web, TransactionType } from '@klever/sdk-web';
import type { IContractRequest, ITransfer, ISmartContract } from '@klever/sdk-web';
import { useKlever } from './useKlever';
import { useToast } from './useToast';
import { contractParam, isEncodableParam } from '../utils/contractHelpers';
import type { EncodableParam } from '../types/contract';

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

// API endpoints based on network
const API_ENDPOINTS = {
  mainnet: 'https://api.mainnet.klever.org',
  testnet: 'https://api.testnet.klever.org',
  devnet: 'https://api.devnet.klever.org'
} as const;

// Transaction hook
export const useTransaction = () => {
  const { address, isConnected, network } = useKlever();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Send transaction
  const sendTransaction = useCallback(async (
    type: TransactionType,
    payload: ITransfer | ISmartContract
  ): Promise<TransactionResult> => {
    if (!isConnected || !address) {
      const error = 'Wallet not connected';
      addToast({
        title: 'Error',
        message: error,
        type: 'error'
      });
      return { success: false, error };
    }

    setIsLoading(true);
    setTxHash(null);

    try {
      const contractRequest: IContractRequest[] = [{
        type,
        payload: {
          ...payload,
          sender: address,
          nonce: 0 // Will be set by SDK
        }
      }];

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
          type: 'success'
        });
        return { success: true, hash };
      }

      throw new Error(response?.error || 'Transaction failed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      addToast({
        title: 'Error',
        message: errorMessage,
        type: 'error'
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, addToast]);

  // Helper functions for common transactions
  const sendKLV = useCallback(async (
    receiver: string,
    amount: number
  ): Promise<TransactionResult> => {
    const payload: ITransfer = {
      receiver,
      amount: amount * 1e6, // Convert to precision 6
      kda: 'KLV'
    };

    return sendTransaction(TransactionType.Transfer, payload);
  }, [sendTransaction]);

  const sendKDA = useCallback(async (
    receiver: string,
    amount: number,
    kdaId: string
  ): Promise<TransactionResult> => {
    const payload: ITransfer = {
      receiver,
      amount: amount * 1e6, // Assuming precision 6, adjust as needed
      kda: kdaId
    };

    return sendTransaction(TransactionType.Transfer, payload);
  }, [sendTransaction]);

  // Helper to build call input for smart contracts
  const buildCallInput = useCallback((
    functionName: string,
    args: EncodableParam<unknown>[] = []
  ): string => {
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
  }, []);

  const callSmartContract = useCallback(async (
    contractAddress: string,
    functionName: string,
    args: EncodableParam<unknown>[] = [],
    value?: number
  ): Promise<TransactionResult> => {
    if (!isConnected || !address) {
      const error = 'Wallet not connected';
      addToast({
        title: 'Error',
        message: error,
        type: 'error'
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
        ...(value && { callValue: { 'KLV': value } })
      };

      // Build transaction with call input as second parameter
      const contractRequest: IContractRequest = {
        type: TransactionType.SmartContract,
        payload: {
          ...payload,
          sender: address,
          nonce: 0 // Will be set by SDK
        }
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
          type: 'success'
        });
        return { success: true, hash };
      }

      throw new Error(response?.error || 'Transaction failed');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      addToast({
        title: 'Error',
        message: errorMessage,
        type: 'error'
      });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, addToast, buildCallInput]);

  // Wait for transaction confirmation
  const waitForTransaction = useCallback(async (
    hash: string,
    timeout: number = 60000
  ): Promise<boolean> => {
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
              type: 'success'
            });
            return true;
          } else if (data?.data?.transaction?.status === 'fail') {
            addToast({
              title: 'Error', 
              message: 'Transaction failed',
              type: 'error'
            });
            return false;
          }
        }
      } catch (error) {
        console.error('Error checking transaction:', error);
      }
      
      // Wait 2 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    addToast({
      title: 'Warning',
      message: 'Transaction confirmation timeout',
      type: 'warning'
    });
    return false;
  }, [addToast, network]);

  // Decode transaction data (utility function)
  const decodeTransactionData = useCallback((data: string[]): { functionName: string; args: string[] } | null => {
    if (!data || data.length === 0) return null;
    
    try {
      // First element is usually the function name
      const bytes = data[0].match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];
      const decoder = new TextDecoder();
      const functionName = decoder.decode(new Uint8Array(bytes));
      
      // Rest are arguments
      const args = data.slice(1).map(hex => {
        try {
          // Try to decode as UTF-8 string first
          const argBytes = hex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || [];
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
  }, []);

  // Query smart contract (read-only)
  const queryContract = useCallback(async (
    contractAddress: string,
    functionName: string,
    args: EncodableParam<unknown>[] = []
  ): Promise<unknown> => {
    try {
      // Encode function name
      const functionParam = contractParam.buffer(functionName);
      
      // Build call data array with encoded values
      const callData = [functionParam.encode()];
      
      // Encode each argument
      args.forEach(arg => {
        if (isEncodableParam(arg)) {
          callData.push(arg.encode());
        } else {
          throw new Error('Invalid argument type. Use contractParam helpers.');
        }
      });

      // Make API call to query contract
      const response = await fetch(`${API_ENDPOINTS[network]}/v1.0/sc/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scAddress: contractAddress,
          funcName: functionName,
          args: callData
        })
      });

      if (!response.ok) {
        throw new Error(`Query failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      return result.data || result;
    } catch (error) {
      console.error('Contract query error:', error);
      throw error;
    }
  }, [network]);

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
  const parseContractResponse = useCallback((data: unknown): string | string[] | boolean | null => {
    // Check if this is a standard return format
    if (data && typeof data === 'object' && 'returnData' in data) {
      const returnData = (data as { returnData: unknown }).returnData;
      
      // If it's an array of return, return collection
      if (Array.isArray(returnData) && returnData.length > 0) {
        // convert base64 to hex
        const result = returnData.map((item: unknown) => {
          if (typeof item === 'string') {
            return base64ToHex(item);
          }
          return '';
        });
        if (result.length === 1) {
          return result[0];
        }
        return result;
      }
      
      // convert base64 to hex
      if (typeof returnData === 'string') {
        return base64ToHex(returnData);
      }
    }

    // If it's another format, try to extract relevant data
    if (data && typeof data === 'object' && 'returnCode' in data) {
      // Avoid rendering raw response object
      const returnCode = (data as { returnCode: number }).returnCode;
      return returnCode === 0 ? true : false;
    }

    return data as string | null;
  }, []);

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

  return {
    sendTransaction,
    sendKLV,
    sendKDA,
    callSmartContract,
    queryContract,
    waitForTransaction,
    decodeTransactionData,
    parseContractResponse,
    convertManagedBufferToHex,
    isLoading,
    txHash,
    TransactionType
  };
};