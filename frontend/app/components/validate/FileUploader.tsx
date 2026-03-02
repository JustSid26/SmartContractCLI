"use client";

import { useRef } from "react";
import Button from "@/app/components/ui/Button";

interface Props {
    file: File | null;
    setFile: (file: File | null) => void;
}

export default function FileUploader({ file, setFile }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="space-y-4">
            <input
                type="file"
                accept=".wasm"
                ref={inputRef}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
            />

            <Button onClick={() => inputRef.current?.click()}>
                Choose .wasm File
            </Button>

            {file && (
                <p className="text-sm text-gray-400">
                    Selected: <span className="text-white">{file.name}</span>
                </p>
            )}
        </div>
    );
}