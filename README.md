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

### Core Features
- **🔗 @klever/connect-react** - Official Klever Connect SDK integration
- **🎨 ConnectWallet Component** - Ready-to-use UI for wallet interaction with QR code support
- **💸 Transaction Support** - Send KLV/KDA tokens with built-in hooks
- **📜 Smart Contract Integration** - Query and execute contract methods (Adder, Dice, Factorial examples)
- **🌐 Multi-Network Support** - Mainnet, Testnet, and Devnet with visual badges
- **⚡ Vite-powered** - Lightning-fast HMR and optimized builds (76 KB vendor bundle gzipped)
- **📦 Zero Backend** - Pure client-side architecture
- **🔧 TypeScript Support** - Full type safety out of the box
- **🧹 ESLint Configured** - Code quality enforcement included

### UI/UX Features
- **🎨 Theme System** - 6 theme variants (Light, Light-1, Light-2, Dark, Dark-1, Dark-2 with electric blue)
- **🔄 Theme Control** - Long-press theme toggle for quick switching
- **💫 Page Loader** - Branded loading animation with rotating gradient rings
- **🎯 Interactive Tutorial** - Step-by-step guide for building with Klever Connect
- **📱 Responsive Design** - Mobile-first approach with Tailwind CSS v4
- **🔔 Toast Notifications** - User feedback for transactions and actions
- **📋 Syntax Highlighting** - Code examples with theme-aware highlighting
- **♿ Accessibility** - WCAG 2.1 AA compliant, screen reader support, reduced motion support

### Developer Experience
- **📚 SEO Optimization** - Structured data (BreadcrumbList, Course, FAQ, Organization, Video schemas)
- **🚀 Code Splitting** - Lazy-loaded pages and optimized bundle chunks
- **🎯 Smart Contract ABIs** - Pre-configured examples for quick testing
- **📝 Type Safety** - Full TypeScript coverage with strict mode
- **🔍 Input Validation** - Address and amount validation utilities
- **🎨 Utility Components** - Button, EmptyState, DeveloperTip, TransactionResult
- **💼 Wallet Features** - Balance display, address QR codes, network badges
- **🔧 Custom Hooks** - useTheme, useToast, useLongPress, useSlotMachineAnimation

## 🛠️ Tech Stack

- **React** 19.2.0 - Latest React with modern hooks
- **Vite** 7.1.12 - Next-generation frontend tooling
- **TypeScript** 5.9.3 - Type-safe development
- **Tailwind CSS** 4.1.16 - Utility-first CSS framework
- **React Router DOM** 7.9.4 - Client-side routing
- **@klever/connect-react** 0.1.2 - Official Klever SDK
- **react-helmet-async** 2.0.5 - SEO and meta tags
- **react-syntax-highlighter** 15.6.6 - Code syntax highlighting
- **qrcode** 1.5.4 - QR code generation
- **pnpm** - Fast, disk space efficient package manager

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

```
src/
├── components/              # UI components
│   ├── common/             # Shared components
│   │   └── ErrorBoundary.tsx
│   ├── layout/             # Layout components
│   │   ├── Header.tsx
│   │   ├── RootLayout.tsx
│   │   └── ScrollToTop.tsx
│   ├── pages/              # Page components
│   │   ├── LandingPage.tsx
│   │   ├── StartBuilding.tsx    # Interactive tutorial
│   │   └── TransactionTriggers.tsx
│   ├── seo/                # SEO & structured data
│   │   ├── BreadcrumbSchema.tsx
│   │   ├── CourseSchema.tsx
│   │   ├── FAQStructuredData.tsx
│   │   ├── OrganizationSchema.tsx
│   │   ├── SEO.tsx
│   │   ├── StructuredData.tsx
│   │   └── VideoSchema.tsx
│   ├── transactions/       # Transaction-related components
│   │   ├── SmartContractInteraction.tsx
│   │   ├── TokenTransfer.tsx
│   │   └── TransactionHistory.tsx
│   ├── tutorial/           # Tutorial components
│   │   ├── InfoTooltip.tsx
│   │   └── steps/          # Tutorial step components
│   │       ├── CodeBlock.tsx
│   │       ├── Step1DevTools.tsx
│   │       ├── Step2CreateDapp.tsx
│   │       ├── Step3KleverWallet.tsx
│   │       ├── Step4Customize.tsx
│   │       ├── Step5Deploy.tsx
│   │       └── index.ts
│   ├── ui/                 # Reusable UI elements
│   │   ├── Button.tsx
│   │   ├── DeveloperTip.tsx
│   │   ├── EmptyState.tsx
│   │   ├── Faucet.tsx
│   │   ├── PageLoader.tsx
│   │   ├── ThemeControl.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── Toast.tsx
│   │   ├── ToastContainer.tsx
│   │   └── TransactionResult.tsx
│   └── wallet/             # Wallet-related UI
│       ├── AddressQRCode.tsx
│       ├── AddressQRModal.tsx
│       ├── Balance.tsx
│       ├── ConnectWallet.tsx
│       └── NetworkBadge.tsx
├── contexts/               # State management
│   ├── ThemeContext.tsx    # Theme switching (6 themes)
│   ├── ToastContext.tsx    # Toast notifications
│   └── index.ts
├── hooks/                  # Custom hooks
│   ├── useLongPress.ts     # Long press detection
│   ├── useSlotMachineAnimation.ts
│   ├── useTheme.ts         # Theme management
│   ├── useToast.ts         # Toast notifications
│   └── index.ts
├── assets/                 # Static assets
│   ├── adder.abi.json      # Smart contract ABIs
│   ├── dice.abi.json
│   └── factorial.abi.json
├── constants/              # App constants
│   └── index.ts
├── types/                  # TypeScript definitions
│   ├── toast.ts
│   └── index.ts
├── utils/                  # Helper functions
│   ├── formatters.ts       # Address, balance formatters
│   ├── validation.ts       # Input validation
│   └── index.ts
├── styles/                 # Global styles (Tailwind CSS v4)
├── App.tsx                 # Main app with routing
├── main.tsx                # Entry point
└── index.css               # Global CSS & theme variables
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

### Implementation Status

#### Phase 1: Basic Connection ✅
- ✅ Wallet connection/disconnection
- ✅ Display wallet address with QR code
- ✅ Connection status management
- ✅ Error boundaries

#### Phase 2: Network & Balance ✅
- ✅ Network switching (Mainnet/Testnet/Devnet)
- ✅ Balance fetching and display
- ✅ Multi-token support
- ✅ Network badges with visual indicators

#### Phase 3: Transactions ✅
- ✅ Send token transfers (KLV/KDA)
- ✅ Transaction confirmation tracking
- ✅ KDA fee integration
- ✅ Transaction history display
- ✅ Transaction result component

#### Phase 4: Smart Contracts ✅
- ✅ Contract method calls
- ✅ Read-only queries
- ✅ ABI-based contract interaction
- ✅ Type-safe interfaces
- ✅ Example contracts (Adder, Dice, Factorial)

#### Phase 5: Polish ✅
- ✅ 6 theme variants with system
- ✅ Toast notifications
- ✅ Loading states and PageLoader
- ✅ Error boundaries
- ✅ Responsive design
- ✅ Accessibility (WCAG 2.1 AA)
- ✅ SEO optimization with structured data

#### Phase 6: Tutorial & Documentation ✅
- ✅ Interactive step-by-step tutorial
- ✅ Code examples with syntax highlighting
- ✅ Developer tips and tooltips
- ✅ Deployment guides (Docker, Cloud providers)

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
