"use client";

interface Props {
  name: string;
  address: string;
}

export default function ContractCard({ name, address }: Props) {
  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "12px",
        padding: "20px",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-subtle)";
      }}
    >
      <h3
        style={{
          fontWeight: 600,
          fontSize: "14px",
          color: "var(--text-primary)",
          marginBottom: "6px",
          letterSpacing: "-0.02em",
        }}
      >
        {name}
      </h3>
      <p
        style={{
          fontSize: "11.5px",
          color: "var(--text-muted)",
          fontFamily: "'JetBrains Mono', monospace",
          wordBreak: "break-all",
        }}
      >
        {address}
      </p>
    </div>
  );
}