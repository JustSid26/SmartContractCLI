import "./globals.css"; // Ensure you have a declaration file for CSS modules
export const metadata = {
  title: "SmartContractCLI",
  description: "Manage and deploy smart contracts from a modern UI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-200">
        {children}
      </body>
    </html>
  );
}