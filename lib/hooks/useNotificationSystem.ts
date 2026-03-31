"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useRecentScans, useTrustScanContract } from "./useTrustScan";
import type { ScanRecord } from "../contracts/types";

const LS_FLAGS_KEY = "ts_seen_flags";

interface SeenFlags {
  [target: string]: number;
}

function loadSeenFlags(): SeenFlags {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LS_FLAGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSeenFlags(flags: SeenFlags) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_FLAGS_KEY, JSON.stringify(flags));
}

/**
 * useFlagMonitor
 * Periodically checks the on-chain flag count for all local scans.
 * Triggers a notification if a new flag is detected.
 */
export function useFlagMonitor() {
  const { scans } = useRecentScans();
  const contract = useTrustScanContract();
  const lastCheckRef = useRef<number>(0);

  const checkFlags = useCallback(async (currentScans: ScanRecord[]) => {
    if (currentScans.length === 0) return;

    // Prevent excessive calls
    const now = Date.now();
    if (now - lastCheckRef.current < 30000) return; 
    lastCheckRef.current = now;

    console.log(`[FlagMonitor] Checking flags for ${currentScans.length} targets...`);
    
    const seenFlags = loadSeenFlags();
    const newSeenFlags = { ...seenFlags };
    let hasNewFlag = false;

    try {
      // Check each target (GenLayer reads are fast)
      for (const scan of currentScans) {
        const count = await contract.getFlagCount(scan.target);
        const lastSeen = seenFlags[scan.target] || 0;

        if (count > lastSeen) {
          console.log(`[FlagMonitor] NEW FLAG for ${scan.target}: ${count} vs ${lastSeen}`);
          hasNewFlag = true;
          
          toast.warning("New Flag Alert", {
            description: `A target you scanned (${scan.target.slice(0, 10)}...) has been flagged ${count} time(s).`,
            duration: 8000,
          });
        }
        
        // Update seen count
        newSeenFlags[scan.target] = count;
      }

      if (hasNewFlag) {
        saveSeenFlags(newSeenFlags);
      }
    } catch (e) {
      console.error("[FlagMonitor] Failed to poll flag counts:", e);
    }
  }, [contract]);

  useEffect(() => {
    // Initial check
    checkFlags(scans);

    // Poll every 60 seconds
    const interval = setInterval(() => checkFlags(scans), 60000);
    return () => clearInterval(interval);
  }, [scans, checkFlags]);
}

/**
 * useSeenFlags
 * Hook for UI components to get the reactive seen flags map.
 */
export function useSeenFlags() {
  const [seenFlags, setSeenFlags] = useState<SeenFlags>(loadSeenFlags());

  useEffect(() => {
    const listener = (e: StorageEvent) => {
      if (e.key === LS_FLAGS_KEY) {
        setSeenFlags(loadSeenFlags());
      }
    };
    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }, []);

  return seenFlags;
}
