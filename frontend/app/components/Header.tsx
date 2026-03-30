"use client";

import { useState, useRef, useEffect } from "react";
import { useWallet } from "@/app/context/WalletContext";

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

    const seed = address.toLowerCase().slice(2); // strip 0x
    const gridSize = 5;
    const cellSize = size / gridSize;

    // Generate a color from the address
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
          // Mirror horizontally
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

  // Close dropdown on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  /* ---------- Network indicator dot color ---------- */
  const networkDotColor = address
    ? chainId === 11155111
      ? "#4ade80" // Sepolia — green
      : "#facc15" // other network — amber
    : "#fff";

  return (
    <header
      style={{
        height: "56px",
        borderBottom: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "var(--bg-surface)",
        flexShrink: 0,
      }}
    >
      {/* Left — network indicator */}
      <div
        style={{
          fontSize: "12.5px",
          color: "var(--text-muted)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: networkDotColor,
            opacity: address ? 1 : 0.7,
            transition: "all 0.3s",
          }}
        />
        Network:{" "}
        <span style={{ color: "var(--text-secondary)" }}>
          {address ? networkName : "Sepolia"}
        </span>
        {address && chainId !== 11155111 && (
          <span
            style={{
              fontSize: "10px",
              padding: "1px 7px",
              borderRadius: "20px",
              background: "rgba(250, 204, 21, 0.12)",
              border: "1px solid rgba(250, 204, 21, 0.3)",
              color: "#facc15",
              marginLeft: "4px",
              letterSpacing: "0.04em",
            }}
          >
            Not Sepolia
          </span>
        )}
      </div>

      {/* Right — wallet button / pill */}
      <div ref={dropdownRef} style={{ position: "relative" }}>
        {!address ? (
          /* ---- Connect button ---- */
          <button
            id="connect-wallet-btn"
            onClick={connect}
            disabled={isConnecting}
            style={{
              padding: "6px 16px",
              borderRadius: "8px",
              background: "transparent",
              border: "1px solid var(--border-default)",
              color: "var(--text-primary)",
              fontSize: "13px",
              fontWeight: 500,
              cursor: isConnecting ? "wait" : "pointer",
              transition: "all 0.15s",
              letterSpacing: "-0.01em",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              animation: isConnecting ? "pulse-subtle 1.5s ease-in-out infinite" : "none",
            }}
            onMouseEnter={(e) => {
              if (!isConnecting) {
                (e.currentTarget as HTMLElement).style.background = "var(--accent-dim)";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isConnecting) {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
              }
            }}
          >
            {isConnecting ? (
              <>
                <span className="wallet-spinner" />
                Connecting…
              </>
            ) : (
              <>
                {/* MetaMask fox icon (simple SVG) */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                  <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12" />
                  <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
                </svg>
                Connect Wallet
              </>
            )}
          </button>
        ) : (
          /* ---- Connected pill ---- */
          <button
            id="wallet-pill"
            onClick={() => setDropdownOpen((o) => !o)}
            style={{
              padding: "5px 12px 5px 8px",
              borderRadius: "9px",
              background: "var(--accent-dim)",
              border: "1px solid var(--border-default)",
              color: "var(--text-primary)",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.15s",
              letterSpacing: "-0.01em",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
              (e.currentTarget as HTMLElement).style.background = "var(--accent-dim)";
            }}
          >
            <Identicon address={address} size={22} />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12.5px" }}>
              {truncateAddress(address)}
            </span>
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              style={{
                marginLeft: "2px",
                opacity: 0.5,
                transition: "transform 0.2s",
                transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              <path d="M2 4L5 7L8 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* ---- Error toast ---- */}
        {error && !address && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "12px",
              color: "#fca5a5",
              whiteSpace: "nowrap",
              zIndex: 100,
              backdropFilter: "blur(16px)",
              animation: "dropdown-enter 0.2s ease-out",
            }}
          >
            {error}
          </div>
        )}

        {/* ---- Dropdown ---- */}
        {dropdownOpen && address && (
          <div
            className="wallet-dropdown"
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: "280px",
              background: "rgba(18, 18, 18, 0.92)",
              backdropFilter: "blur(24px) saturate(1.4)",
              WebkitBackdropFilter: "blur(24px) saturate(1.4)",
              border: "1px solid var(--border-default)",
              borderRadius: "14px",
              padding: "0",
              zIndex: 100,
              boxShadow: "0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset",
              overflow: "hidden",
              animation: "dropdown-enter 0.2s ease-out",
            }}
          >
            {/* Header row */}
            <div
              style={{
                padding: "16px",
                borderBottom: "1px solid var(--border-subtle)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <Identicon address={address} size={36} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: "13.5px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {truncateAddress(address)}
                </p>
                <p style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "1px" }}>
                  {networkName} · Chain {chainId}
                </p>
              </div>
            </div>

            {/* Info rows */}
            <div style={{ padding: "10px 16px", display: "flex", flexDirection: "column", gap: "0" }}>
              {/* Balance */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Balance</span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {balance ?? "—"} ETH
                </span>
              </div>

              {/* Full address — copy */}
              <button
                onClick={copyAddress}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                  borderBottom: "1px solid var(--border-subtle)",
                  background: "none",
                  border: "none",
                  width: "100%",
                  cursor: "pointer",
                  borderBottomWidth: "1px",
                  borderBottomStyle: "solid",
                  borderBottomColor: "var(--border-subtle)",
                }}
              >
                <span
                  style={{
                    fontSize: "11.5px",
                    color: "var(--text-muted)",
                    fontFamily: "'JetBrains Mono', monospace",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "190px",
                  }}
                >
                  {address}
                </span>
                <span
                  style={{
                    fontSize: "10.5px",
                    color: copied ? "#4ade80" : "var(--text-muted)",
                    transition: "color 0.2s",
                    flexShrink: 0,
                  }}
                >
                  {copied ? "Copied ✓" : "Copy"}
                </span>
              </button>

              {/* Network */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px 0",
                }}
              >
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Network</span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: chainId === 11155111 ? "#4ade80" : "#facc15",
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: "5px",
                      height: "5px",
                      borderRadius: "50%",
                      background: "currentColor",
                    }}
                  />
                  {networkName}
                </span>
              </div>
            </div>

            {/* Disconnect */}
            <div style={{ padding: "8px 12px 12px" }}>
              <button
                id="disconnect-wallet-btn"
                onClick={() => {
                  disconnect();
                  setDropdownOpen(false);
                }}
                style={{
                  width: "100%",
                  padding: "9px",
                  borderRadius: "9px",
                  background: "rgba(239, 68, 68, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  color: "#fca5a5",
                  fontSize: "12.5px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  letterSpacing: "-0.01em",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(239, 68, 68, 0.15)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(239, 68, 68, 0.35)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = "rgba(239, 68, 68, 0.08)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(239, 68, 68, 0.2)";
                }}
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}