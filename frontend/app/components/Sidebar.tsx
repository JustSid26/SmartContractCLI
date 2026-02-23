export default function Sidebar() {
    return (
      <aside className="w-64 bg-neutral-900 border-r border-neutral-800 p-6">
        <h1 className="text-xl font-bold mb-8 text-white">
          SmartContractCLI
        </h1>
  
        <nav className="space-y-4 text-sm">
          <div className="hover:text-white cursor-pointer">Dashboard</div>
          <div className="hover:text-white cursor-pointer">Deploy</div>
          <div className="hover:text-white cursor-pointer">Contracts</div>
          <div className="hover:text-white cursor-pointer">Settings</div>
        </nav>
      </aside>
    );
  }