"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Search, Shield, AlertTriangle, XCircle, Copy, Check, Flag, Share2, ChevronDown, ChevronUp, Layers, Download } from "lucide-react";
import { Logo } from "./Logo";
import { useWallet } from "@/lib/genlayer/wallet";
import { useScan, useRecentScans } from "@/lib/hooks/useTrustScan";
import { useSeenFlags } from "@/lib/hooks/useNotificationSystem";
import { Badge } from "./ui/badge";
import { FlagModal } from "@/components/FlagModal";
import TrustScan from "@/lib/contracts/TrustScan";
import type { ScanType, ChainType, FlagResult, ScanResult } from "@/lib/contracts/types";
import * as htmlToImage from "html-to-image";
import { toast } from "sonner";

const SCAN_TYPES: { value: ScanType; label: string; placeholder: string; hint: string; examples: string[] }[] = [
  { value: "wallet", label: "Wallet", placeholder: "0x742d35Cc6634C0532925...", hint: "Ethereum wallet address", examples: ["0x742d35Cc6634C0532925dA2B6F3ab4B6F4e3E1Aa", "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"] },
  { value: "url",    label: "URL",    placeholder: "suspicious-airdrop.com",   hint: "Website or domain to check", examples: ["cysicfinance.com", "uniswap-airdrop.net"] },
  { value: "token",  label: "Token",  placeholder: "0xdAC17F958D2ee523a2206...", hint: "Token contract address", examples: ["0xdAC17F958D2ee523a2206206994597C13D831ec7", "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"] },
];

const CHAINS: { value: ChainType; label: string }[] = [
  { value: "eth",  label: "ETH" },
  { value: "bsc",  label: "BSC" },
  { value: "base", label: "Base" },
];

const LABEL_CONFIG = {
  Safe: {
    color: "text-safe", bg: "bg-safe/8", border: "border-safe/25",
    glow: "shadow-[0_0_40px_oklch(0.85_0.20_155/0.20)]", cardGlow: "rgba(0,255,136,0.06)",
    dot: "bg-safe",
    icon: <Shield className="w-5 h-5" />, scoreColor: "text-safe",
    wowLine: "This target looks clean. Safe to interact.", wowColor: "text-safe",
  },
  Suspicious: {
    color: "text-suspicious", bg: "bg-suspicious/8", border: "border-suspicious/25",
    glow: "shadow-[0_0_40px_oklch(0.88_0.18_85/0.20)]", cardGlow: "rgba(255,184,0,0.06)",
    dot: "bg-suspicious",
    icon: <AlertTriangle className="w-5 h-5" />, scoreColor: "text-suspicious",
    wowLine: "Proceed with caution. Something doesn't add up.", wowColor: "text-suspicious",
  },
  Dangerous: {
    color: "text-dangerous", bg: "bg-dangerous/8", border: "border-dangerous/25",
    glow: "shadow-[0_0_40px_oklch(0.70_0.25_25/0.25)]", cardGlow: "rgba(255,61,90,0.08)",
    dot: "bg-dangerous",
    icon: <XCircle className="w-5 h-5" />, scoreColor: "text-dangerous",
    wowLine: "High risk detected. Do not interact with this target.", wowColor: "text-dangerous",
  },
};

const SEVERITY_CONFIG = {
  high:   { label: "High",   color: "text-destructive",      bg: "bg-destructive/10", border: "border-destructive/20" },
  medium: { label: "Medium", color: "text-yellow-400",        bg: "bg-yellow-400/10",  border: "border-yellow-400/20" },
  low:    { label: "Low",    color: "text-muted-foreground",  bg: "bg-muted/20",       border: "border-border" },
};

const LIMIT = 10;
const LS_KEY = "ts_scan_data";

function getTodayKey() { return new Date().toISOString().split("T")[0]; }

function getRemaining(): number {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return LIMIT;
    const data = JSON.parse(raw);
    if (data.date !== getTodayKey()) return LIMIT;
    return Math.max(0, LIMIT - (data.count || 0));
  } catch { return LIMIT; }
}

