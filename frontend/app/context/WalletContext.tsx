"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface WalletState {
  address: string | null;
  chainId: number | null;
  balance: string | null;          // ETH as a human-readable string
  isConnecting: boolean;
  error: string | null;
}

interface WalletContextValue extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  networkName: string;
}

const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum",
  5: "Goerli",
  11155111: "Sepolia",
  137: "Polygon",
  80001: "Mumbai",
  42161: "Arbitrum",
  10: "Optimism",
  56: "BNB Chain",
  43114: "Avalanche",
};

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const WalletContext = createContext<WalletContextValue | null>(null);

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within <WalletProvider>");
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function hexToNumber(hex: string): number {
  return parseInt(hex, 16);
}

// Safely extracts the authentic MetaMask provider avoiding Phantom hijacking
export function getMetaMaskProvider(): any {
  if (typeof window === "undefined" || !window.ethereum) return null;
  const eth = window.ethereum as any;

  if (eth.providers?.length) {
    const provider = eth.providers.find((p: any) => p.isMetaMask && !p.isPhantom);
    if (provider) return provider;
  }
  return eth;
}

function weiToEth(weiHex: string): string {
  const wei = BigInt(weiHex);
  const eth = Number(wei) / 1e18;
  return eth.toFixed(4);
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    balance: null,
    isConnecting: false,
    error: null,
  });

  /* ---------- fetch balance for a given address & chain ---------- */
  const fetchBalance = useCallback(async (addr: string) => {
    try {
      const provider = getMetaMaskProvider();
      if (!provider) return null;
      const balHex = (await provider.request({
        method: "eth_getBalance",
        params: [addr, "latest"],
      })) as string;
      return weiToEth(balHex);
    } catch {
      return null;
    }
  }, []);

  /* ---------- sync state from MetaMask ---------- */
  const syncWallet = useCallback(
    async (accounts: string[]) => {
      if (accounts.length === 0) {
        setState((s) => ({
          ...s,
          address: null,
          chainId: null,
          balance: null,
          error: null,
        }));
        return;
      }

      const addr = accounts[0];
      const provider = getMetaMaskProvider();
      if (!provider) return;
      const chainHex = (await provider.request({
        method: "eth_chainId",
      })) as string;
      const chainId = hexToNumber(chainHex);
      const balance = await fetchBalance(addr);

      setState((s) => ({
        ...s,
        address: addr,
        chainId,
        balance,
        isConnecting: false,
        error: null,
      }));
    },
    [fetchBalance],
  );

  /* ---------- connect ---------- */
  const connect = useCallback(async () => {
    const provider = getMetaMaskProvider();
    if (!provider) {
      setState((s) => ({
        ...s,
        error: "MetaMask not detected. Please install the extension.",
      }));
      return;
    }

    setState((s) => ({ ...s, isConnecting: true, error: null }));

    try {
      const accounts = (await provider.request({
        method: "eth_requestAccounts",
      })) as string[];
      localStorage.setItem("evmConnected", "true");
      await syncWallet(accounts);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Connection rejected";
      setState((s) => ({
        ...s,
        isConnecting: false,
        error: message,
      }));
    }
  }, [syncWallet]);

  const disconnect = useCallback(() => {
    localStorage.removeItem("evmConnected");
    setState({
      address: null,
      chainId: null,
      balance: null,
      isConnecting: false,
      error: null,
    });
  }, []);

  /* ---------- auto-reconnect + event listeners ---------- */
  useEffect(() => {
    const provider = getMetaMaskProvider();
    if (!provider) return;

    // Auto-reconnect silently ONLY if they connected before
    if (typeof window !== "undefined" && localStorage.getItem("evmConnected") === "true") {
      (async () => {
        try {
          const accounts = (await provider.request({
            method: "eth_accounts",
          })) as string[];
          if (accounts.length > 0) await syncWallet(accounts);
        } catch {
          // ignore
        }
      })();
    }

    const handleAccountsChanged = (accs: unknown) => {
      syncWallet(accs as string[]);
    };

    const handleChainChanged = () => {
      // Re-sync
      (async () => {
        const accounts = (await provider.request({
          method: "eth_accounts",
        })) as string[];
        if (accounts.length > 0) await syncWallet(accounts);
      })();
    };

    if (provider.on) {
       provider.on("accountsChanged", handleAccountsChanged);
       provider.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (provider.removeListener) {
        provider.removeListener("accountsChanged", handleAccountsChanged);
        provider.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [syncWallet]);

  /* ---------- derived ---------- */
  const networkName = useMemo(
    () =>
      state.chainId
        ? CHAIN_NAMES[state.chainId] ?? `Chain ${state.chainId}`
        : "Unknown",
    [state.chainId],
  );

  const value = useMemo<WalletContextValue>(
    () => ({ ...state, connect, disconnect, networkName }),
    [state, connect, disconnect, networkName],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
