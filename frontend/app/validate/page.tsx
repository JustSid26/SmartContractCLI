"use client";

import { useState } from "react";
import { validateContract, ValidationSuccess } from "@/lib/api";

export default function ValidatePage() {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<ValidationSuccess | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleValidate = async () => {
        if (!file) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await validateContract(file);
            setResult(response);
        } catch (err: any) {
            setError(
                err.response?.data?.error || "Unexpected backend error"
            );
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-black text-white p-10">
            <h1 className="text-3xl font-bold mb-6">
                CosmWasm Contract Validator
            </h1>

            <div className="bg-gray-900 p-6 rounded-xl space-y-4 max-w-xl">

                <input
                    type="file"
                    accept=".wasm"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm"
                />

                <button
                    onClick={handleValidate}
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
                >
                    {loading ? "Validating..." : "Validate Contract"}
                </button>

                {result && (
                    <div className="bg-green-800 p-4 rounded">
                        <p className="font-semibold">Validation Successful</p>
                        <p className="text-sm mt-2">{result.message}</p>
                        <p className="text-sm mt-2">
                            Size: {result.size_bytes} bytes
                        </p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-800 p-4 rounded">
                        <p className="font-semibold">Validation Failed</p>
                        <p className="text-sm mt-2 whitespace-pre-wrap">
                            {error}
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
}