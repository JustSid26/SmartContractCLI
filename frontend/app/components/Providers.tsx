"use client";

import { WalletProvider } from "@/app/context/WalletContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <WalletProvider>{children}</WalletProvider>;
}
