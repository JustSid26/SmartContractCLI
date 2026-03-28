import React from "react";

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    fullWidth?: boolean;
    variant?: "primary" | "ghost";
}

export default function Button({
    children,
    onClick,
    disabled,
    fullWidth,
    variant = "primary",
}: ButtonProps) {
    const base: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        padding: "10px 20px",
        borderRadius: "9px",
        fontSize: "13.5px",
        fontWeight: 500,
        letterSpacing: "-0.01em",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "all 0.15s",
        width: fullWidth ? "100%" : "auto",
        fontFamily: "inherit",
    };

    const primary: React.CSSProperties = {
        background: "#fff",
        color: "#000",
        border: "1px solid #fff",
    };

    const ghost: React.CSSProperties = {
        background: "transparent",
        color: "var(--text-primary)",
        border: "1px solid var(--border-default)",
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{ ...base, ...(variant === "ghost" ? ghost : primary) }}
            onMouseEnter={(e) => {
                if (!disabled) {
                    if (variant === "ghost") {
                        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
                        (e.currentTarget as HTMLElement).style.background = "var(--accent-dim)";
                    } else {
                        (e.currentTarget as HTMLElement).style.background = "#e6e6e6";
                    }
                }
            }}
            onMouseLeave={(e) => {
                if (!disabled) {
                    if (variant === "ghost") {
                        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                    } else {
                        (e.currentTarget as HTMLElement).style.background = "#fff";
                    }
                }
            }}
        >
            {children}
        </button>
    );
}