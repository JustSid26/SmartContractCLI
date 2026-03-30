import "./globals.css";
import Sidebar from "@/app/components/layout/Sidebar";
import Header from "@/app/components/Header";
import Providers from "@/app/components/Providers";

export const metadata = {
    title: "SmartContractCLI",
    description: "Deploy and validate smart contracts",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <Providers>
                    <div className="flex min-h-screen relative z-10">

                        {/* Sidebar */}
                        <Sidebar />

                        {/* Main pane */}
                        <div className="flex-1 flex flex-col min-h-screen">
                            <Header />
                            <main className="flex-1 p-10">
                                {children}
                            </main>
                        </div>

                    </div>
                </Providers>
            </body>
        </html>
    );
}