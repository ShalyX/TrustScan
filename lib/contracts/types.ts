export type ScanType = "wallet" | "url" | "token";
export type ChainType = "eth" | "bsc" | "base";
export type RiskLabel = "Safe" | "Suspicious" | "Dangerous";

export interface ScanResult {
  type: ScanType | string;
  chain: ChainType | "n/a" | string;
  score: number;
  label: RiskLabel;
  reason: string;
  signals_found: string[];
}

export interface ScanRecord extends ScanResult {
  target: string;
  scannedAt: number;
}

export interface FlagResult {
  reporter: string;
  evidence: string;
  severity: "low" | "medium" | "high";
  credible: boolean;
  summary: string;
}

export interface TransactionReceipt {
  status: string;
  hash: string;
  blockNumber?: number;
  [key: string]: any;
}