"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import TrustScan from "../contracts/TrustScan";
import { useWallet } from "../genlayer/wallet";
import type { ScanResult, ScanRecord, ScanType, ChainType } from "../contracts/types";

// ─── Contract hook ───────────────────────────────────────────────────────────

export function useTrustScanContract(): TrustScan {
  const { address } = useWallet();
  return useMemo(() => new TrustScan(address), [address]);
}

// ─── Scan hook ───────────────────────────────────────────────────────────────

interface ScanParams {
  target: string;
  type: ScanType;
  chain: ChainType;
  address: string;
  isAudit?: boolean;
}

export function useScan() {
  const contract = useTrustScanContract();
  const { addScan } = useRecentScansStore();

  const [isScanning, setIsScanning] = useState(false);
  const [phase, setPhase] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [target, setTarget] = useState<string>("");
  const [isAudit, setIsAudit] = useState(false);

  const scan = useCallback(async ({ target: t, type, chain, address, isAudit: auditMode = false }: ScanParams) => {
    if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
      toast.error("Wallet not connected", {
        description: "Please connect your wallet before scanning.",
      });
      return;
    }

    setIsScanning(true);
    setResult(null);
    setTarget(t);
    setIsAudit(auditMode);

    const normalizedTarget = (type === "wallet" || type === "token")
      ? t.toLowerCase()
      : t;

    const standardPhases = [
      "Checking existing results...",
      "Submitting to GenLayer...",
      "AI validators fetching data...",
      "Cross-referencing sources...",
      "Reaching consensus...",
      "Finalizing...",
    ];

    const auditPhases = [
      "Decompiling bytecode...",
      "Analyzing storage slots...",
      "Mapping owner privileges...",
      "Simulating reentrancy vectors...",
      "Generating heuristic proof...",
      "Reaching AI Consensus...",
      "Finalizing Deep Report...",
    ];

    const phases = auditMode ? auditPhases : standardPhases;

    let phaseIdx = 0;
    setPhase(phases[0]);
    const phaseInterval = setInterval(() => {
      phaseIdx = Math.min(phaseIdx + 1, phases.length - 1);
      setPhase(phases[phaseIdx]);
    }, 15000);

    try {
      console.log("Checking for existing scan...");
      const existing = await contract.getRiskScore(normalizedTarget);
      console.log("Existing result:", existing);

      if (existing && existing.label !== "Not Scanned") {
        clearInterval(phaseInterval);
        setResult(existing);
        addScan({ ...existing, target: t, scannedAt: Date.now(), isAudit: auditMode });
        toast.success(auditMode ? "Deep Audit Loaded." : "Report Loaded.");
        return;
      }

      console.log("Submitting new scan...");
      setPhase(auditMode ? "Initiating Deep Audit..." : "Submitting to GenLayer...");
      const scanContract = new TrustScan(address);

      const receipt = await scanContract.submitTarget(normalizedTarget, type, chain);
      console.log("Transaction receipt:", receipt);

      console.log("Starting fetch retry loop...");
      setPhase(auditMode ? "Analyzing Logic..." : "Fetching result...");
      let scanResult: ScanResult | null = null;

      for (let i = 0; i < 60; i++) {
        console.log(`Fetch attempt ${i + 1}/60...`);
        scanResult = await contract.getRiskScore(normalizedTarget);
        console.log(`Attempt ${i + 1} result:`, scanResult);

        if (scanResult && scanResult.label !== "Not Scanned") {
          console.log("Got valid result!");
          break;
        }

        await new Promise(r => setTimeout(r, auditMode ? 4000 : 2500));
      }

      if (!scanResult) {
        throw new Error(auditMode ? "Audit Timeout. Contract complexity requires more compute." : "Result not ready.");
      }

      setResult(scanResult);
      addScan({ ...scanResult, target: t, scannedAt: Date.now(), isAudit: auditMode });
      toast.success(auditMode ? "Deep Audit Complete." : "Scan complete.");

    } catch (e: any) {
      console.error("Scan error:", e);
      toast.error(auditMode ? "Audit Failed" : "Scan failed", { description: e.message || "Try again." });
      setResult(null);
    } finally {
      clearInterval(phaseInterval);
      setPhase("");
      setIsScanning(false);
    }
  }, [contract, addScan]);

  return { scan, isScanning, phase, result, target, isAudit };
}

// ─── Flag hook ───────────────────────────────────────────────────────────────

interface FlagParams {
  target: string;
  evidence: string;
  address: string;
}

export function useFlag() {
  const [isFlagging, setIsFlagging] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string>("");

  const flag = useCallback(async ({ target, evidence, address }: FlagParams) => {
    if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
      toast.error("Wallet not connected", {
        description: "Please connect your wallet before submitting a flag.",
      });
      return;
    }

    setIsFlagging(true);
    setIsSuccess(false);
    setError("");

    try {
      const flagContract = new TrustScan(address);
      await flagContract.flagTarget(target, evidence);
      setIsSuccess(true);
      toast.success("Flag submitted.", {
        description: "Community report recorded on-chain.",
      });
    } catch (e: any) {
      const msg = e.message || "Flag submission failed.";
      setError(msg);
      toast.error("Flag failed", { description: msg });
    } finally {
      setIsFlagging(false);
    }
  }, []);

  return { flag, isFlagging, isSuccess, error };
}

