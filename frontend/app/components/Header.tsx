"use client";

import { useState, useRef, useEffect } from "react";
import { useWallet } from "@/app/context/WalletContext";
import { checkHealth } from "@/lib/api";

/* ------------------------------------------------------------------ */
/*  Deterministic identicon (blocky avatar from address)               */
/* ------------------------------------------------------------------ */

function Identicon({ address, size = 22 }: { address: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !address) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const seed = address.toLowerCase().slice(2);
    const gridSize = 5;
    const cellSize = size / gridSize;

    const hue = parseInt(seed.slice(0, 4), 16) % 360;
    const sat = 55 + (parseInt(seed.slice(4, 6), 16) % 30);
    const light = 55 + (parseInt(seed.slice(6, 8), 16) % 15);
    const color = `hsl(${hue}, ${sat}%, ${light}%)`;
    const bgColor = `hsl(${hue}, ${sat - 20}%, ${light - 30}%)`;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = color;
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < Math.ceil(gridSize / 2); col++) {
        const idx = row * gridSize + col;
        const val = parseInt(seed[idx % seed.length], 16);
        if (val > 7) {
          ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
          ctx.fillRect(
            (gridSize - 1 - col) * cellSize,
            row * cellSize,
            cellSize,
            cellSize,
          );
        }
      }
    }
  }, [address, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ borderRadius: "50%", flexShrink: 0 }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Truncate address                                                   */
/* ------------------------------------------------------------------ */

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */

export default function Header() {
  const { address, chainId, balance, isConnecting, error, connect, disconnect, networkName } =
    useWallet();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    const poll = async () => setBackendOnline(await checkHealth());
    poll();
    const interval = setInterval(poll, 10_000);
    return () => clearInterval(interval);
  }, []);

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const statusText = backendOnline === null ? "Checking..." : backendOnline ? "System Online" : "System Offline";
  const statusColor = backendOnline === null ? "bg-zinc-500" : backendOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500";

  return (
    <header className="fixed top-0 right-0 left-64 z-50 glass-header flex justify-between items-center px-8 h-16 ambient-shadow">
      {/* Left — system status */}
      <div className="flex items-center flex-1">
        <div className="bg-surface-container-low px-3 py-1.5 rounded-lg flex items-center space-x-2 border border-outline-variant/10">
          <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            {statusText}
          </span>
        </div>
      </div>

      {/* Right — actions */}
      <div className="flex items-center space-x-6">

        {/* Wallet area */}
        <div ref={dropdownRef} className="relative">
          {!address ? (
            <button
              id="connect-wallet-btn"
              onClick={connect}
              disabled={isConnecting}
              className="px-4 py-1.5 border border-indigo-500/30 rounded-xl text-indigo-400 text-sm font-medium hover:bg-indigo-500/10 transition-all flex items-center gap-2"
            >
              {isConnecting ? (
                <>
                  <span className="wallet-spinner" />
                  Connecting…
                </>
              ) : (
                "Connect Wallet"
              )}
            </button>
          ) : (
            <button
              id="wallet-pill"
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-800/50 border border-zinc-700 hover:border-indigo-500/30 transition-all"
            >
              <Identicon address={address} size={24} />
              <span className="text-sm text-zinc-300 font-mono">
                {truncateAddress(address)}
              </span>
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                className="opacity-50 transition-transform"
                style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                <path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* Error toast */}
          {error && !address && (
            <div
              className="absolute top-full mt-2 right-0 z-[100] rounded-xl px-4 py-2.5 text-xs whitespace-nowrap"
              style={{
                background: "rgba(147, 0, 10, 0.2)",
                border: "1px solid rgba(255, 180, 171, 0.3)",
                color: "#ffb4ab",
                backdropFilter: "blur(16px)",
                animation: "dropdown-enter 0.2s ease-out",
              }}
            >
              {error}
            </div>
          )}

          {/* Wallet dropdown */}
          {dropdownOpen && address && (
            <div
              className="absolute top-full mt-2 right-0 w-72 z-[100] rounded-2xl overflow-hidden"
              style={{
                background: "rgba(27, 27, 29, 0.95)",
                backdropFilter: "blur(24px) saturate(1.4)",
                border: "1px solid rgba(70, 69, 84, 0.3)",
                boxShadow: "0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(192, 193, 255, 0.04) inset",
                animation: "dropdown-enter 0.2s ease-out",
              }}
            >
              {/* Header row */}
              <div className="p-4 border-b border-outline-variant/20 flex items-center gap-3">
                <Identicon address={address} size={36} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white tracking-tight">
                    {truncateAddress(address)}
                  </p>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    {networkName} · Chain {chainId}
                  </p>
                </div>
              </div>

              {/* Info rows */}
              <div className="px-4 py-2 space-y-0">
                {/* Balance */}
                <div className="flex justify-between items-center py-2.5 border-b border-outline-variant/10">
                  <span className="text-xs text-on-surface-variant">Balance</span>
                  <span className="text-sm font-semibold text-white font-mono">
                    {balance ?? "—"} ETH
                  </span>
                </div>

                {/* Copy address */}
                <button
                  onClick={copyAddress}
                  className="flex justify-between items-center py-2.5 border-b border-outline-variant/10 w-full bg-transparent border-none cursor-pointer"
                >
                  <span className="text-[11px] text-on-surface-variant font-mono truncate max-w-[180px]">
                    {address}
                  </span>
                  <span className={`text-[10px] flex-shrink-0 transition-colors ${copied ? "text-emerald-400" : "text-on-surface-variant"}`}>
                    {copied ? "Copied ✓" : "Copy"}
                  </span>
                </button>

                {/* Network */}
                <div className="flex justify-between items-center py-2.5">
                  <span className="text-xs text-on-surface-variant">Network</span>
                  <span className={`text-xs font-medium flex items-center gap-1.5 ${chainId === 11155111 ? "text-emerald-400" : "text-tertiary"}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {networkName}
                  </span>
                </div>
              </div>

              {/* Disconnect */}
              <div className="p-3">
                <button
                  id="disconnect-wallet-btn"
                  onClick={() => {
                    disconnect();
                    setDropdownOpen(false);
                  }}
                  className="w-full py-2 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: "rgba(147, 0, 10, 0.12)",
                    border: "1px solid rgba(255, 180, 171, 0.2)",
                    color: "#ffb4ab",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(147, 0, 10, 0.25)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(147, 0, 10, 0.12)";
                  }}
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}