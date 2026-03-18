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
    console.log("=== useScan.scan() START ===");
    console.log("Target:", t, "Type:", type, "Chain:", chain, "Address:", address);

    // FIX: Validate wallet address before doing anything
    if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
      console.log("❌ Wallet not connected or invalid address");
      toast.error("Wallet not connected", {
        description: "Please connect your wallet before scanning.",
      });
      return;
    }

    setIsScanning(true);
    setResult(null);
    setTarget(t);

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
    }, 18000);

    try {
      // Check cache first
      console.log("📡 Step 1: Checking existing results...");
      const existing = await contract.getRiskScore(t);
      console.log("📡 Existing result:", existing);
      
      if (existing) {
        console.log("✅ Found existing result, returning");
        clearInterval(phaseInterval);
        setResult(existing);
        addScan({ ...existing, target: t, scannedAt: Date.now() });
        toast.success("Loaded from chain.");
        return;
      }

      // Submit new scan — use validated address
      console.log("📡 Step 2: Submitting new scan...");
      setPhase("Submitting to GenLayer...");
      const scanContract = new TrustScan(address);
      
      console.log("📡 Calling submitTarget...");
      const receipt = await scanContract.submitTarget(t, type, chain);
      console.log("📡 Submit receipt:", receipt);

      // Fetch result with retry
      console.log("📡 Step 3: Fetching result with retry...");
      setPhase("Fetching result...");
      let scanResult: ScanResult | null = null;
      for (let i = 0; i < 8; i++) {
        console.log(`📡 Fetch attempt ${i + 1}/8...`);
        scanResult = await contract.getRiskScore(t);
        console.log("📡 Fetch result:", scanResult);
        if (scanResult) break;
        await new Promise(r => setTimeout(r, 3000));
      }

      if (!scanResult) {
        console.log("❌ No result after all retries");
        throw new Error("Result not ready. Transaction may still be processing.");
      }

      console.log("✅ Scan complete:", scanResult);
      setResult(scanResult);
      addScan({ ...scanResult, target: t, scannedAt: Date.now() });
      toast.success("Scan complete.");

    } catch (e: any) {
      console.error("❌ Scan error:", e);
      toast.error("Scan failed", { description: e.message || "Please try again." });
      setResult(null);
    } finally {
      clearInterval(phaseInterval);
      setPhase("");
      setIsScanning(false);
    }
  // FIX: Added addScan to dependency array to avoid stale closure
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
    // FIX: Validate wallet address before flagging
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
      console.error("Flag error:", e);
      const msg = e.message || "Flag submission failed.";
      setError(msg);
      toast.error("Flag failed", { description: msg });
    } finally {
      setIsFlagging(false);
    }
  }, []);

  return { flag, isFlagging, isSuccess, error };
}

// ─── Recent scans (in-memory store) ──────────────────────────────────────────

let _scans: ScanRecord[] = [];
const _listeners = new Set<() => void>();

function notifyListeners() {
  _listeners.forEach(fn => fn());
}

function useRecentScansStore() {
  const addScan = useCallback((scan: ScanRecord) => {
    _scans = [scan, ..._scans.filter(s => s.target !== scan.target)].slice(0, 10);
    notifyListeners();
  }, []);
  return { addScan };
}

export function useRecentScans() {
  const [scans, setScans] = useState<ScanRecord[]>(_scans);
  const [selected, setSelected] = useState<ScanRecord | null>(null);

  // FIX: useEffect (not useMemo) for subscriptions so cleanup actually runs
  useEffect(() => {
    const listener = () => setScans([..._scans]);
    _listeners.add(listener);
    return () => { _listeners.delete(listener); };
  }, []);

  const selectScan = useCallback((scan: ScanRecord) => {
    setSelected(scan);
    setTimeout(() => {
      document.getElementById("scan-result")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  return { scans, selected, selectScan };
}