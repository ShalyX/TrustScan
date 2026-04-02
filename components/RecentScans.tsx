"use client";

import { useState } from "react";
import { Clock, Shield, AlertTriangle, XCircle, ChevronRight, Globe, User, RefreshCw, Loader2, Flag, Terminal } from "lucide-react";
import { useRecentScans, useGlobalScans } from "@/lib/hooks/useTrustScan";
import { useSeenFlags } from "@/lib/hooks/useNotificationSystem";
import { GlobalScanItem } from "./GlobalScanItem";

const LABEL_CONFIG = {
  Safe: {
    color: "text-safe",
    bg: "bg-safe/8",
    border: "border-safe/20",
    dot: "bg-safe",
    icon: <Shield className="w-3.5 h-3.5" />,
  },
  Suspicious: {
    color: "text-suspicious",
    bg: "bg-suspicious/8",
    border: "border-suspicious/20",
    dot: "bg-suspicious",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  },
  Dangerous: {
    color: "text-dangerous",
    bg: "bg-destructive/8",
    border: "border-destructive/20",
    dot: "bg-dangerous",
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
  const { globalTargets, isLoading: isLoadingGlobal, refresh: refreshGlobal } = useGlobalScans();
  const seenFlags = useSeenFlags();
  const [view, setView] = useState<"local" | "global">("local");
  const [expandedTarget, setExpandedTarget] = useState<string | null>(null);

  const isEmpty = view === "local" ? scans.length === 0 : globalTargets.length === 0;

  const toggleExpand = (target: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTarget(expandedTarget === target ? null : target);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/10 border border-border/40 w-fit backdrop-blur-md">
          <button
            onClick={() => { setView("local"); setExpandedTarget(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
              view === "local"
                ? "bg-card border border-border text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            My Scans
            {scans.length > 0 && <span className="opacity-40 ml-1">({scans.length})</span>}
          </button>
          <button
            onClick={() => { setView("global"); setExpandedTarget(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
              view === "global"
                ? "bg-card border border-border text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Network Feed
          </button>
        </div>

        {view === "global" && (
          <button
            onClick={refreshGlobal}
            disabled={isLoadingGlobal}
            className="p-2.5 rounded-xl hover:bg-muted/30 text-muted-foreground hover:text-primary transition-all border border-transparent hover:border-border/40"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingGlobal ? "animate-spin" : ""}`} />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {isEmpty ? (
          <div className="ts-card p-16 flex flex-col items-center justify-center gap-4 border-dashed opacity-40 bg-transparent">
            {isLoadingGlobal && view === "global" ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-primary/30" />
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Syncing with GenLayer...</p>
              </>
            ) : (
              <>
                <Clock className="w-8 h-8 text-muted-foreground/20" />
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  {view === "local" ? "Archive is empty." : "No global threat data found."}
                </p>
              </>
            )}
          </div>
        ) : (
          view === "local" ? (
            scans.map((scan, i) => {
              const cfg = LABEL_CONFIG[scan.label as keyof typeof LABEL_CONFIG] || LABEL_CONFIG.Safe;
              const flagCount = seenFlags[scan.target] || 0;
              const isExpanded = expandedTarget === scan.target;

              return (
                <div
                  key={`${scan.target}-${i}`}
                  className="group relative overflow-hidden rounded-2xl ts-glass border border-border/40 hover:border-border transition-all"
                >
                  <div
                    onClick={(e) => toggleExpand(scan.target, e)}
                    className="w-full flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/5 transition-all text-left"
                  >
                    <div className={`absolute -left-12 top-0 w-24 h-full blur-[40px] opacity-[0.03] transition-opacity group-hover:opacity-[0.08] ${cfg.dot}`} />
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot} shadow-[0_0_8px_currentColor]`} />

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className={`text-sm font-mono truncate font-bold transition-colors ${isExpanded ? 'text-primary' : 'text-white'}`}>
                          {shortTarget(scan.target)}
                        </p>
                        {scan.isAudit && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[8px] font-black uppercase tracking-widest leading-none">
                            <Terminal className="w-2 h-2" />
                            Audit
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 label-mono">
                        <span className="opacity-80">{scan.type ?? "scan"}</span>
                        <span className="opacity-30">/</span>
                        <span className="opacity-80">{scan.chain && scan.chain !== "n/a" ? scan.chain : "web"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      {flagCount > 0 && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-destructive/10 border border-destructive/20 text-destructive animate-pulse-slow">
                          <Flag className="w-3 h-3" />
                          <span className="text-[10px] font-black font-mono">{flagCount}</span>
                        </div>
                      )}
                      <div className="flex flex-col items-end">
                        <span className={`text-[10px] font-black font-mono tracking-widest uppercase ${cfg.color}`}>
                          {scan.label}
                        </span>
                        <span className={`text-sm font-black font-mono leading-none ${cfg.color} tracking-tighter`}>
                          {scan.score}<span className="text-[10px] opacity-30 ml-0.5">/100</span>
                        </span>
                      </div>
                      <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-primary' : 'text-muted-foreground/20 group-hover:text-primary'}`}>
                        <ChevronRight className="w-5 h-5 rotate-90" />
                      </div>
                    </div>
                  </div>

                  <div className={`transition-all duration-500 ease-in-out border-t border-border/10 bg-muted/5 overflow-hidden ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 invisible'}`}>
                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between gap-4">
                         <p className="text-[10px] font-mono text-muted-foreground break-all bg-muted/10 p-2 rounded border border-border/20">
                            {scan.target}
                         </p>
                         <span className="text-[9px] font-mono opacity-20 uppercase tracking-[2px] flex-shrink-0">
                            {timeAgo(scan.scannedAt)}
                         </span>
                      </div>

                      <div className="space-y-3">
                         <p className="label-mono opacity-100 text-foreground/40">AI Summary Proof</p>
                         <p className="text-xs leading-relaxed text-muted-foreground bg-card/40 p-4 rounded-xl border border-border/20">
                            {scan.reason || "No summary available for this historical record."}
                         </p>
                      </div>

                      {scan.signals_found && scan.signals_found.length > 0 && (
                         <div className="space-y-3">
                            <p className="label-mono opacity-100 text-foreground/40">Attack Vectors Detected</p>
                            <div className="flex flex-wrap gap-2">
                               {scan.signals_found.map((sig, idx) => (
                                  <span key={idx} className="text-[10px] px-2.5 py-1 rounded-lg bg-destructive/5 border border-destructive/20 text-destructive/80 font-black font-mono tracking-widest uppercase">
                                     {sig}
                                  </span>
                               ))}
                            </div>
                         </div>
                      )}

                      <div className="flex justify-end pt-2">
                         <button
                            onClick={() => selectScan(scan)}
                            className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-2"
                         >
                            View Full Deep Report
                            <ChevronRight className="w-3.5 h-3.5" />
                         </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            globalTargets.map((target, i) => (
              <GlobalScanItem
                key={`${target}-${i}`}
                target={target}
                isExpanded={expandedTarget === target}
                onToggle={() => setExpandedTarget(expandedTarget === target ? null : target)}
              />
            ))
          )
        )}
      </div>
    </div>
  );
}