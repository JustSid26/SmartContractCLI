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
        <div style={{ maxWidth: "680px", display: "flex", flexDirection: "column", gap: "32px" }}>

            {/* Page title */}
            <div>
                <h2
                    style={{
                        fontSize: "22px",
                        fontWeight: 600,
                        letterSpacing: "-0.03em",
                        color: "var(--text-primary)",
                        marginBottom: "4px",
                    }}
                >
                    Contract Validation
                </h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                    Upload a <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px" }}>.wasm</span> file to validate it
                </p>
            </div>

            <Card title="Upload File">
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <FileUploader file={file} setFile={setFile} />
                    <Button
                        onClick={handleValidate}
                        disabled={!file || loading}
                        fullWidth
                    >
                        {loading ? "Validating…" : "Validate Contract"}
                    </Button>
                </div>
            </Card>

            <ValidationResult result={result} error={error} />
        </div>
    );
}