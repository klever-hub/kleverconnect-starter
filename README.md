# KleverConnect-Starter 🚀

A lightweight React + Vite + TypeScript starter kit for seamless integration with the Klever Wallet extension. Perfect for Web3 developers who need a clean, fast setup for wallet connectivity without backend complexity.

## 🎯 Purpose

KleverConnect-Starter serves as a bootstrap tool for projects requiring quick Klever wallet integration. It's ideal for:
- 🏗️ Prototyping Web3 applications
- 🏆 Hackathon projects
- 🎓 Learning Klever ecosystem integration
- ⚡ Quick proof-of-concepts

## ✨ Features

- **🔗 Custom useKlever Hook** - Simplified wallet connection logic
- **🎨 ConnectWallet Component** - Ready-to-use UI for wallet interaction
- **⚡ Vite-powered** - Lightning-fast HMR and optimized builds
- **📦 Zero Backend** - Pure client-side architecture
- **🔧 TypeScript Support** - Full type safety out of the box
- **🧹 ESLint Configured** - Code quality enforcement included

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
git clone https://github.com/klever-labs/kleverconnect-starter.git
cd kleverconnect-starter

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Your app will be running at `http://localhost:5173` 🎉

## 📁 Project Structure

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

## 🔧 Available Scripts

```bash
# Development server with hot reload
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run ESLint
pnpm lint
```

## 💻 Usage Example

```jsx
import { useKlever } from './hooks/useKlever';
import ConnectWallet from './components/ConnectWallet';

function App() {
  const { address, isConnected, connect, disconnect } = useKlever();

  return (
    <div>
      <ConnectWallet />
      {isConnected && <p>Connected: {address}</p>}
    </div>
  );
}
```

## 🔐 Key Components

### useKlever Hook

The `useKlever` hook provides:
- `address` - Connected wallet address
- `isConnected` - Connection status
- `connect()` - Function to initiate connection
- `disconnect()` - Function to disconnect wallet
- `balance` - Wallet balance (optional)

### ConnectWallet Component

A pre-built UI component that:
- Displays connection button when disconnected
- Shows wallet address when connected
- Handles connection/disconnection flow
- Provides user-friendly error handling

## 🚧 Development

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

- [Klever Documentation](https://docs.klever.io)
- [Klever Extension](https://klever.io/en/wallet)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)

---

Built with ❤️ by the Klever Labs team
