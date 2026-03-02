interface Props {
    result?: any;
    error?: string | null;
}

export default function ValidationResult({ result, error }: Props) {
    if (result) {
        return (
            <div className="bg-[#1b2a1f] border border-green-700 rounded-xl p-6">
                <p className="text-green-400 font-semibold">
                    ✓ Validation Successful
                </p>
                <p className="text-sm mt-2">
                    Size: {result.size_bytes} bytes
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-[#2a1b1b] border border-red-700 rounded-xl p-6">
                <p className="text-red-400 font-semibold mb-2">
                    ✗ Validation Failed
                </p>
                <pre className="text-xs whitespace-pre-wrap bg-black/40 p-4 rounded">
          {error}
        </pre>
            </div>
        );
    }

    return null;
}