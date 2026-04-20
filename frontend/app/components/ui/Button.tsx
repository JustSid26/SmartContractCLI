import React from "react";

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    fullWidth?: boolean;
    variant?: "primary" | "ghost" | "secondary";
    className?: string;
}

export default function Button({
    children,
    onClick,
    disabled,
    fullWidth,
    variant = "primary",
    className = "",
}: ButtonProps) {
    const base = `
        inline-flex items-center justify-center gap-2
        px-5 py-2.5 rounded-xl text-sm font-semibold
        transition-all duration-150
        ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
        ${fullWidth ? "w-full" : ""}
        ${className}
    `;

    const variants: Record<string, string> = {
        primary: "bg-gradient-to-br from-primary-container to-primary text-white shadow-[0_0_20px_rgba(128,131,255,0.2)] hover:scale-[1.02] hover:shadow-[0_0_25px_rgba(128,131,255,0.3)]",
        ghost: "bg-transparent text-primary border border-outline-variant/20 hover:border-primary/50 hover:bg-primary/5",
        secondary: "bg-surface-container-high text-on-surface border border-outline-variant/10 hover:bg-surface-variant",
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${variants[variant]}`}
        >
            {children}
        </button>
    );
}