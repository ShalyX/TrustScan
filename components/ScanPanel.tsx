"use client";

import { useState } from "react";
import { Loader2, Search, Shield, AlertTriangle, XCircle, Copy, Check, Flag } from "lucide-react";
import { useWallet } from "@/lib/genlayer/wallet";
import { useScan } from "@/lib/hooks/useTrustScan";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { FlagModal } from "@/components/FlagModal";
import type { ScanResult, ScanType, ChainType } from "@/lib/contracts/types";

const SCAN_TYPES: { value: ScanType; label: string; placeholder: string; hint: string }[] = [
  { value: "wallet", label: "Wallet", placeholder: "0x742d35Cc6634C0532925...", hint: "Ethereum wallet address" },
  { value: "url",    label: "URL",    placeholder: "suspicious-airdrop.com",   hint: "Website or domain to check" },
  { value: "token",  label: "Token",  placeholder: "0xdAC17F958D2ee523a2206...", hint: "Token contract address" },
];

const CHAINS: { value: ChainType; label: string }[] = [
  { value: "eth",  label: "ETH" },
  { value: "bsc",  label: "BSC" },
  { value: "base", label: "Base" },
];

const LABEL_CONFIG = {
  Safe: {
    color: "text-primary",
    bg: "bg-primary/8",
    border: "border-primary/25",
    glow: "shadow-[0_0_24px_oklch(0.82_0.18_155/0.12)]",
    icon: <Shield className="w-5 h-5" />,
    scoreColor: "text-primary",
  },
  Suspicious: {
    color: "text-yellow-400",
    bg: "bg-yellow-400/8",
    border: "border-yellow-400/25",
    glow: "shadow-[0_0_24px_oklch(0.80_0.18_80/0.12)]",
    icon: <AlertTriangle className="w-5 h-5" />,
    scoreColor: "text-yellow-400",
  },
  Dangerous: {
    color: "text-destructive",
    bg: "bg-destructive/8",
    border: "border-destructive/25",
    glow: "shadow-[0_0_24px_oklch(0.65_0.22_25/0.15)]",
    icon: <XCircle className="w-5 h-5" />,
    scoreColor: "text-destructive",
  },
};

