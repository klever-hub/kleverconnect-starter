# KleverConnect-Starter 🚀

A lightweight React + Vite + TypeScript starter kit for seamless integration with the Klever Wallet extension. Perfect for Web3 developers who need a clean, fast setup for wallet connectivity without backend complexity.

## 🎯 Purpose

KleverConnect-Starter serves as a bootstrap tool for projects requiring quick Klever wallet integration. It's ideal for:
- 🏗️ Prototyping Web3 applications
- 🏆 Hackathon projects
- 🎓 Learning Klever ecosystem integration
- ⚡ Quick proof-of-concepts

### Goal

This starter kit empowers developers to rapidly build frontend-only Web3 applications that integrate with the Klever Wallet Extension. It provides a robust, developer-friendly foundation with built-in utilities for wallet interaction, transaction management, and smart contract operations.

## ✨ Features

### Current Features
- **🔗 @klever/connect-react** - Official Klever Connect SDK integration
- **🎨 ConnectWallet Component** - Ready-to-use UI for wallet interaction
- **💸 Transaction Support** - Send KLV/KDA tokens with built-in hooks
- **📜 Smart Contract Integration** - Query and execute contract methods
- **🌐 Multi-Network Support** - Mainnet, Testnet, and Devnet
- **⚡ Vite-powered** - Lightning-fast HMR and optimized builds
- **📦 Zero Backend** - Pure client-side architecture
- **🔧 TypeScript Support** - Full type safety out of the box
- **🧹 ESLint Configured** - Code quality enforcement included

### Planned Features

#### 🔐 Wallet Connection Management
- Connect/disconnect Klever Wallet extension
- Auto-detect connection status
- Display active wallet address
- Session persistence

#### 🌐 Network Support
- Switch between networks (Mainnet, Testnet, Devnet)
- Auto-detect current network
- Network-specific configurations

#### 💰 Wallet Information
- Fetch and display KLV balance
- Support for multiple token balances
- Real-time balance updates

#### 📤 Transaction Utilities
- Send token transfers
- KDA fee payment support
- Transaction confirmation tracking
- Status updates and notifications

#### 📄 Smart Contract Integration
- Trigger contract transactions
- Query read-only methods
- Type-safe contract interfaces
- Helper functions for common operations

## 🛠️ Tech Stack

