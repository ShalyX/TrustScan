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
}

export function useScan() {
  const contract = useTrustScanContract();
  const { addScan } = useRecentScansStore();

  const [isScanning, setIsScanning] = useState(false);
  const [phase, setPhase] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [target, setTarget] = useState<string>("");

  const scan = useCallback(async ({ target: t, type, chain, address }: ScanParams) => {
    if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
      toast.error("Wallet not connected", {
        description: "Please connect your wallet before scanning.",
      });
      return;
    }

    setIsScanning(true);
    setResult(null);
    setTarget(t);

    const normalizedTarget = (type === "wallet" || type === "token")
      ? t.toLowerCase()
      : t;

    const phases = [
      "Checking existing results...",
      "Submitting to GenLayer...",
      "AI validators fetching data...",
      "Cross-referencing sources...",
      "Reaching consensus...",
      "Finalizing...",
    ];
    let phaseIdx = 0;
    setPhase(phases[0]);
    const phaseInterval = setInterval(() => {
      phaseIdx = Math.min(phaseIdx + 1, phases.length - 1);
      setPhase(phases[phaseIdx]);
    }, 20000);

    try {
      console.log("Checking for existing scan...");
      const existing = await contract.getRiskScore(normalizedTarget);
      console.log("Existing result:", existing);

      if (existing && existing.label !== "Not Scanned") {
        clearInterval(phaseInterval);
        setResult(existing);
        addScan({ ...existing, target: t, scannedAt: Date.now() });
        toast.success("Loaded from chain.");
        return;
      }

      console.log("Submitting new scan...");
      setPhase("Submitting to GenLayer...");
      const scanContract = new TrustScan(address);

      const receipt = await scanContract.submitTarget(normalizedTarget, type, chain);
      console.log("Transaction receipt:", receipt);
      console.log("Transaction hash:", receipt?.hash);

      console.log("Starting fetch retry loop...");
      setPhase("Fetching result...");
      let scanResult: ScanResult | null = null;

      for (let i = 0; i < 50; i++) {
        console.log(`Fetch attempt ${i + 1}/50...`);
        scanResult = await contract.getRiskScore(normalizedTarget);
        console.log(`Attempt ${i + 1} result:`, scanResult);

        if (scanResult && scanResult.label !== "Not Scanned") {
          console.log("Got valid result!");
          break;
        }

        console.log("No result yet, waiting 5 seconds...");
        await new Promise(r => setTimeout(r, 5000));
      }

      if (!scanResult) {
        console.error("No result after all retries");
        throw new Error("Result not ready. GenLayer AI is still processing. Please try checking again in a minute.");
      }

      console.log("Scan complete:", scanResult);
      setResult(scanResult);
      addScan({ ...scanResult, target: t, scannedAt: Date.now() });
      toast.success("Scan complete.");

    } catch (e: any) {
      console.error("Scan error:", e);
      toast.error("Scan failed", { description: e.message || "Please try again." });
      setResult(null);
    } finally {
      clearInterval(phaseInterval);
      setPhase("");
      setIsScanning(false);
    }
  }, [contract, addScan]);

  return { scan, isScanning, phase, result, target };
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
  const [globalScans, setGlobalScans] = useState<ScanRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const targets = await contract.getAllScanned();
      // Reverse to get newest first, limit to 20
      const recentTargets = targets.slice(-20).reverse();

      if (recentTargets.length === 0) {
        setGlobalScans([]);
        return;
      }

      const scores = await contract.getMultipleScores(recentTargets);
      const records: ScanRecord[] = recentTargets
        .map(t => {
          const s = scores[t];
          if (!s) return null;
          return { ...s, target: t, scannedAt: Date.now() } as ScanRecord;
        })
        .filter((r): r is ScanRecord => r !== null);

      setGlobalScans(records);
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

  return { globalScans, isLoading, refresh };
}