"use client";

export default function Header() {
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
            background: "#fff",
            opacity: 0.7,
          }}
        />
        Network: <span style={{ color: "var(--text-secondary)" }}>Sepolia</span>
      </div>

      <button
        style={{
          padding: "6px 16px",
          borderRadius: "8px",
          background: "transparent",
          border: "1px solid var(--border-default)",
          color: "var(--text-primary)",
          fontSize: "13px",
          fontWeight: 500,
          cursor: "pointer",
          transition: "all 0.15s",
          letterSpacing: "-0.01em",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = "var(--accent-dim)";
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = "transparent";
          (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
        }}
      >
        Connect Wallet
      </button>
    </header>
  );
}