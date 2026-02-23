export default function CommandTerminal() {
    return (
      <div className="bg-black border border-neutral-800 rounded-xl p-6 font-mono text-sm text-green-400">
        <p>$ smartcli deploy --network sepolia</p>
        <p>Deploying contract...</p>
        <p>Contract deployed at 0xAbC123...9Fa</p>
      </div>
    );
  }