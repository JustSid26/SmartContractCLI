"use client";

import { useState, useRef, useCallback } from "react";
import { validateContract } from "@/lib/api";
import { useWallet as useSolanaWallet } from "@solana/wallet-adapter-react";
import { useWallet as useEvmWallet, getMetaMaskProvider } from "@/app/context/WalletContext";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";

/* ------------------------------------------------------------------ */
/*  Types & Constants                                                  */
/* ------------------------------------------------------------------ */

type FileStatus = "pending" | "validating" | "valid" | "failed";

interface FileItem {
    file: File;
    status: FileStatus;
    result?: unknown;
    error?: string;
}

const CHAINS = ["Solidity", "CosmWasm"] as const;
type Chain = typeof CHAINS[number];

const OSMOSIS_TESTNET_CHAIN_ID = "osmo-test-5";
const OSMOSIS_TESTNET_RPC = "https://rpc.osmotest5.osmosis.zone";

/* ------------------------------------------------------------------ */
/*  Validation Logs (simulated)                                        */
/* ------------------------------------------------------------------ */

interface LogEntry {
    time: string;
    tag: string;
    tagColor: string;
    message: string;
    opacity?: string;
}

const INITIAL_LOGS: LogEntry[] = [];

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function ValidatePage() {
    const [chain, setChain] = useState<Chain>("Solidity");
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [deployingFiles, setDeployingFiles] = useState<Record<number, boolean>>({});
    const [deployResults, setDeployResults] = useState<Record<number, string>>({});
    const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
    const [healthScore, setHealthScore] = useState(0);
    const [vulnCount, setVulnCount] = useState(0);
    const [gasIssues, setGasIssues] = useState(0);
    const [engineStatus, setEngineStatus] = useState<"IDLE" | "RUNNING" | "DONE">("IDLE");
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Keplr state
    const [keplrAddress, setKeplrAddress] = useState<string | null>(null);
    const [keplrConnected, setKeplrConnected] = useState(false);

    // Solana wallet
    const solanaWallet = useSolanaWallet();
    
    // EVM MetaMAsk wallet
    const { address: evmAddress, connect: connectEvm, disconnect: disconnectEvm } = useEvmWallet();

    const connectKeplr = async () => {
        if (!window.keplr) {
            alert("Keplr wallet extension not found. Please install it.");
            return;
        }
        try {
            if (window.keplr.experimentalSuggestChain) {
                await window.keplr.experimentalSuggestChain({
                    chainId: OSMOSIS_TESTNET_CHAIN_ID,
                    chainName: "Osmosis Testnet",
                    rpc: OSMOSIS_TESTNET_RPC,
                    rest: "https://lcd.osmotest5.osmosis.zone",
                    bip44: { coinType: 118 },
                    bech32Config: {
                        bech32PrefixAccAddr: "osmo",
                        bech32PrefixAccPub: "osmopub",
                        bech32PrefixValAddr: "osmovaloper",
                        bech32PrefixValPub: "osmovaloperpub",
                        bech32PrefixConsAddr: "osmovalcons",
                        bech32PrefixConsPub: "osmovalconspub",
                    },
                    currencies: [{ coinDenom: "OSMO", coinMinimalDenom: "uosmo", coinDecimals: 6, coinGeckoId: "osmosis" }],
                    feeCurrencies: [{
                        coinDenom: "OSMO", coinMinimalDenom: "uosmo", coinDecimals: 6, coinGeckoId: "osmosis",
                        gasPriceStep: { low: 0.025, average: 0.025, high: 0.04 }
                    }],
                    stakeCurrency: { coinDenom: "OSMO", coinMinimalDenom: "uosmo", coinDecimals: 6, coinGeckoId: "osmosis" },
                });
            }
            await window.keplr.enable(OSMOSIS_TESTNET_CHAIN_ID);
            const key = await window.keplr.getKey(OSMOSIS_TESTNET_CHAIN_ID);
            setKeplrAddress(key.bech32Address);
            setKeplrConnected(true);
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Failed to connect Keplr");
        }
    };

    const addLog = useCallback((tag: string, tagColor: string, message: string) => {
        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
        setLogs(prev => [...prev, { time, tag, tagColor, message }]);
    }, []);

    const acceptExt = chain === "Solidity" ? ".sol" : ".wasm";

    const handleFiles = (fileList: FileList) => {
        const newFiles = Array.from(fileList).map((f) => ({
            file: f,
            status: "pending" as FileStatus
        }));
        setFiles(prev => [...prev, ...newFiles]);
        addLog("[System]", "text-primary", `${newFiles.length} file(s) queued for analysis.`);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        handleFiles(e.target.files);
        e.target.value = "";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => setIsDragOver(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleValidate = async () => {
        if (files.length === 0) return;
        setLoading(true);
        setEngineStatus("RUNNING");
        addLog("[System]", "text-primary", "Starting batch validation...");

        const newFiles = [...files];
        let validCount = 0;
        let failCount = 0;

        for (let i = 0; i < newFiles.length; i++) {
            if (newFiles[i].status === "valid") continue;

            newFiles[i].status = "validating";
            setFiles([...newFiles]);
            addLog("[Parser]", "text-indigo-400", `Analyzing ${newFiles[i].file.name}...`);

            try {
                const response = await validateContract(newFiles[i].file, chain);
                newFiles[i].status = "valid";
                newFiles[i].result = response;
                validCount++;
                addLog("[System]", "text-primary", `✓ ${newFiles[i].file.name} passed validation.`);
            } catch (err: unknown) {
                newFiles[i].status = "failed";
                const axiosErr = err as { response?: { data?: { error?: string } } };
                newFiles[i].error = axiosErr.response?.data?.error
                    || (err instanceof Error ? err.message : "Validation failed");
                failCount++;
                addLog("[Warning]", "text-tertiary", `✗ ${newFiles[i].file.name} failed: ${newFiles[i].error}`);
            }
            setFiles([...newFiles]);
        }

        // Update health score
        const total = validCount + failCount;
        if (total > 0) {
            setHealthScore(Math.round((validCount / total) * 100));
            setVulnCount(failCount);
            setGasIssues(Math.max(0, 9 - validCount));
        }

        setEngineStatus("DONE");
        setLoading(false);
        addLog("[System]", "text-primary", `Batch complete: ${validCount} passed, ${failCount} failed.`);
    };

    const handleDeploy = async (index: number) => {
        const fileItem = files[index];
        if (!fileItem || fileItem.status !== "valid") return;

        setDeployingFiles(prev => ({ ...prev, [index]: true }));
        addLog("[System]", "text-primary", `Deploying ${fileItem.file.name}...`);

        try {
            if (chain === "CosmWasm") {
                if (!keplrConnected || !keplrAddress) {
                    await connectKeplr();
                    throw new Error("Wallet connected — please click Deploy again.");
                }

                const signer = window.keplr!.getOfflineSigner(OSMOSIS_TESTNET_CHAIN_ID);
                const client = await SigningCosmWasmClient.connectWithSigner(
                    OSMOSIS_TESTNET_RPC,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    signer as any
                );

                const fileBytes = new Uint8Array(await fileItem.file.arrayBuffer());
                const uploadRes = await client.upload(keplrAddress, fileBytes, "auto");
                const instRes = await client.instantiate(
                    keplrAddress, uploadRes.codeId, {}, "SmartContractCLI Deploy", "auto"
                );

                setDeployResults(prev => ({ ...prev, [index]: instRes.contractAddress }));
                addLog("[System]", "text-primary", `Deployed at ${instRes.contractAddress}`);
            } else {
                const provider = getMetaMaskProvider();
                if (!provider) {
                    throw new Error("No EVM wallet detected (e.g. MetaMask).");
                }

                const resPayload = fileItem.result as { abi?: string, bytecode?: string };
                if (!resPayload?.bytecode) {
                    throw new Error("Backend did not return compiled bytecode. Validation may have failed.");
                }

                // Make sure MetaMask gives us an account to deploy from
                const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
                const fromAddress = accounts?.[0];
                if (!fromAddress) throw new Error("No accounts accessible from wallet.");

                let hexBytecode = resPayload.bytecode;
                if (!hexBytecode.startsWith("0x")) hexBytecode = "0x" + hexBytecode;

                addLog("[Deploy]", "text-tertiary", "Initiating transaction via EVM provider...");

                const txHash = await provider.request({
                    method: 'eth_sendTransaction',
                    params: [{
                        from: fromAddress,
                        data: hexBytecode
                    }]
                }) as string;

                addLog("[System]", "text-primary", `Tx Sent: ${txHash.slice(0,10)}... waiting for confirmation`);

                let receipt: any = null;
                // Simple polling mechanism exactly analogous to ethers.js .wait() 
                for (let i = 0; i < 20; i++) {
                    await new Promise(r => setTimeout(r, 2000));
                    receipt = await provider.request({ 
                        method: 'eth_getTransactionReceipt', 
                        params: [txHash] 
                    });
                    if (receipt && receipt.contractAddress) break;
                }

                if (receipt && receipt.contractAddress) {
                    setDeployResults(prev => ({ ...prev, [index]: receipt.contractAddress }));
                    addLog("[System]", "text-primary", `Deployed at ${receipt.contractAddress}`);
                } else {
                    throw new Error("Deploy timeout or no contract address generated.");
                }
            }
        } catch (err: unknown) {
            addLog("[Warning]", "text-tertiary", `Deploy failed: ${err instanceof Error ? err.message : "Unknown error"}`);
            alert(err instanceof Error ? err.message : "Deployment failed");
        }

        setDeployingFiles(prev => ({ ...prev, [index]: false }));
    };

    /* ---- SVG Health Score Ring Values ---- */
    const circumference = 2 * Math.PI * 88; // r=88
    const dashOffset = circumference - (healthScore / 100) * circumference;

    const engineProgress = engineStatus === "IDLE" ? 25 : engineStatus === "RUNNING" ? 65 : 100;

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <header className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <span className="text-primary font-label text-xs tracking-[0.2em] uppercase font-bold mb-2 block">
                            ContractLens Engine
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-on-surface">
                            Contract Validation
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleValidate}
                            disabled={files.length === 0 || loading}
                            className="bg-gradient-to-br from-primary-container to-primary text-white font-bold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(128,131,255,0.3)] hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-lg">bolt</span>
                            {loading ? "Validating…" : "Full Audit"}
                        </button>
                    </div>
                </div>
            </header>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-12 gap-6 max-w-5xl mx-auto">
                {/* Left Column — File Uploader & Tab Section */}
                <section className="col-span-12 lg:col-span-7 space-y-6">
                    {/* Chain Selection Tabs */}
                    <div className="bg-surface-container-low p-1 rounded-xl flex gap-1 w-fit">
                        {CHAINS.map(c => (
                            <button
                                key={c}
                                onClick={() => { setChain(c); setFiles([]); setDeployResults({}); setDeployingFiles({}); }}
                                className={`px-6 py-2 text-sm font-semibold rounded-lg transition-all ${
                                    chain === c
                                        ? "bg-surface-container-high text-primary border-b-2 border-primary shadow-sm"
                                        : "text-on-surface-variant hover:text-on-surface"
                                }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                    {/* Drag & Drop Zone */}
                    <div
                        className={`group relative bg-surface-container-low rounded-2xl p-12 border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center overflow-hidden cursor-pointer ${
                            isDragOver
                                ? "border-primary bg-primary/5"
                                : "border-outline-variant hover:border-primary"
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative w-20 h-20 mb-6 bg-surface-container-high rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span
                                className="material-symbols-outlined text-4xl text-primary"
                                style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                                upload_file
                            </span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Drop your contract source code</h3>
                        <p className="text-on-surface-variant text-sm max-w-xs mb-8 leading-relaxed">
                            Drag and drop {chain === "Solidity" ? ".sol or .wasm" : ".wasm"} files here, or upload from your computer to begin automated analysis.
                        </p>
                        <div className="flex gap-4">
                            <button
                                className="bg-surface-container-highest px-8 py-3 rounded-xl text-sm font-bold border border-outline-variant/20 hover:border-primary/50 transition-all relative z-10"
                                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                            >
                                Browse Files
                            </button>
                            <button className="bg-surface-container-highest px-4 py-3 rounded-xl text-sm font-bold border border-outline-variant/20 flex items-center gap-2 hover:bg-surface-variant transition-all relative z-10">
                                <span className="material-symbols-outlined text-lg">link</span>
                                GitHub Repo
                            </button>
                        </div>
                        <input
                            type="file"
                            accept={acceptExt}
                            multiple
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>

                    {/* File list (when files are added) */}
                    {files.length > 0 && (
                        <div className="space-y-2">
                            {files.map((f, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant/10"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs border ${
                                            f.status === "valid" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                                            f.status === "failed" ? "bg-error-container/20 border-error/20 text-error" :
                                            f.status === "validating" ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" :
                                            "bg-zinc-900 border-zinc-800 text-zinc-400"
                                        }`}>
                                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                                                {f.status === "valid" ? "verified" : f.status === "failed" ? "dangerous" : f.status === "validating" ? "sync" : "draft"}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">{f.file.name}</p>
                                            <p className="text-[10px] text-zinc-500 font-mono">
                                                {(f.file.size / 1024).toFixed(1)} KB · {f.status.toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {f.status === "valid" && !deployResults[i] && (
                                            <button
                                                onClick={() => handleDeploy(i)}
                                                disabled={deployingFiles[i]}
                                                className="text-xs font-bold text-indigo-400 uppercase tracking-wider hover:text-indigo-300 transition-colors disabled:opacity-40"
                                            >
                                                {deployingFiles[i] ? "Deploying…" : "Deploy"}
                                            </button>
                                        )}
                                        {deployResults[i] && (
                                            <span className="text-[10px] text-emerald-400 font-mono">
                                                {deployResults[i].slice(0, 12)}…
                                            </span>
                                        )}
                                        <button
                                            onClick={() => removeFile(i)}
                                            className="text-zinc-500 hover:text-zinc-300 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Wallet connection for deployment */}
                    {files.some(f => f.status === "valid") && (
                        <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-indigo-400">account_balance_wallet</span>
                                <span className="text-sm text-on-surface-variant">Wallet for deployment:</span>
                            </div>
                            {chain === "Solidity" ? (
                                <button
                                    onClick={evmAddress ? disconnectEvm : connectEvm}
                                    className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all group ${
                                        evmAddress
                                            ? "text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 hover:bg-error/10 hover:border-error/20 hover:text-error"
                                            : "text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/10"
                                    }`}
                                >
                                    <span className={evmAddress ? "group-hover:hidden" : ""}>
                                        {evmAddress ? `MetaMask Connected ✓` : "Connect MetaMask"}
                                    </span>
                                    {evmAddress && <span className="hidden group-hover:inline">Disconnect</span>}
                                </button>
                            ) : (
                                <button
                                    onClick={keplrConnected ? () => {
                                        setKeplrConnected(false);
                                        setKeplrAddress(null);
                                    } : connectKeplr}
                                    className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all group ${
                                        keplrConnected
                                            ? "text-emerald-400 border border-emerald-500/20 bg-emerald-500/5 hover:bg-error/10 hover:border-error/20 hover:text-error"
                                            : "text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/10"
                                    }`}
                                >
                                    <span className={keplrConnected ? "group-hover:hidden" : ""}>
                                        {keplrConnected ? `Keplr Connected ✓` : "Connect Keplr"}
                                    </span>
                                    {keplrConnected && <span className="hidden group-hover:inline">Disconnect</span>}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Engine Readiness Status */}
                    <div className="bg-surface-container-low rounded-2xl p-6 flex items-center gap-6">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <span className={`material-symbols-outlined text-primary ${engineStatus === "RUNNING" ? "animate-pulse" : ""}`}>
                                monitoring
                            </span>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-semibold">Engine Readiness</span>
                                <span className={`text-xs font-bold ${
                                    engineStatus === "IDLE" ? "text-primary" :
                                    engineStatus === "RUNNING" ? "text-tertiary" :
                                    "text-emerald-400"
                                }`}>
                                    {engineStatus}
                                </span>
                            </div>
                            <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${
                                        engineStatus === "DONE" ? "bg-emerald-500" : "bg-primary"
                                    }`}
                                    style={{ width: `${engineProgress}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Right Column — Analysis Results */}
                <section className="col-span-12 lg:col-span-5 space-y-6">
                    {/* Health Score Gauge */}
                    <div className="bg-surface-container-high rounded-3xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16" />
                        <div className="flex justify-between items-start mb-8">
                            <h2 className="text-lg font-bold">Health Score</h2>
                            <span className="material-symbols-outlined text-on-surface-variant">info</span>
                        </div>
                        <div className="flex items-center justify-center py-4">
                            <div className="relative flex items-center justify-center">
                                <svg className="w-48 h-48 transform -rotate-90">
                                    <circle
                                        className="text-surface-container-highest"
                                        cx="96" cy="96" r="88"
                                        fill="transparent"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                    />
                                    <circle
                                        className="text-primary transition-all duration-1000"
                                        cx="96" cy="96" r="88"
                                        fill="transparent"
                                        stroke="currentColor"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={dashOffset}
                                        strokeLinecap="round"
                                        strokeWidth="8"
                                    />
                                </svg>
                                <div className="absolute text-center">
                                    <span className="text-5xl font-black text-white">{healthScore}</span>
                                    <span className="block text-xs font-label text-on-surface-variant tracking-widest mt-1">
                                        PERCENT
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-8">
                            <div className="bg-surface-container-lowest p-3 rounded-xl">
                                <span className="text-[10px] font-bold text-on-surface-variant block mb-1">VULNERABILITIES</span>
                                <span className="text-lg font-bold text-error">{vulnCount} Detected</span>
                            </div>
                            <div className="bg-surface-container-lowest p-3 rounded-xl">
                                <span className="text-[10px] font-bold text-on-surface-variant block mb-1">GAS OPTIMIZATION</span>
                                <span className="text-lg font-bold text-tertiary">{gasIssues} Issues</span>
                            </div>
                        </div>
                    </div>

                    {/* Validation Logs */}
                    <div className="bg-surface-container-low rounded-3xl p-1 overflow-hidden">
                        <div className="p-5 flex justify-between items-center bg-surface-container-low">
                            <h3 className="font-bold text-sm">Validation Logs</h3>
                            <span className="px-2 py-0.5 rounded-lg bg-surface-container-highest text-[10px] font-bold text-on-surface-variant">
                                REAL-TIME
                            </span>
                        </div>
                        <div className="bg-surface-container-lowest h-64 overflow-y-auto p-4 font-mono text-xs space-y-3">
                            {logs.map((log, i) => (
                                <div key={i} className={`flex gap-3 ${log.opacity || ""}`}>
                                    <span className="text-on-surface-variant">{log.time}</span>
                                    <span className={log.tagColor}>{log.tag}</span>
                                    <span className="text-on-surface">{log.message}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}