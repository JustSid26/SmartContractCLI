"use client";

import { useEffect, useState } from "react";
import { checkHealth } from "@/lib/api";
import { useWallet } from "@/app/context/WalletContext";

/* ------------------------------------------------------------------ */
/*  Truncate helper                                                    */
/* ------------------------------------------------------------------ */

function truncateAddress(addr: string): string {
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function Home() {
    const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
    const { address, balance, networkName, connect } = useWallet();

    useEffect(() => {
        const poll = async () => setBackendOnline(await checkHealth());
        poll();
        const interval = setInterval(poll, 10_000);
        return () => clearInterval(interval);
    }, []);

    const statusLabel =
        backendOnline === null ? "Checking…" :
            backendOnline ? "Online" : "Offline";

    const statusColor =
        backendOnline === null ? "var(--text-muted)" :
            backendOnline ? "#4ade80" : "#f87171";

    const stats = [
        { label: "Total Validations", value: "12", sub: "All time" },
        { label: "Last Contract", value: "134 KB", sub: "Size" },
        { label: "Status", value: statusLabel, sub: "Backend", color: statusColor },
    ];

    return (
        <div style={{ maxWidth: "900px", display: "flex", flexDirection: "column", gap: "32px" }}>

            {/* Page title */}
            <div>
                <h2
                    style={{
                        fontSize: "22px",
                        fontWeight: 600,
                        letterSpacing: "-0.03em",
                        color: "var(--text-primary)",
                        marginBottom: "4px",
                    }}
                >
                    Dashboard
                </h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    Overview of your smart contract activity
                </p>
            </div>

            {/* Wallet connection card */}
            {!address ? (
                <div
                    style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "12px",
                        padding: "24px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                        transition: "border-color 0.2s",
                    }}
                >
                    <div>
                        <p style={{ fontSize: "13.5px", color: "var(--text-primary)", fontWeight: 500, marginBottom: "4px" }}>
                            Wallet not connected
                        </p>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                            Connect MetaMask to view your wallet details
                        </p>
                    </div>
                    <button
                        onClick={connect}
                        style={{
                            padding: "8px 18px",
                            borderRadius: "8px",
                            background: "#fff",
                            color: "#000",
                            border: "1px solid #fff",
                            fontSize: "13px",
                            fontWeight: 500,
                            cursor: "pointer",
                            transition: "all 0.15s",
                            whiteSpace: "nowrap",
                            letterSpacing: "-0.01em",
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "#e6e6e6";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "#fff";
                        }}
                    >
                        Connect
                    </button>
                </div>
            ) : (
                <div
                    style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "12px",
                        padding: "24px",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        transition: "border-color 0.2s",
                    }}
                >
                    {/* Green glow dot */}
                    <div
                        style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "rgba(74, 222, 128, 0.1)",
                            border: "1px solid rgba(74, 222, 128, 0.25)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <span
                            style={{
                                display: "block",
                                width: "10px",
                                height: "10px",
                                borderRadius: "50%",
                                background: "#4ade80",
                                boxShadow: "0 0 8px rgba(74, 222, 128, 0.5)",
                            }}
                        />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: "13.5px", color: "var(--text-primary)", fontWeight: 500 }}>
                            Connected to {networkName}
                        </p>
                        <p
                            style={{
                                fontSize: "12px",
                                color: "var(--text-muted)",
                                fontFamily: "'JetBrains Mono', monospace",
                                marginTop: "2px",
                            }}
                        >
                            {truncateAddress(address)} · {balance ?? "—"} ETH
                        </p>
                    </div>
                </div>
            )}

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: address ? "repeat(4, 1fr)" : "repeat(3, 1fr)", gap: "16px" }}>
                {stats.map(({ label, value, sub, color }) => (
                    <div
                        key={label}
                        style={{
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "12px",
                            padding: "24px",
                            transition: "border-color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
                        }}
                    >
                        <p style={{ fontSize: "11.5px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
                            {label}
                        </p>
                        <p style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-0.04em", color: color ?? "var(--text-primary)", lineHeight: 1 }}>
                            {value}
                        </p>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                            {sub}
                        </p>
                    </div>
                ))}

                {/* Wallet balance stat — only when connected */}
                {address && (
                    <div
                        style={{
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "12px",
                            padding: "24px",
                            transition: "border-color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
                        }}
                    >
                        <p style={{ fontSize: "11.5px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
                            Wallet
                        </p>
                        <p
                            style={{
                                fontSize: "28px",
                                fontWeight: 700,
                                letterSpacing: "-0.04em",
                                color: "var(--text-primary)",
                                lineHeight: 1,
                                fontFamily: "'JetBrains Mono', monospace",
                            }}
                        >
                            {balance ?? "—"}
                        </p>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                            ETH · {truncateAddress(address)}
                        </p>
                    </div>
                )}
            </div>

            {/* Recent activity */}
            <div
                style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "12px",
                    padding: "24px",
                }}
            >
                <p
                    style={{
                        fontSize: "12px",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: "16px",
                    }}
                >
                    Recent Validations
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                    {[
                        { name: "token_contract.wasm", size: "134 KB", status: "Valid" },
                        { name: "dao_voting.wasm", size: "98 KB", status: "Valid" },
                        { name: "escrow_v2.wasm", size: "212 KB", status: "Failed" },
                    ].map(({ name, size, status }, i, arr) => (
                        <div
                            key={name}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "12px 0",
                                borderBottom: i < arr.length - 1 ? "1px solid var(--border-subtle)" : "none",
                            }}
                        >
                            <div>
                                <p style={{ fontSize: "13.5px", color: "var(--text-primary)", fontFamily: "'JetBrains Mono', monospace" }}>
                                    {name}
                                </p>
                                <p style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px" }}>{size}</p>
                            </div>
                            <span
                                style={{
                                    fontSize: "11px",
                                    fontWeight: 500,
                                    padding: "3px 10px",
                                    borderRadius: "20px",
                                    border: "1px solid var(--border-default)",
                                    color: status === "Valid" ? "var(--text-primary)" : "var(--text-muted)",
                                    letterSpacing: "0.04em",
                                }}
                            >
                                {status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}