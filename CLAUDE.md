# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: KleverConnect-Starter

A lightweight React + Vite starter kit for Web3 developers to integrate with the Klever Wallet extension. This project provides a clean, client-side only solution for wallet connection without backend complexity - perfect for prototyping, hackathons, or quick Klever ecosystem integration.

### Project Goal

This starter kit empowers developers to rapidly build frontend-only Web3 applications that integrate with the Klever Wallet Extension. It provides a robust, developer-friendly foundation with built-in utilities for wallet interaction, transaction management, and smart contract operations.

## Development Commands

```bash
# Install dependencies (uses pnpm)
pnpm install

# Start development server with HMR
pnpm dev

# Build for production (runs TypeScript check + Vite build)
pnpm build

# Preview production build locally
pnpm preview

# Run ESLint
pnpm lint

# Check code style and format
pnpm check

# Fix code style and format
pnpm check:fix
```

## Key Features

- **Custom useKlever hook** for wallet connection logic
- **ConnectWallet UI component** to display wallet address and connection state
- **Client-side only architecture** - no backend/API routes needed
- **Klever Extension API integration** for Web3 functionality
- Modern React development with Vite's fast HMR

## Project Architecture

### Tech Stack
- **React 19.1.0** with TypeScript support
- **Vite 6.3.5** for fast development and optimized builds
- **TypeScript 5.8.3** with strict mode enabled
- **ESLint** with flat config format including React Hooks and React Refresh plugins
- **Klever Extension API** for wallet integration

### Key Files for Klever Integration
- `src/hooks/useKlever.js` - Core hook handling Klever wallet connection logic
- `src/components/ConnectWallet.jsx` - UI component for wallet connection interface
- `src/App.tsx` - Main application component that renders the wallet interface

### TypeScript Configuration

The project uses a composite TypeScript setup:
- `tsconfig.app.json` - Application code configuration (ES2020 target, strict mode)
- `tsconfig.node.json` - Node.js files configuration (ES2022 target)
- Module resolution is set to "bundler" mode for Vite compatibility

### Key Development Notes

1. The project uses **pnpm** as the package manager
2. Development server runs on http://localhost:5173 by default
3. All TypeScript files have strict checking enabled
4. React StrictMode is enabled in main.tsx
5. The build process runs TypeScript type checking before Vite build
6. **Default network is Testnet** - Users can switch between Mainnet, Testnet, and Devnet using the network badge in the header

### Development Workflow for Klever Integration

1. Ensure the Klever Extension is installed in your browser
2. Start the development server with `pnpm dev`
3. The app will automatically detect the Klever wallet extension
4. Use the ConnectWallet component to initiate wallet connection
5. The useKlever hook manages connection state and wallet interactions

### ESLint Configuration Enhancement

For production applications, consider upgrading to type-aware lint rules by modifying `eslint.config.js` to use `recommendedTypeChecked` or `strictTypeChecked` configurations as shown in the README.

## Core Functional Requirements

### 1. Wallet Connection Management
- **Connect** to Klever Wallet extension
- **Disconnect** from wallet session
- **Auto-detect** connection status
- **Display** active wallet address

### 2. Network Switching Support
- Support switching between:
  - Mainnet
  - Testnet
  - Devnet
- Helper logic to detect and reflect current network
- Update UI state on network change

### 3. Wallet Information Display
- Fetch and display user's balance (KLV or other tokens)
- Auto-update UI on network or wallet changes
- Handle multiple token types

### 4. Transaction Utilities
- Create and send basic token transfers
- Support KDA fee payments
- Helper methods for:
  - Transaction confirmation waiting (polling/events)
  - TX hash display
  - Status updates in UI
- Error handling for failed transactions

### 5. Smart Contract Interaction
- Trigger smart contract transactions
- Query read-only methods (via Node API, not wallet)
- Abstracted helper functions for both operations
- Type-safe contract interfaces

## Suggested Architecture Enhancements

### Core Hooks & Context
- **useKlever()** - Centralized wallet logic hook
- **KleverProvider** - Global wallet/network state context
- **useTransaction()** - Transaction management hook
- **useBalance()** - Balance fetching and caching

### UI/UX Components
- Toast notifications for:
  - Connection status
  - Transaction success/failure
  - Network errors
- Loading states for async operations
- Error boundaries for graceful failure handling

### Folder Structure
```
src/
├── hooks/          # Custom React hooks
├── components/     # Reusable UI components
├── lib/            # Utilities and helpers
├── contexts/       # React contexts
├── types/          # TypeScript definitions
└── constants/      # Network configs, addresses
```

## Developer Experience Guidelines

1. **Minimal Setup** - Should work immediately after `pnpm install && pnpm dev`
2. **Type Safety** - Full TypeScript support for all Klever operations
3. **Error Handling** - Graceful fallbacks for unsupported environments
4. **Extensibility** - Easy to add routes or backend later
5. **Documentation** - Inline JSDoc comments and comprehensive examples

## Implementation Priorities

1. **Phase 1**: Basic wallet connection and display
2. **Phase 2**: Network switching and balance display
3. **Phase 3**: Transaction creation and monitoring
4. **Phase 4**: Smart contract interactions
5. **Phase 5**: Polish with UI library integration (Tailwind/Chakra)

## Expected Developer Workflow

A developer cloning this repo should be able to:
1. Connect to their Klever wallet immediately
2. Choose and switch networks seamlessly
3. View balance and wallet information
4. Send transactions with minimal code
5. Interact with smart contracts using provided utilities
6. All without any backend setup or configuration