"use client";

import { Clock, Shield, AlertTriangle, XCircle, ChevronRight } from "lucide-react";
import { useRecentScans } from "@/lib/hooks/useTrustScan";
import { useWallet } from "@/lib/genlayer/wallet";
import { AddressDisplay } from "./AddressDisplay";
import type { ScanResult } from "@/lib/contracts/types";

const LABEL_CONFIG = {
  Safe: {
    color: "text-primary",
    bg: "bg-primary/8",
    border: "border-primary/20",
    dot: "bg-primary",
    icon: <Shield className="w-3.5 h-3.5" />,
  },
  Suspicious: {
    color: "text-yellow-400",
    bg: "bg-yellow-400/8",
    border: "border-yellow-400/20",
    dot: "bg-yellow-400",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  },
  Dangerous: {
    color: "text-destructive",
    bg: "bg-destructive/8",
    border: "border-destructive/20",
    dot: "bg-destructive",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

function timeAgo(ts: number) {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function shortTarget(t: string) {
  return t.length > 28 ? `${t.slice(0, 14)}...${t.slice(-6)}` : t;
}

export function RecentScans() {
  const { scans, selectScan } = useRecentScans();
  const { address } = useWallet();

  if (!scans.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
        <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Recent Scans
        </h2>
        <span className="text-xs font-mono text-muted-foreground bg-muted/30 border border-border px-2 py-0.5 rounded-full">
          {scans.length}
        </span>
      </div>

      <div className="space-y-1">
        {scans.map((scan, i) => {
          const cfg = LABEL_CONFIG[scan.label as keyof typeof LABEL_CONFIG];
          if (!cfg) return null;

          return (
            <button
              key={i}
              onClick={() => selectScan(scan)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-transparent hover:border-border hover:bg-card/60 transition-all text-left group"
            >
              {/* Dot */}
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot} shadow-[0_0_6px_currentColor]`} />

              {/* Target + type */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <p className="text-xs font-mono text-foreground/80 truncate">
                  {shortTarget(scan.target)}
                </p>
                <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
                  {scan.type ?? "scan"} · {scan.chain !== "n/a" ? scan.chain : "web"}
                </p>
              </div>

              {/* Label + score */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs font-bold font-mono ${cfg.color}`}>
                  {scan.label}
                </span>
                <span className={`text-sm font-bold font-mono ${cfg.color}`}>
                  {scan.score}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
              </div>

              {/* Time */}
              <span className="text-xs font-mono text-muted-foreground/50 flex-shrink-0 hidden sm:block">
                {timeAgo(scan.scannedAt)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}