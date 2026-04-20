"use client";

import { useMemo } from "react";
import { WalletProvider as EVMWalletProvider } from "@/app/context/WalletContext";
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import "@solana/wallet-adapter-react-ui/styles.css";

export default function Providers({ children }: { children: React.ReactNode }) {
    const solanaEndpoint = useMemo(() => clusterApiUrl("devnet"), []);
    const solanaWallets = useMemo(() => [new PhantomWalletAdapter()], []);

    return (
        <EVMWalletProvider>
            <ConnectionProvider endpoint={solanaEndpoint}>
                <SolanaWalletProvider wallets={solanaWallets}>
                    <WalletModalProvider>
                        {children}
                    </WalletModalProvider>
                </SolanaWalletProvider>
            </ConnectionProvider>
        </EVMWalletProvider>
    );
}
