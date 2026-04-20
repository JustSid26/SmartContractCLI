import "./globals.css";
import Sidebar from "@/app/components/layout/Sidebar";
import Header from "@/app/components/Header";
import Providers from "@/app/components/Providers";

export const metadata = {
    title: "DevVault — ContractLens Dashboard",
    description: "Real-time analytical layer for smart contract integrity",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap"
                    rel="stylesheet"
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="bg-surface text-on-surface">
                <Providers>
                    {/* Fixed Sidebar */}
                    <Sidebar />

                    {/* Main content area — offset by sidebar width */}
                    <main className="ml-64 min-h-screen">
                        <Header />
                        <div className="pt-24 px-8 pb-12">
                            {children}
                        </div>
                    </main>
                </Providers>
            </body>
        </html>
    );
}