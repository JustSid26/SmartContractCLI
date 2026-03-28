interface Props {
    result?: any;
    error?: string | null;
}

export default function ValidationResult({ result, error }: Props) {
    if (result) {
        return (
            <div
                style={{
                    background: "rgba(34, 197, 94, 0.06)",
                    border: "1px solid rgba(34, 197, 94, 0.25)",
                    borderRadius: "12px",
                    padding: "20px 24px",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <span
                        style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "2px 9px",
                            borderRadius: "20px",
                            background: "rgba(34, 197, 94, 0.12)",
                            border: "1px solid rgba(34, 197, 94, 0.3)",
                            color: "#86efac",
                            letterSpacing: "0.05em",
                        }}
                    >
                        VALID
                    </span>
                    <span style={{ fontSize: "13.5px", color: "#86efac", fontWeight: 500 }}>
                        Validation Successful
                    </span>
                </div>
                <p style={{ fontSize: "12.5px", color: "#4ade80", fontFamily: "'JetBrains Mono', monospace", opacity: 0.7 }}>
                    Size: {result.size_bytes} bytes
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div
                style={{
                    background: "rgba(239, 68, 68, 0.06)",
                    border: "1px solid rgba(239, 68, 68, 0.25)",
                    borderRadius: "12px",
                    padding: "20px 24px",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    <span
                        style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "2px 9px",
                            borderRadius: "20px",
                            background: "rgba(239, 68, 68, 0.12)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            color: "#fca5a5",
                            letterSpacing: "0.05em",
                        }}
                    >
                        FAILED
                    </span>
                    <span style={{ fontSize: "13.5px", color: "#fca5a5", fontWeight: 500 }}>
                        Validation Failed
                    </span>
                </div>
                <pre
                    style={{
                        fontSize: "12px",
                        fontFamily: "'JetBrains Mono', monospace",
                        whiteSpace: "pre-wrap",
                        background: "rgba(239, 68, 68, 0.05)",
                        border: "1px solid rgba(239, 68, 68, 0.15)",
                        padding: "14px",
                        borderRadius: "8px",
                        color: "#fca5a5",
                        opacity: 0.85,
                        lineHeight: 1.6,
                    }}
                >
                    {error}
                </pre>
            </div>
        );
    }

    return null;
}