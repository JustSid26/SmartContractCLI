import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ContractCard from "./components/ContractCard";
import CommandTerminal from "./components/CommandTerminal";

export default function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="p-8 space-y-8 overflow-y-auto">
          <div>
            <h2 className="text-lg font-semibold mb-4">Recent Contracts</h2>

            <div className="grid grid-cols-3 gap-6">
              <ContractCard
                name="Voting Contract"
                address="0xA12fB45C78D9012Ef34567890AbCdEf123456789"
              />
              <ContractCard
                name="Token Contract"
                address="0x9FaBcD1234567890ABCDef1234567890AbCdEf12"
              />
              <ContractCard
                name="NFT Marketplace"
                address="0x4567890ABCDef1234567890AbCdEf1234567890"
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">CLI Output</h2>
            <CommandTerminal />
          </div>
        </main>
      </div>
    </div>
  );
}