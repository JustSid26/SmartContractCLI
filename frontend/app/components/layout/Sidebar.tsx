"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { href: "/", label: "Dashboard", icon: "⬡" },
    { href: "/validate", label: "Validate", icon: "◈" },
    { href: "#", label: "Deploy", icon: "↑" },
];

export default function Sidebar() {
    const [open, setOpen] = useState(true);
    const pathname = usePathname();

    return (
        <aside
            style={{
                width: open ? "220px" : "60px",
                background: "#f7f6f3",
                borderRight: "1px solid #e2e0db",
                transition: "width 0.25s ease",
                display: "flex",
                flexDirection: "column",
                minHeight: "100vh",
                flexShrink: 0,
                zIndex: 10,
                overflow: "hidden",
            }}
        >
            {/* Brand */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "16px 14px",
                    borderBottom: "1px solid #e2e0db",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    justifyContent: open ? "flex-start" : "center",
                }}
            >
                <div
                    style={{
                        width: "28px",
                        height: "28px",
                        background: "#1a1a1a",
                        borderRadius: "7px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        color: "#fff",
                        fontWeight: 700,
                        flexShrink: 0,
                    }}
                >
                    S
                </div>
                {open && (
                    <span
                        style={{
                            fontWeight: 600,
                            fontSize: "14px",
                            letterSpacing: "-0.02em",
                            color: "#1a1a1a",
                        }}
                    >
                        SmartCLI
                    </span>
                )}
            </div>

            {/* Collapse button — its own row */}
            <div
                style={{
                    padding: "6px 8px",
                    borderBottom: "1px solid #e2e0db",
                    display: "flex",
                    justifyContent: open ? "flex-end" : "center",
                }}
            >
                <button
                    onClick={() => setOpen(!open)}
                    title={open ? "Collapse" : "Expand"}
                    style={{
                        width: "28px",
                        height: "24px",
                        borderRadius: "5px",
                        background: "transparent",
                        border: "1px solid #d9d6d0",
                        color: "#9e9a94",
                        cursor: "pointer",
                        fontSize: "11px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.05)";
                        (e.currentTarget as HTMLElement).style.color = "#1a1a1a";
                        (e.currentTarget as HTMLElement).style.borderColor = "#bbb8b2";
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "#9e9a94";
                        (e.currentTarget as HTMLElement).style.borderColor = "#d9d6d0";
                    }}
                >
                    {open ? "←" : "→"}
                </button>
            </div>

            {/* Nav */}
            <nav
                style={{
                    flex: 1,
                    padding: "10px 8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                }}
            >
                {navItems.map(({ href, label, icon }) => {
                    const active = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "9px 10px",
                                justifyContent: open ? "flex-start" : "center",
                                borderRadius: "8px",
                                fontSize: "13.5px",
                                fontWeight: active ? 600 : 400,
                                color: active ? "#1a1a1a" : "#6b6863",
                                background: active ? "rgba(0,0,0,0.07)" : "transparent",
                                border: active ? "1px solid rgba(0,0,0,0.1)" : "1px solid transparent",
                                transition: "all 0.15s",
                                textDecoration: "none",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                            }}
                            onMouseEnter={(e) => {
                                if (!active) {
                                    (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.05)";
                                    (e.currentTarget as HTMLElement).style.color = "#1a1a1a";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!active) {
                                    (e.currentTarget as HTMLElement).style.background = "transparent";
                                    (e.currentTarget as HTMLElement).style.color = "#6b6863";
                                }
                            }}
                        >
                            <span style={{ fontSize: "15px", flexShrink: 0 }}>{icon}</span>
                            {open && <span>{label}</span>}
                        </Link>
                    );
                })}
            </nav>


        </aside>
    );
}