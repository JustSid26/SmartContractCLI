"use client";

import { useRef } from "react";

export type FileStatus = "pending" | "validating" | "valid" | "failed";

export interface FileItem {
    file: File;
    status: FileStatus;
    result?: unknown;
    error?: string;
}

interface Props {
    files: FileItem[];
    setFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
    chain: string;
}

export default function FileUploader({ files, setFiles, chain }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const newFiles = Array.from(e.target.files).map((f) => ({
            file: f,
            status: "pending" as FileStatus
        }));
        setFiles(prev => [...prev, ...newFiles]);
        e.target.value = '';
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const acceptExt = chain === "Solana" ? ".so" : ".wasm";

    return (
        <div className="flex flex-col gap-4">
            <input
                type="file"
                accept={acceptExt}
                multiple
                ref={inputRef}
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Drop zone */}
            <div
                className="group relative bg-surface-container-low rounded-2xl p-12 border-2 border-dashed border-outline-variant hover:border-primary transition-all duration-300 flex flex-col items-center justify-center text-center overflow-hidden cursor-pointer"
                onClick={() => inputRef.current?.click()}
            >
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative w-16 h-16 mb-4 bg-surface-container-high rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span
                        className="material-symbols-outlined text-3xl text-primary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                        upload_file
                    </span>
                </div>
                <h3 className="text-lg font-semibold mb-1">Drop your contract files</h3>
                <p className="text-on-surface-variant text-sm max-w-xs leading-relaxed">
                    Click to select multiple <span className="font-mono text-xs text-primary">{acceptExt}</span> files for batch validation
                </p>
            </div>

            {/* File list */}
            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((f, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between p-3 bg-surface-container-lowest rounded-xl border border-outline-variant/10"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    f.status === "valid" ? "bg-emerald-500/10 text-emerald-400" :
                                    f.status === "failed" ? "bg-error-container/20 text-error" :
                                    f.status === "validating" ? "bg-indigo-500/10 text-indigo-400" :
                                    "bg-zinc-900 text-zinc-500"
                                }`}>
                                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        {f.status === "valid" ? "verified" : f.status === "failed" ? "dangerous" : f.status === "validating" ? "sync" : "draft"}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white font-mono">{f.file.name}</p>
                                    <p className="text-[10px] text-zinc-500 font-mono">
                                        {(f.file.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                    f.status === "valid"
                                        ? "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
                                        : f.status === "failed"
                                        ? "bg-error-container/20 border border-error/20 text-error"
                                        : f.status === "validating"
                                        ? "bg-tertiary/10 border border-tertiary/20 text-tertiary"
                                        : "bg-surface-container-high text-on-surface-variant"
                                }`}>
                                    {f.status}
                                </span>
                            </div>
                            <button
                                onClick={() => removeFile(i)}
                                className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}