- **React** 19.1.0
- **Vite** 6.3.5
- **TypeScript** 5.8.3
- **Klever Extension API**
- **pnpm** (Package Manager)

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- pnpm (`npm install -g pnpm`)
- [Klever Extension](https://klever.io/en/wallet) installed in your browser

### Installation

```bash
# Clone the repository
git clone https://github.com/klever-hub/kleverconnect-starter.git
cd kleverconnect-starter

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Your app will be running at `http://localhost:5173` 🎉

### 🧪 Code Quality & Testing

Run the same checks locally that run in CI:

```bash
# Run all checks (typecheck, lint, format)
pnpm check

# Run checks and auto-fix issues
pnpm check:fix

# Individual commands
pnpm typecheck      # TypeScript type checking
pnpm lint           # ESLint
pnpm format:check   # Check formatting
pnpm format         # Auto-format code
```

### 🔄 CI/CD

This project uses GitHub Actions for continuous integration:
- **Automated checks** on every push and PR
- **Node.js matrix testing** (18.x, 20.x)
- **Code quality checks**: TypeScript, ESLint, Prettier
- **Build verification** to ensure production builds work

The workflow runs automatically when you:
- Push to `main` or `develop` branches
- Open a pull request
- All checks must pass before merging

## 📚 Documentation

### Code Examples
For comprehensive examples on how to use all the transaction features, check out [EXAMPLES.md](./EXAMPLES.md). It includes:
- Sending KLV and KDA tokens
- Querying smart contracts (read-only, no fees)
- Executing smart contract functions
- Using contract parameter helpers
- Error handling best practices
- Advanced patterns and batch operations

## 📁 Project Structure

### Current Structure
```
src/
├── components/
│   └── ConnectWallet.jsx    # Wallet connection UI component
├── hooks/
│   └── useKlever.js         # Klever wallet connection hook
├── App.tsx                  # Main application component
├── main.tsx                 # Application entry point
└── assets/                  # Static assets
```

### Recommended Structure (for full implementation)
```
src/
├── hooks/              # Custom React hooks
│   ├── useKlever.ts
│   ├── useTransaction.ts
│   └── useBalance.ts
├── components/         # Reusable UI components
│   ├── ConnectWallet.tsx
│   ├── NetworkSelector.tsx
│   └── TransactionStatus.tsx
├── contexts/           # React contexts
│   └── KleverProvider.tsx
├── lib/                # Utilities and helpers
│   ├── klever.ts
│   └── transactions.ts
└── types/              # TypeScript definitions
    └── klever.d.ts
```

## 🔧 Available Scripts

```bash
# Development
pnpm dev            # Start development server (port 5173)
pnpm build          # Build for production
pnpm preview        # Preview production build

# Code Quality
pnpm lint           # Run ESLint
pnpm typecheck      # Run TypeScript type checking
pnpm format         # Format code with Prettier
pnpm format:check   # Check code formatting

# Combined Commands
pnpm check          # Run all checks (typecheck + lint + format:check)
pnpm check:fix      # Run all checks and fix issues
```

## 🐳 Docker Deployment

Build and run the application using Docker:

```bash
# Quick start with the build script
./docker-build.sh

# Or use Docker commands directly
docker build -f docker/Dockerfile -t kleverconnect-starter .
docker run -d -p 3000:80 --name kleverconnect-app kleverconnect-starter

# Or use Docker Compose
docker-compose up -d
```

The application will be available at http://localhost:3000

### Docker Features:
- **Multi-stage build** for optimized image size (~50MB)
- **Nginx** web server for production-ready serving
- **Gzip compression** for better performance
- **Security headers** configured
- **Client-side routing** support
- **Health checks** included
- **Cache optimization** for static assets

## 💻 Usage Examples

### Basic Wallet Connection
```jsx
import { useKlever } from '@klever/connect-react';
import { ConnectWallet } from './components/ConnectWallet';

function App() {
  const { address, isConnected } = useKlever();

  return (
    <div>
      <ConnectWallet />
      {isConnected && <p>Connected: {address}</p>}
    </div>
  );
}
```

### With Network Information
```jsx
import { useKlever } from '@klever/connect-react';

function App() {
  const { address, currentNetwork } = useKlever();

  return (
    <div>
      <ConnectWallet />
      <p>Network: {currentNetwork}</p>
      <p>Address: {address}</p>
    </div>
  );
}
```

### Sending Transactions
```jsx
import { useTransaction } from '@klever/connect-react';
import { parseUnits } from '@klever/connect-core';

function SendTokens() {
  const { sendKLV, isLoading } = useTransaction({
    onSuccess: (receipt) => {
      console.log('TX Hash:', receipt.hash);
    },
  });

  const handleSend = async () => {
    await sendKLV('klv1...receiver', Number(parseUnits('100')));
  };

  return (
    <button onClick={handleSend} disabled={isLoading}>
      {isLoading ? 'Sending...' : 'Send KLV'}
    </button>
  );
}
```

## 🔐 Key Hooks

### useKlever Hook

The `useKlever` hook from `@klever/connect-react` provides:
- `address` - Connected wallet address
- `isConnected` - Connection status
- `currentNetwork` - Current network (mainnet/testnet/devnet)
- `wallet` - Wallet instance for advanced operations
- `provider` - Provider instance for blockchain queries

### useTransaction Hook

The `useTransaction` hook provides transaction utilities:
- `sendKLV(receiver, amount)` - Send KLV tokens
- `sendKDA(receiver, amount, assetId)` - Send KDA tokens
- `isLoading` - Transaction loading state
- `onSuccess` / `onError` callbacks for transaction handling

### ConnectWallet Component

A pre-built UI component that:
- Displays connection button when disconnected
- Shows wallet address when connected
- Handles connection/disconnection flow
- Provides user-friendly error handling

## 🚧 Development

### Implementation Roadmap

#### Phase 1: Basic Connection (Current)
- ✅ Wallet connection/disconnection
- ✅ Display wallet address
- ✅ Connection status management

#### Phase 2: Network & Balance
- 🔲 Network switching (Mainnet/Testnet/Devnet)
- 🔲 Balance fetching and display
- 🔲 Multi-token support

#### Phase 3: Transactions
- 🔲 Send token transfers
- 🔲 Transaction confirmation tracking
- 🔲 KDA fee integration
- 🔲 Transaction history

#### Phase 4: Smart Contracts
- 🔲 Contract method calls
- 🔲 Read-only queries
- 🔲 Event listeners
- 🔲 Type-safe interfaces

#### Phase 5: Polish
- 🔲 UI component library integration
- 🔲 Toast notifications
- 🔲 Loading states
- 🔲 Error boundaries

### TypeScript Configuration

The project uses a composite TypeScript setup:
- `tsconfig.app.json` - Application code (strict mode enabled)
- `tsconfig.node.json` - Build tool configuration
- Full type safety for Klever integration

### ESLint Enhancement

For production apps, consider upgrading to type-aware lint rules:

```js
// eslint.config.js
export default tseslint.config({
  extends: [
    ...tseslint.configs.strictTypeChecked,
  ],
  languageOptions: {
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🔗 Resources

- [Klever Documentation](https://docs.klever.org)
- [Klever Extension](https://klever.io/en/wallet)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)

## 🎯 What You Can Build

With KleverConnect-Starter, developers can create:
- **DeFi Applications** - Swaps, liquidity pools, yield farming
- **NFT Marketplaces** - Mint, buy, sell digital collectibles
- **DAOs** - Decentralized governance platforms
- **Gaming dApps** - Web3 games with in-game assets
- **Token Management** - Multi-token wallets and portfolios
- **DApp Prototypes** - Quick MVPs for hackathons

---

Built with ❤️ by the Klever Hub team
