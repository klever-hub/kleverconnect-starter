export const NETWORK_CONFIG = {
  mainnet: {
    api: 'https://api.mainnet.klever.org',
    explorer: 'https://kleverscan.org',
    nodeUrl: 'https://node.mainnet.klever.org',
  },
  testnet: {
    api: 'https://api.testnet.klever.org',
    explorer: 'https://testnet.kleverscan.org',
    nodeUrl: 'https://node.testnet.klever.org',
  },
  devnet: {
    api: 'https://api.devnet.klever.org',
    explorer: 'https://devnet.kleverscan.org',
    nodeUrl: 'https://node.devnet.klever.org',
  },
} as const;

export type Network = keyof typeof NETWORK_CONFIG;

export const getExplorerUrl = (network: Network, hash: string): string => {
  return `${NETWORK_CONFIG[network].explorer}/transaction/${hash}`;
};

export const getApiEndpoint = (network: Network): string => {
  return NETWORK_CONFIG[network].api;
};

export const getNodeUrl = (network: Network): string => {
  return NETWORK_CONFIG[network].nodeUrl;
};
