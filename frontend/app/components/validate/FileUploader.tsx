"use client";

import { useRef } from "react";
import Button from "@/app/components/ui/Button";

interface Props {
    file: File | null;
    setFile: (file: File | null) => void;
}

export default function FileUploader({ file, setFile }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <input
                type="file"
                accept=".wasm"
                ref={inputRef}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
            />

            <div
                style={{
                    border: "1px dashed var(--border-default)",
                    borderRadius: "10px",
                    padding: "32px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "12px",
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                }}
                onClick={() => inputRef.current?.click()}
                onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
                }}
            >
                <span style={{ fontSize: "24px", opacity: 0.4 }}>⬆</span>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center" }}>
                    Click to select a <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}>.wasm</span> file
                </p>
            </div>

            {file && (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 14px",
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "8px",
                    }}
                >
                    <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", fontFamily: "'JetBrains Mono', monospace" }}>
                        {file.name}
                    </p>
                    <button
                        onClick={() => setFile(null)}
                        style={{
                            background: "none",
                            border: "none",
                            color: "var(--text-muted)",
                            cursor: "pointer",
                            fontSize: "14px",
                            lineHeight: 1,
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}