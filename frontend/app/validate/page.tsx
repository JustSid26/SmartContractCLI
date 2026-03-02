"use client";

import { useState } from "react";
import FileUploader from "@/app/components/validate/FileUploader";
import ValidationResult from "@/app/components/validate/ValidationResult";
import Button from "@/app/components/ui/Button";
import Card from "@/app/components/ui/Card";
import { validateContract } from "@/lib/api";

export default function ValidatePage() {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<any>(null);
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
            setError(err.response?.data?.error || "Validation failed");
        }

        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-2xl font-semibold">Contract Validation</h2>

            <Card>
                <div className="space-y-6">
                    <FileUploader file={file} setFile={setFile} />

                    <Button
                        onClick={handleValidate}
                        disabled={!file || loading}
                        fullWidth
                    >
                        {loading ? "Validating..." : "Validate Contract"}
                    </Button>
                </div>
            </Card>

            <ValidationResult result={result} error={error} />
        </div>
    );
}