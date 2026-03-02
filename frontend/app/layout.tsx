import "./globals.css";
import Link from "next/link";

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body className="bg-[#0e0e11] text-gray-200">
        <div className="flex min-h-screen">

            {/* Sidebar */}
            <aside className="w-64 bg-[#15151a] border-r border-gray-800 p-6 space-y-6">
                <h1 className="text-xl font-bold text-white">
                    SmartContractCLI
                </h1>

                <nav className="space-y-3 text-sm">
                    <Link href="/" className="block hover:text-white">
                        Dashboard
                    </Link>
                    <Link href="/validate" className="block hover:text-white">
                        Validate
                    </Link>
                    <Link href="#" className="block text-gray-500">
                        Deploy (soon)
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-10">{children}</main>

        </div>
        </body>
        </html>
    );
}