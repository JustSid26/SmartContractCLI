export default function Home() {
    return (
        <div className="space-y-6">

            <h2 className="text-2xl font-semibold">Dashboard</h2>

            <div className="grid grid-cols-3 gap-6">

                <div className="bg-[#1b1b22] p-6 rounded-xl border border-gray-800">
                    <p className="text-sm text-gray-400">Total Validations</p>
                    <p className="text-3xl font-bold mt-2">12</p>
                </div>

                <div className="bg-[#1b1b22] p-6 rounded-xl border border-gray-800">
                    <p className="text-sm text-gray-400">Last Contract Size</p>
                    <p className="text-3xl font-bold mt-2">134 KB</p>
                </div>

                <div className="bg-[#1b1b22] p-6 rounded-xl border border-gray-800">
                    <p className="text-sm text-gray-400">Status</p>
                    <p className="text-green-400 font-bold mt-2">Operational</p>
                </div>

            </div>

        </div>
    );
}