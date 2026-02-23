interface Props {
    name: string;
    address: string;
  }
  
  export default function ContractCard({ name, address }: Props) {
    return (
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl hover:border-indigo-500 transition">
        <h3 className="font-semibold text-white mb-2">{name}</h3>
        <p className="text-xs text-neutral-400 break-all">{address}</p>
      </div>
    );
  }