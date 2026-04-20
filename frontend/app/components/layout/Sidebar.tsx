"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const mainNavItems = [
    { href: "/validate", label: "Validate", icon: "rule" },
];

const bottomNavItems: { href: string; label: string; icon: string }[] = [];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-full flex flex-col py-6 px-4 space-y-8 bg-zinc-900 w-64 z-50">
            {/* Brand */}
            <div className="flex items-center space-x-3 px-2">
                <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center">
                    <span
                        className="material-symbols-outlined text-white"
                        style={{ fontVariationSettings: "'FILL' 1", fontSize: "18px" }}
                    >
                        lens
                    </span>
                </div>
                <div>
                    <h1 className="text-lg font-black text-white leading-none">ContractLens</h1>
                </div>
            </div>

            {/* Main navigation */}
            <nav className="flex-1 space-y-1">
                {mainNavItems.map(({ href, label, icon }) => {
                    const active = pathname === href || (href === "/" && pathname === "/");
                    const isOverview = href === "/";
                    const isActive = isOverview ? pathname === "/" : pathname === href;

                    return (
                        <Link
                            key={href}
                            href={href === "/" || href === "/validate" ? href : "#"}
                            className={`
                                relative flex items-center rounded-md px-4 py-2.5 group transition-all
                                ${isActive
                                    ? "bg-zinc-800 text-white before:absolute before:left-0 before:w-[3px] before:h-2/3 before:bg-indigo-500"
                                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-indigo-300"
                                }
                            `}
                        >
                            <span className={`material-symbols-outlined mr-3 ${isActive ? "text-indigo-400" : ""}`}>
                                {icon}
                            </span>
                            <span className="font-medium text-sm">{label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom section */}
            <div className="pt-4 space-y-1">
            </div>
        </aside>
    );
}