// ─── Recent scans (persisted to localStorage) ─────────────────────────────

const LS_SCANS_KEY = "ts_recent_scans";
const MAX_SCANS = 10;

function loadScans(): ScanRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_SCANS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ScanRecord[];
  } catch { return []; }
}

function saveScans(scans: ScanRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_SCANS_KEY, JSON.stringify(scans));
  } catch {}
}

let _scans: ScanRecord[] = [];
let _selectedScan: ScanRecord | null = null;
const _listeners = new Set<() => void>();
const _selectedListeners = new Set<() => void>();

function notifyListeners() {
  _listeners.forEach(fn => fn());
}

function notifySelected() {
  _selectedListeners.forEach(fn => fn());
}

// ─── Global Cache for Lazy Loading ──────────────────────────────────────────

let _globalCache: Record<string, ScanRecord> = {};
const _globalListeners = new Set<() => void>();

function notifyGlobal() {
  _globalListeners.forEach(fn => fn());
}

// Internal store used by useScan — not exported
function useRecentScansStore() {
  const addScan = useCallback((scan: ScanRecord) => {
    const current = loadScans();
    const updated = [scan, ...current.filter(s => s.target !== scan.target)].slice(0, MAX_SCANS);
    _scans = updated;
    saveScans(updated);
    notifyListeners();
  }, []);
  return { addScan };
}

export function useRecentScans() {
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [selected, setSelected] = useState<ScanRecord | null>(null);

  useEffect(() => {
    const stored = loadScans();
    _scans = stored;
    setScans(stored);
    setSelected(_selectedScan);

    const listener = () => setScans([..._scans]);
    const selectedListener = () => setSelected(_selectedScan);
    
    _listeners.add(listener);
    _selectedListeners.add(selectedListener);

    const storageListener = (e: StorageEvent) => {
      if (e.key === LS_SCANS_KEY) {
        const updated = loadScans();
        _scans = updated;
        setScans(updated);
      }
    };
    window.addEventListener("storage", storageListener);

    return () => {
      _listeners.delete(listener);
      _selectedListeners.delete(selectedListener);
      window.removeEventListener("storage", storageListener);
    };
  }, []);

  const addScan = useCallback((scan: ScanRecord) => {
    const current = loadScans();
    const updated = [scan, ...current.filter(s => s.target !== scan.target)].slice(0, MAX_SCANS);
    _scans = updated;
    saveScans(updated);
    notifyListeners();
  }, []);

  const selectScan = useCallback((scan: ScanRecord | null) => {
    _selectedScan = scan;
    notifySelected();
    if (scan) {
      setTimeout(() => {
        document.getElementById("scan-result")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, []);

  return { scans, selected, selectScan, addScan };
}

export function useGlobalScans() {
  const contract = useTrustScanContract();
  const [globalTargets, setGlobalTargets] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const targets = await contract.getAllScanned();
      // Reverse to get newest first, limit to 20
      const recentTargets = targets.slice(-20).reverse();

      if (recentTargets.length === 0) {
        setGlobalTargets([]);
        return;
      }

      setGlobalTargets(recentTargets);

      // Pre-fetch the first 5 to ensure initial view is populated
      const top5 = recentTargets.slice(0, 5);
      const scores = await contract.getMultipleScores(top5);
      
      let changed = false;
      top5.forEach(t => {
        const s = scores[t];
        if (s && !_globalCache[t]) {
          _globalCache[t] = { ...s, target: t, scannedAt: Date.now() };
          changed = true;
        }
      });

      if (changed) notifyGlobal();

    } catch (e) {
      console.error("Failed to fetch global scans:", e);
    } finally {
      setIsLoading(false);
    }
  }, [contract]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [refresh]);

  return { globalTargets, isLoading, refresh };
}

/**
 * useGlobalScanResult
 * Loads and caches the result for a single global scan target.
 */
export function useGlobalScanResult(target: string) {
  const contract = useTrustScanContract();
  const [result, setResult] = useState<ScanRecord | null>(_globalCache[target] || null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const listener = () => {
      if (_globalCache[target]) {
        setResult(_globalCache[target]);
      }
    };
    _globalListeners.add(listener);
    
    // Initial load from cache if available
    if (_globalCache[target]) {
      setResult(_globalCache[target]);
    }
    
    return () => {
      _globalListeners.delete(listener);
    };
  }, [target]);

  const fetchScore = useCallback(async () => {
    if (_globalCache[target] || isLoading) return;
    
    setIsLoading(true);
    try {
      const score = await contract.getRiskScore(target);
      if (score) {
        const record = { ...score, target, scannedAt: Date.now() } as ScanRecord;
        _globalCache[target] = record;
        setResult(record);
        notifyGlobal();
      }
    } catch (e) {
      console.error(`Failed to fetch score for ${target}:`, e);
    } finally {
      setIsLoading(false);
    }
  }, [target, contract, isLoading]);

  return { result, isLoading, fetchScore };
}