function consumeScan(n = 1): number {
  try {
    const today = getTodayKey();
    const raw = localStorage.getItem(LS_KEY);
    let data = raw ? JSON.parse(raw) : {};
    if (data.date !== today) data = { date: today, count: 0 };
    data.count = (data.count || 0) + n;
    localStorage.setItem(LS_KEY, JSON.stringify(data));
    return Math.max(0, LIMIT - data.count);
  } catch { return LIMIT; }
}

function BatchResultCard({ target, result, flagCount }: { target: string; result: ScanResult | null; flagCount?: number }) {
  if (!result) {
    return (
      <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-muted/10 opacity-60">
        <div className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center flex-shrink-0 animate-pulse">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/30" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono text-muted-foreground truncate">{target}</p>
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest mt-1">Analyzing...</p>
        </div>
      </div>
    );
  }

  const cfg = LABEL_CONFIG[result.label as keyof typeof LABEL_CONFIG];
  if (!cfg) return null;

  return (
    <div className={`ts-glass p-5 flex items-start gap-4 group hover:bg-muted/5 transition-all text-left`}>
      <div className="relative flex-shrink-0 w-12 h-12 mt-1">
        <svg viewBox="0 0 80 80" className="w-12 h-12 -rotate-90">
          <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="8" className="text-border/40" />
          <circle cx="40" cy="40" r="32" fill="none" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${(result.score / 100) * 201} 201`}
            className={cfg.scoreColor} stroke="currentColor"
            style={{ filter: `drop-shadow(0 0 6px currentColor)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xs font-black ${cfg.scoreColor}`}>{result.score}</span>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-1">
          <p className="text-[12px] font-mono font-bold text-foreground truncate">{target}</p>
          <div className={`flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${cfg.color}`}>
            {result.label}
          </div>
        </div>
        
        <p className="text-[11px] text-muted-foreground leading-relaxed italic line-clamp-2 mb-2">
          {result.reason}
        </p>

        <div className="flex items-center gap-2">
           {flagCount && flagCount > 0 ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-destructive/10 border border-destructive/20 text-destructive text-[9px] font-black animate-pulse-slow">
              <Flag className="w-3 h-3" />
              {flagCount} Community Flags
            </div>
          ) : null}
          {result.signals_found?.[0] && (
            <span className={`text-[9px] px-2 py-0.5 rounded border border-border/40 font-black font-mono tracking-widest uppercase opacity-60 group-hover:opacity-100 transition-opacity`}>
              {result.signals_found[0]}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function ScanPanel() {
  const { address, isConnected } = useWallet();
  const { scan, isScanning, phase, result: scanResult, target: tempScannedTarget } = useScan();
  const { addScan, selected, selectScan } = useRecentScans();
  const seenFlags = useSeenFlags();

  // Combine live scan result with historical selection
  const result = selected || scanResult;
  const scannedTarget = selected?.target || tempScannedTarget;

  const [mode, setMode] = useState<"single" | "batch">("single");
  const [type, setType]     = useState<ScanType>("wallet");
  const [target, setTarget] = useState("");
  const [chain, setChain]   = useState<ChainType>("eth");
  
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [flagOpen, setFlagOpen]         = useState(false);
  const [showFlags, setShowFlags]       = useState(false);
  const [flags, setFlags]               = useState<FlagResult[]>([]);
  const [flagCount, setFlagCount]       = useState(0);
  const [loadingFlags, setLoadingFlags] = useState(false);

  const [batchInput, setBatchInput]   = useState("");
  const [batchType, setBatchType]     = useState<ScanType>("url");
  const [batchChain, setBatchChain]   = useState<ChainType>("eth");
  const [isBatchScanning, setIsBatchScanning] = useState(false);
  const [batchPhase, setBatchPhase]   = useState("");
  const [batchResults, setBatchResults] = useState<Record<string, ScanResult | null>>({});
  const [batchFlagCounts, setBatchFlagCounts] = useState<Record<string, number>>({});
  const [batchTargets, setBatchTargets] = useState<string[]>([]);

  const [remaining, setRemaining] = useState(() => {
    if (typeof window === "undefined") return LIMIT;
    return getRemaining();
  });

  const shareRef = useRef<HTMLDivElement>(null);
  const batchShareRef = useRef<HTMLDivElement>(null);
  const [batchSharing, setBatchSharing] = useState(false);
  
  const cfg = result ? LABEL_CONFIG[result.label as keyof typeof LABEL_CONFIG] : null;
  const currentType = SCAN_TYPES.find(t => t.value === type)!;

  useEffect(() => {
    setRemaining(getRemaining());
    const storageListener = (e: StorageEvent) => {
      if (e.key === LS_KEY) setRemaining(getRemaining());
    };
    window.addEventListener("storage", storageListener);
    return () => window.removeEventListener("storage", storageListener);
  }, []);

  useEffect(() => {
    if (!scannedTarget) return;
    const fetchFlags = async () => {
      setLoadingFlags(true);
      try {
        const contract = new TrustScan();
        const [flagData, count] = await Promise.all([
          contract.getFlags(scannedTarget),
          contract.getFlagCount(scannedTarget),
        ]);
        setFlags(flagData);
        setFlagCount(count);
      } catch (e) {
        console.error("Failed to load flags:", e);
      } finally {
        setLoadingFlags(false);
      }
    };
    fetchFlags();
  }, [scannedTarget]);

  const handleScan = () => {
    if (!target.trim() || !isConnected || !address || remaining <= 0) return;
    
    // Clear any historical selection when starting a new scan
    selectScan(null);
    
    setFlags([]);
    setFlagCount(0);
    setShowFlags(false);
    const newRemaining = consumeScan(1);
    setRemaining(newRemaining);
    scan({ target: target.trim(), type, chain, address });
  };

  const handleBatchScan = async () => {
    if (!isConnected || !address) return;
    const targets = batchInput.split("\n").map(t => t.trim()).filter(Boolean).slice(0, 10);
    if (targets.length === 0) return;
    if (targets.length > remaining) {
      toast.error(`Not enough quota. Remaining: ${remaining}`);
      return;
    }

    setIsBatchScanning(true);
    setBatchResults({});
    setBatchTargets(targets);
    setBatchPhase("Submitting batch...");

    try {
      const scanContract = new TrustScan(address);
      const normalized = targets.map(t => batchType !== "url" ? t.toLowerCase() : t);
      
      await scanContract.scanMultiple(normalized, batchType, batchChain);
      setRemaining(consumeScan(targets.length));

      setBatchPhase("Fetching AI results...");
      const readContract = new TrustScan();
      let results: Record<string, ScanResult | null> = {};

      for (let i = 0; i < 15; i++) {
        results = await readContract.getMultipleScores(normalized);
        if (normalized.every(t => results[t] !== null)) break;
        await new Promise(r => setTimeout(r, 4000));
      }

      setBatchResults(results);
      setBatchPhase("Checking flags...");
      const flagCounts: Record<string, number> = {};
      await Promise.all(normalized.map(async (t) => {
        flagCounts[t] = await readContract.getFlagCount(t);
      }));
      setBatchFlagCounts(flagCounts);

      Object.entries(results).forEach(([t, r]) => {
        if (r) addScan({ ...r, target: t, scannedAt: Date.now() });
      });

      toast.success("Batch scan complete!");
    } catch (e: any) {
      toast.error("Batch scan failed", { description: e.message });
    } finally {
      setIsBatchScanning(false);
      setBatchPhase("");
    }
  };

  const handleBatchShare = async () => {
    if (!batchShareRef.current) return;
    setBatchSharing(true);
    try {
      const dataUrl = await htmlToImage.toPng(batchShareRef.current, { quality: 1, pixelRatio: 2, backgroundColor: "#080b0f" });
      const link = document.createElement("a");
      link.download = `trustscan-batch.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Batch report exported!");
    } catch (e) {
      toast.error("Export failed");
    } finally { setBatchSharing(false); }
  };

  const handleCopy = () => {
    if (!result || !scannedTarget) return;
    const text = `TrustScan Report\nTarget: ${scannedTarget}\nScore: ${result.score}/100\nLabel: ${result.label}\n\nSignals: ${(result.signals_found ?? []).join(", ")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!shareRef.current) return;
    setSharing(true);
    try {
      const dataUrl = await htmlToImage.toPng(shareRef.current, { quality: 1, pixelRatio: 2, backgroundColor: "#080b0f" });
      const link = document.createElement("a");
      link.download = `trustscan-result.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) { console.error(e); }
    finally { setSharing(false); }
  };

  const handleFlagSuccess = async () => {
    setFlagOpen(false);
    if (!scannedTarget) return;
    const contract = new TrustScan();
    const [flagData, count] = await Promise.all([contract.getFlags(scannedTarget), contract.getFlagCount(scannedTarget)]);
    setFlags(flagData);
    setFlagCount(count);
    setShowFlags(true);
  };

  const batchTargetList = batchInput.split("\n").map(t => t.trim()).filter(Boolean).slice(0, 10);
  const hasBatchResults = Object.keys(batchResults).length > 0;

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/10 border border-border/40 w-fit backdrop-blur-md">
        <button onClick={() => setMode("single")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${mode === "single" ? "bg-card border border-border text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
          <Search className="w-3.5 h-3.5" /> Single Scan
        </button>
        <button onClick={() => setMode("batch")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${mode === "batch" ? "bg-card border border-border text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
          <Layers className="w-3.5 h-3.5" /> Batch Mode
        </button>
      </div>

      {mode === "single" && (
        <div className="ts-card p-6 md:p-8">
          <div className="flex items-center gap-1.5 mb-6 flex-wrap">
            <span className="label-mono mr-2">Type</span>
            {SCAN_TYPES.map(t => (
              <button key={t.value} onClick={() => setType(t.value)} disabled={isScanning} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${type === t.value ? "bg-primary/20 border border-primary/40 text-primary shadow-[0_0_15px_rgba(0,0,0,0.2)]" : "text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent"}`}>
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1 group">
               <input type="text" value={target} onChange={e => setTarget(e.target.value)} onKeyDown={e => e.key === "Enter" && !isScanning && handleScan()} placeholder={currentType.placeholder} disabled={isScanning} className="ts-input w-full px-5 py-4 text-sm font-mono" />
               <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/30"><Search className="w-5 h-5" /></div>
            </div>
            <button onClick={handleScan} disabled={isScanning || !target.trim() || !isConnected || remaining <= 0} className="btn-premium w-14 h-14 flex items-center justify-center flex-shrink-0">
               {isScanning ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
            </button>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/40">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
              {isScanning ? <span className="text-primary animate-pulse">{phase}</span> : currentType.hint}
            </span>
            <span className="label-mono">Quota: {remaining}/{LIMIT}</span>
          </div>
        </div>
      )}

      {mode === "batch" && (
        <div className="ts-card p-6">
          <div className="flex items-center gap-1.5 mb-4">
             {SCAN_TYPES.map(t => (
               <button key={t.value} onClick={() => setBatchType(t.value)} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${batchType === t.value ? "bg-primary/20 text-primary" : "text-muted-foreground"}`}>{t.label}</button>
             ))}
          </div>
          <textarea value={batchInput} onChange={e => setBatchInput(e.target.value)} placeholder={`Targets (one per line)...\n\ngoogle.com\nphishing-site.net`} disabled={isBatchScanning} rows={5} className="ts-input w-full px-4 py-3 text-sm font-mono resize-none leading-relaxed" />
          <div className="flex items-center justify-between mt-4">
             <span className="text-[10px] font-mono text-muted-foreground uppercase">{isBatchScanning ? batchPhase : `${batchTargetList.length} queued`}</span>
             <button onClick={handleBatchScan} disabled={isBatchScanning || batchTargetList.length === 0} className="btn-premium px-6 py-2 text-xs uppercase tracking-widest flex items-center gap-2">
               {isBatchScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />} Scan Batch
             </button>
          </div>
        </div>
      )}

      {isScanning && mode === "single" && (
        <div className="ts-card p-12 flex flex-col items-center gap-6 animate-pulse-slow">
           <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <Shield className="w-8 h-8 text-primary/60" />
           </div>
           <p className="text-lg font-black uppercase tracking-tighter">Analyzing Threat Vectors...</p>
        </div>
      )}

      {!isScanning && mode === "single" && result && scannedTarget && cfg && (
        <div className={`ts-card animate-slide-up ${cfg.glow}`} id="scan-result" style={{ background: `linear-gradient(135deg, ${cfg.cardGlow} 0%, transparent 60%)` }}>
           <div ref={shareRef} className="p-6 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${cfg.cardGlow} 0%, var(--background) 70%)` }}>
              <div className="flex items-center gap-6 mb-8">
                 <div className="relative flex-shrink-0 w-32 h-32 animate-hologram">
                    <svg viewBox="0 0 80 80" className="w-32 h-32 -rotate-90">
                       <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="4" className="text-border/40" />
                       <circle cx="40" cy="40" r="34" fill="none" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(result.score / 100) * 214} 214`} className={cfg.scoreColor} stroke="currentColor" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className={`text-4xl font-extrabold leading-none ${cfg.scoreColor}`}>{result.score}</span>
                       <span className="text-[10px] text-muted-foreground font-mono font-bold uppercase mt-1">TrustScore</span>
                    </div>
                 </div>
                 <div className="flex-1 space-y-4">
                    <div className={`inline-flex px-4 py-2 rounded-xl border text-2xl font-black uppercase tracking-tighter ${cfg.color} ${cfg.bg} ${cfg.border}`}>{result.label}</div>
                    <p className="text-xs font-mono text-muted-foreground truncate bg-muted/20 px-3 py-1.5 rounded-lg border border-border/40">{scannedTarget}</p>
                 </div>
              </div>
              <div className="p-4 rounded-xl bg-background/40 border border-border/60 backdrop-blur-md mb-6"><p className="text-sm italic text-foreground/90 leading-relaxed font-medium">"{result.reason}"</p></div>
              {result.signals_found && result.signals_found.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                   {result.signals_found.map((s, i) => <span key={i} className={`text-[10px] px-3 py-1 rounded-full border font-bold font-mono tracking-widest uppercase ${cfg.color} ${cfg.bg} ${cfg.border}`}>{s}</span>)}
                </div>
              )}
              <div className={`p-4 rounded-xl ${cfg.bg} border ${cfg.border} text-sm font-bold font-display`}>{cfg.wowLine}</div>
           </div>
           <div className="flex border-t border-border/40 divide-x divide-border/40 bg-muted/5">
              <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase text-muted-foreground hover:text-primary transition-all"><Share2 className="w-3.5 h-3.5" /> Share Proof</button>
              <button onClick={handleCopy} className="flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase text-muted-foreground hover:text-foreground transition-all"><Copy className="w-3.5 h-3.5" /> Copy Data</button>
              <button onClick={() => isConnected && setFlagOpen(true)} className="flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase text-muted-foreground hover:text-destructive transition-all"><Flag className="w-3.5 h-3.5" /> Flag {flagCount > 0 && `(${flagCount})`}</button>
           </div>
        </div>
      )}

      {mode === "batch" && hasBatchResults && (
        <div className="space-y-4 animate-slide-up">
           <div className="flex items-center justify-between px-2">
              <span className="label-mono">{batchResults.length} Units Analyzed</span>
              <button onClick={handleBatchShare} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest"><Download className="w-3.5 h-3.5" /> Export HD Report</button>
           </div>
           <div ref={batchShareRef} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[#080b0f] rounded-2xl border border-border/40">
              {batchTargets.map(t => (
                <BatchResultCard key={t} target={t} result={batchResults[t] ?? null} flagCount={batchFlagCounts[t] ?? 0} />
              ))}
           </div>
        </div>
      )}

      {flagOpen && scannedTarget && (
        <FlagModal target={scannedTarget} onClose={() => setFlagOpen(false)} onSuccess={handleFlagSuccess} />
      )}
    </div>
  );
}