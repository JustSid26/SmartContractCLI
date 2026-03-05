"use client";

import { useEffect, useState } from "react";
import { checkHealth } from "@/lib/api";

export default function Home() {
    const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

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

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
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
            </div>

            {/* Recent activity placeholder */}
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