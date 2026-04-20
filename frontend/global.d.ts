declare module "*.css";

interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
}

interface KeplrProvider {
  enable: (chainId: string) => Promise<void>;
  getOfflineSigner: (chainId: string) => {
    getAccounts: () => Promise<{ address: string; pubkey: Uint8Array }[]>;
    signDirect: (...args: unknown[]) => Promise<unknown>;
    signAmino: (...args: unknown[]) => Promise<unknown>;
  };
  getKey: (chainId: string) => Promise<{ bech32Address: string; name: string }>;
  experimentalSuggestChain: (chainInfo: unknown) => Promise<void>;
}

interface Window {
  ethereum?: EthereumProvider;
  keplr?: KeplrProvider;
}