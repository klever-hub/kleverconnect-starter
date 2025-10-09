# Klever Transaction Examples

This guide provides comprehensive examples for all types of transactions you can perform with the Klever blockchain using this starter kit.

## Table of Contents

1. [Basic Setup](#basic-setup)
2. [Sending KLV Tokens](#sending-klv-tokens)
3. [Sending KDA Tokens](#sending-kda-tokens)
4. [Querying Smart Contracts](#querying-smart-contracts)
5. [Executing Smart Contracts](#executing-smart-contracts)
6. [Contract Parameter Helpers](#contract-parameter-helpers)
7. [Advanced Examples](#advanced-examples)

## Basic Setup

First, ensure you have the Klever wallet connected:

```typescript
import { useKlever, useTransaction } from '@klever/connect-react';

function MyComponent() {
  const { isConnected, address } = useKlever();
  const { sendKLV, sendKDA } = useTransaction({
    onSuccess: (receipt) => console.log('Success:', receipt.hash),
    onError: (error) => console.error('Error:', error)
  });
  
  if (!isConnected) {
    return <div>Please connect your wallet</div>;
  }
  
  // Your transaction code here
}
```

## Sending KLV Tokens

Send native KLV tokens to another address:

```typescript
import { useTransaction } from '@klever/connect-react';
import { parseUnits } from '@klever/connect-core';

function SendKLVExample() {
  const { sendKLV, isLoading } = useTransaction({
    onSuccess: (receipt) => console.log('Transaction confirmed:', receipt.hash),
  });
  
  const handleSend = async () => {
    try {
      // Send 10 KLV to the receiver (amount in smallest units)
      await sendKLV('klv1...receiver', Number(parseUnits('10')));
    } catch (error) {
      console.error('Failed to send KLV:', error);
    }
  };
  
  return (
    <button onClick={handleSend} disabled={isLoading}>
      Send 10 KLV
    </button>
  );
}
```

## Sending KDA Tokens

Send Klever Digital Assets (KDA) tokens:

```typescript
import { useTransaction } from '@klever/connect-react';
import { parseUnits } from '@klever/connect-core';

function SendKDAExample() {
  const { sendKDA } = useTransaction({
    onSuccess: (receipt) => console.log('KDA transfer completed:', receipt.hash),
  });
  
  const handleSendKDA = async () => {
    try {
      // Send 100 tokens of KFI (amount in smallest units)
      await sendKDA(
        'klv1...receiver',           // Receiver address
        Number(parseUnits('100')),   // Amount
        'KFI'                         // KDA ID
      );
    } catch (error) {
      console.error('Failed to send KDA:', error);
    }
  };
  
  return <button onClick={handleSendKDA}>Send KDA</button>;
}
```

## Querying Smart Contracts

Read data from smart contracts without sending a transaction (no fees):

```typescript
import { useKlever } from '@klever/connect-react';
import { Contract, loadABI } from '@klever/connect-contracts';

function QueryContractExample() {
  const { wallet } = useKlever();
  
  const getBalance = async (userAddress: string) => {
    try {
      // Query a token contract for balance
      const result = await queryContract(
        'klv1qqq...contract',  // Contract address
        'balanceOf',           // Function name
        [contractParam.address(userAddress)]  // Arguments
      );
      
      // Parse the response
      const hexData = parseContractResponse(result);
      
      if (typeof hexData === 'string') {
        // Convert hex to decimal
        const balance = BigInt('0x' + hexData);
        return balance.toString();
      }
      
      return '0';
    } catch (error) {
      console.error('Query failed:', error);
      return '0';
    }
  };
  
  // Query without parameters
  const getTotalSupply = async () => {
    const result = await queryContract(
      'klv1qqq...contract',
      'totalSupply',
      []  // No arguments
    );
    
    return parseContractResponse(result);
  };
  
  return (
    <div>
      <button onClick={() => getBalance('klv1...')}>
        Check Balance
      </button>
    </div>
  );
}
```

## Executing Smart Contracts

Execute state-changing functions on smart contracts (requires fees):

```typescript
import { useTransaction } from './hooks/useTransaction';
import { contractParam } from '@/utils/contractHelpers';

function ExecuteContractExample() {
  const { callSmartContract, waitForTransaction } = useTransaction();
  
  const transferTokens = async () => {
    try {
      // Prepare arguments
      const args = [
        contractParam.address('klv1...receiver'),
        contractParam.bigUint('1000000')  // Amount with decimals
      ];
      
      // Execute the contract function
      const result = await callSmartContract(
        'klv1qqq...contract',  // Contract address
        'transfer',            // Function name
        args,                  // Arguments
        5 * 1e6               // Optional: send 5 KLV with the call
      );
      
      if (result.success && result.hash) {
        await waitForTransaction(result.hash);
        console.log('Transfer completed!');
      }
    } catch (error) {
      console.error('Contract execution failed:', error);
    }
  };
  
  return <button onClick={transferTokens}>Transfer Tokens</button>;
}
```

## Contract Parameter Helpers

The contract parameter helpers ensure proper encoding of different data types:

```typescript
import { contractParam } from '@/utils/contractHelpers';

// Address parameter
const addressParam = contractParam.address('klv1...');

// String/Buffer parameter
const stringParam = contractParam.buffer('Hello Klever');

// Number parameters
const bigNumber = contractParam.bigUint('1000000000000000000');  // For large numbers
const unsignedInt = contractParam.u64(1000);                     // 64-bit unsigned
const signedInt = contractParam.i64(-500);                       // 64-bit signed
const smallUint = contractParam.u32(255);                        // 32-bit unsigned

// Boolean parameter
const boolParam = contractParam.bool(true);

// Optional parameter (can be null)
const optionalParam = contractParam.optionU64(500);      // Has value
const noValueParam = contractParam.optionU64(undefined); // No value

// Working with hex data
const hexData = contractParam.bufferFromHex('48656c6c6f');  // "Hello" in hex

// Working with base64 data
const base64Data = contractParam.bufferFromBase64('SGVsbG8=');  // "Hello" in base64
```

## Advanced Examples

### Complex Contract Interaction

```typescript
import { useTransaction } from './hooks/useTransaction';
import { contractParam } from '@/utils/contractHelpers';

function ComplexContractExample() {
  const { callSmartContract, queryContract, parseContractResponse } = useTransaction();
  
  // Example: DEX swap function
  const swapTokens = async () => {
    const args = [
      contractParam.address('klv1...tokenIn'),     // Token to swap from
      contractParam.address('klv1...tokenOut'),    // Token to swap to
      contractParam.bigUint('1000000'),            // Amount in
      contractParam.bigUint('900000'),             // Minimum amount out
      contractParam.address('klv1...receiver'),    // Receiver address
      contractParam.u64(Math.floor(Date.now() / 1000) + 3600)  // Deadline (1 hour)
    ];
    
    const result = await callSmartContract(
      'klv1qqq...dexContract',
      'swap',
      args,
      0  // No KLV sent with this call
    );
    
    return result;
  };
  
  // Example: Check allowance before swap
  const checkAndApprove = async () => {
    // First, check current allowance
    const allowanceResult = await queryContract(
      'klv1...tokenContract',
      'allowance',
      [
        contractParam.address('klv1...myAddress'),
        contractParam.address('klv1...dexContract')
      ]
    );
    
    const currentAllowance = BigInt('0x' + parseContractResponse(allowanceResult));
    const requiredAmount = BigInt('1000000');
    
    // If allowance is insufficient, approve
    if (currentAllowance < requiredAmount) {
      const approveResult = await callSmartContract(
        'klv1...tokenContract',
        'approve',
        [
          contractParam.address('klv1...dexContract'),
          contractParam.bigUint(requiredAmount.toString())
        ]
      );
      
      // Wait for approval to be confirmed
      await waitForTransaction(approveResult.hash);
    }
    
    // Now proceed with swap
    return swapTokens();
  };
  
  return <button onClick={checkAndApprove}>Swap Tokens</button>;
}
```

### Batch Operations

```typescript
import { useTransaction } from './hooks/useTransaction';
import { contractParam } from '@/utils/contractHelpers';

function BatchOperationsExample() {
  const { callSmartContract, waitForTransaction } = useTransaction();
  
  const batchTransfer = async (recipients: Array<{address: string, amount: string}>) => {
    // Many contracts support batch operations
    const addresses = recipients.map(r => contractParam.address(r.address));
    const amounts = recipients.map(r => contractParam.bigUint(r.amount));
    
    const result = await callSmartContract(
      'klv1...tokenContract',
      'batchTransfer',
      [...addresses, ...amounts]  // Contract-specific argument order
    );
    
    if (result.success && result.hash) {
      await waitForTransaction(result.hash);
      console.log('Batch transfer completed!');
    }
  };
  
  // Usage
  const recipients = [
    { address: 'klv1...user1', amount: '1000000' },
    { address: 'klv1...user2', amount: '2000000' },
    { address: 'klv1...user3', amount: '3000000' }
  ];
  
  return (
    <button onClick={() => batchTransfer(recipients)}>
      Send Batch Transfer
    </button>
  );
}
```

### Working with Contract Events

After a transaction is confirmed, you might want to check the events:

```typescript
async function checkTransactionEvents(txHash: string) {
  try {
    // Query the transaction details from the API
    const response = await fetch(
      `https://api.testnet.klever.org/v1.0/transaction/${txHash}`
    );
    
    if (response.ok) {
      const data = await response.json();
      
      // Check for contract events in the receipts
      if (data?.data?.transaction?.receipts) {
        const events = data.data.transaction.receipts
          .filter(r => r.type === 'smartContract')
          .flatMap(r => r.events || []);
        
        // Process events
        events.forEach(event => {
          console.log('Event:', event.identifier);
          console.log('Topics:', event.topics);
          console.log('Data:', event.data);
        });
      }
    }
  } catch (error) {
    console.error('Failed to fetch transaction events:', error);
  }
}
```

## Error Handling

Always implement proper error handling:

```typescript
import { useTransaction } from './hooks/useTransaction';
import { useToast } from './hooks/useToast';

function ErrorHandlingExample() {
  const { callSmartContract } = useTransaction();
  const { addToast } = useToast();
  
  const executeWithErrorHandling = async () => {
    try {
      const result = await callSmartContract(
        'klv1...contract',
        'someFunction',
        []
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Transaction failed');
      }
      
      addToast({
        title: 'Success',
        message: 'Transaction completed successfully',
        type: 'success'
      });
    } catch (error) {
      // Handle specific error types
      if (error.message.includes('insufficient balance')) {
        addToast({
          title: 'Insufficient Balance',
          message: 'You do not have enough KLV for this transaction',
          type: 'error'
        });
      } else if (error.message.includes('user rejected')) {
        addToast({
          title: 'Transaction Cancelled',
          message: 'You cancelled the transaction',
          type: 'info'
        });
      } else {
        addToast({
          title: 'Transaction Failed',
          message: error.message || 'An unknown error occurred',
          type: 'error'
        });
      }
    }
  };
  
  return <button onClick={executeWithErrorHandling}>Execute</button>;
}
```

## Testing on Different Networks

The starter kit supports mainnet, testnet, and devnet:

```typescript
import { useKlever } from '@klever/connect-react';

function NetworkExample() {
  const { currentNetwork } = useKlever();
  
  // Always test on testnet first!
  const CONTRACT_ADDRESSES = {
    mainnet: 'klv1...mainnetContract',
    testnet: 'klv1...testnetContract',
    devnet: 'klv1...devnetContract'
  };
  
  const contractAddress = CONTRACT_ADDRESSES[currentNetwork];

  return (
    <div>
      <p>Current network: {currentNetwork}</p>
      <p>Contract: {contractAddress}</p>
    </div>
  );
}
```

## Best Practices

1. **Always validate inputs** before sending transactions
2. **Use testnet** for development and testing
3. **Handle errors gracefully** with user-friendly messages
4. **Wait for confirmations** before updating UI state
5. **Check allowances** before token operations
6. **Estimate gas** for complex operations
7. **Cache query results** when appropriate
8. **Use proper decimal handling** for token amounts

## Need Help?

- Check the [Klever Documentation](https://docs.klever.org)
- Join the [Klever Forum](https://forum.klever.org)
- Report issues on [GitHub](https://github.com/klever-io/klever-docs)