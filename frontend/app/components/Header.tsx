export default function Header() {
    return (
      <header className="h-16 border-b border-neutral-800 flex items-center px-6 justify-between">
        <div className="text-sm text-neutral-400">
          Connected Network: <span className="text-green-400">Sepolia</span>
        </div>
  
        <button className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg text-sm font-medium">
          Connect Wallet
        </button>
      </header>
    );
  }