export function ScanPanel() {
  const { address, isConnected } = useWallet();
  const { scan, isScanning, phase, result, target: scannedTarget } = useScan();

  const [type, setType]     = useState<ScanType>("wallet");
  const [target, setTarget] = useState("");
  const [chain, setChain]   = useState<ChainType>("eth");
  const [copied, setCopied] = useState(false);
  const [flagOpen, setFlagOpen] = useState(false);

  const handleScan = () => {
    if (!target.trim()) return;
    if (!isConnected || !address) return;
    scan({ target: target.trim(), type, chain, address });
  };

  const handleCopy = () => {
    if (!result || !scannedTarget) return;
    const text = [
      `TrustScan Result`,
      `Target: ${scannedTarget}`,
      `Score:  ${result.score}/100`,
      `Label:  ${result.label}`,
      ``,
      result.reason,
      ``,
      `Signals: ${(result.signals_found ?? []).join(", ")}`,
      ``,
      `Powered by TrustScan on GenLayer`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cfg = result ? LABEL_CONFIG[result.label as keyof typeof LABEL_CONFIG] : null;

  return (
    <div className="space-y-4">
      {/* Input card */}
      <div className="ts-card p-5">
        {/* Type tabs */}
        <div className="flex items-center gap-1 mb-4 flex-wrap">
          {SCAN_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              disabled={isScanning}
              className={`px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-widest transition-all ${
                type === t.value
                  ? "bg-primary/15 border border-primary/40 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30 border border-transparent"
              }`}
            >
              {t.label}
            </button>
          ))}

          {type === "token" && (
            <div className="flex items-center gap-1 ml-auto">
              {CHAINS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setChain(c.value)}
                  disabled={isScanning}
                  className={`px-2.5 py-1.5 rounded-md text-xs font-mono transition-all ${
                    chain === c.value
                      ? "bg-primary/15 border border-primary/40 text-primary"
                      : "text-muted-foreground hover:text-foreground border border-transparent hover:border-border"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input row */}
        <div className="flex gap-2">
          <input
            type="text"
            value={target}
            onChange={e => setTarget(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !isScanning && handleScan()}
            placeholder={SCAN_TYPES.find(t => t.value === type)?.placeholder}
            disabled={isScanning}
            spellCheck={false}
            autoComplete="off"
            className="ts-input flex-1 px-4 py-3 text-sm font-mono min-w-0"
          />
          <button
            onClick={handleScan}
            disabled={isScanning || !target.trim() || !isConnected}
            className="btn-primary w-11 h-11 flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg"
          >
            {isScanning
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Search className="w-4 h-4" />
            }
          </button>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground font-mono">
            {isScanning && phase
              ? <span className="text-primary animate-pulse">{phase}</span>
              : SCAN_TYPES.find(t => t.value === type)?.hint
            }
          </span>
          {!isConnected && (
            <span className="text-xs text-muted-foreground font-mono">
              Connect wallet to scan
            </span>
          )}
        </div>
      </div>

      {/* Scanning skeleton */}
      {isScanning && (
        <div className="ts-card p-8 flex flex-col items-center gap-4">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            <Shield className="w-5 h-5 text-primary/60" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold">Analyzing target...</p>
            <p className="text-xs text-muted-foreground font-mono max-w-xs">
              GenLayer AI validators are cross-referencing Etherscan, GoPlus, and Chainabuse
            </p>
          </div>
        </div>
      )}

      {/* Result card */}
      {!isScanning && result && scannedTarget && cfg && (
        <div className={`ts-card overflow-hidden ${cfg.glow}`} id="scan-result">
          <div className="p-6">
            {/* Score + Label */}
            <div className="flex items-center gap-5 mb-5">
              {/* Score ring */}
              <div className="relative flex-shrink-0 w-24 h-24">
                <svg viewBox="0 0 80 80" className="w-24 h-24 -rotate-90">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="6" className="text-border" />
                  <circle
                    cx="40" cy="40" r="32"
                    fill="none"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${(result.score / 100) * 201} 201`}
                    className={cfg.scoreColor}
                    stroke="currentColor"
                    style={{ filter: `drop-shadow(0 0 8px currentColor)`, transition: "stroke-dasharray 1s ease" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-bold leading-none ${cfg.scoreColor}`}>{result.score}</span>
                  <span className="text-xs text-muted-foreground font-mono">/100</span>
                </div>
              </div>

              {/* Label + target */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-lg font-bold uppercase tracking-wide ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                  {cfg.icon}
                  {result.label}
                </div>
                <p className="text-xs text-muted-foreground font-mono truncate">{scannedTarget}</p>
                <div className="flex gap-1.5">
                  {result.type && (
                    <Badge variant="outline" className="text-xs font-mono px-2">{result.type}</Badge>
                  )}
                  {result.chain && result.chain !== "n/a" && (
                    <Badge variant="outline" className="text-xs font-mono px-2">{result.chain}</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 rounded-lg bg-muted/15 border border-border mb-4">
              <p className="text-sm leading-relaxed">{result.reason}</p>
            </div>

            {/* Signals */}
            {result.signals_found && result.signals_found.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {result.signals_found.map((s: string, i: number) => (
                  <span
                    key={i}
                    className={`text-xs px-2.5 py-1 rounded-md border font-mono ${cfg.color} ${cfg.bg} ${cfg.border}`}
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            {/* Powered by */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground font-mono">TrustScan · GenLayer AI</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex border-t border-border divide-x divide-border">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
            >
              {copied
                ? <><Check className="w-3.5 h-3.5 text-primary" /> Copied</>
                : <><Copy className="w-3.5 h-3.5" /> Copy Result</>
              }
            </button>
            <button
              onClick={() => setFlagOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-mono text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              Flag Target
            </button>
          </div>
        </div>
      )}

      {flagOpen && scannedTarget && (
        <FlagModal
          target={scannedTarget}
          onClose={() => setFlagOpen(false)}
          onSuccess={() => {
            setFlagOpen(false);
          }}
        />
      )}
    </div>
  );
}