import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import type { ScanResult, FlagResult, ScanType, ChainType, TransactionReceipt } from "./types";

const STUDIO_URL =
  process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api";

const CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) ||
  "0x9312Fdc35E76Cb6e4a9ec9F0D2548834ce525eC9";

function isValidAddress(addr: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(addr);
}

class TrustScan {
  private contractAddress: `0x${string}`;
  private client: ReturnType<typeof createClient>;
  private hasAccount: boolean;

  constructor(address?: string | null) {
    this.contractAddress = CONTRACT_ADDRESS;
    this.hasAccount = !!address && isValidAddress(address);

    const config: any = {
      chain: studionet,
      endpoint: STUDIO_URL,
    };

    if (this.hasAccount) {
      config.account = address as `0x${string}`;
    }

    this.client = createClient(config);
  }

  updateAccount(address: string): void {
    if (!isValidAddress(address)) {
      console.warn("Invalid address provided");
      return;
    }
    this.hasAccount = true;
    this.client = createClient({
      chain: studionet,
      endpoint: STUDIO_URL,
      account: address as `0x${string}`,
    } as any);
  }

  private isReady(): boolean {
    return isValidAddress(this.contractAddress);
  }

  // ─── READ METHODS ───────────────────────────────────────

  async getRiskScore(target: string): Promise<ScanResult | null> {
    if (!this.isReady()) return null;

    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_risk_score",
        args: [target],
      });

      let data: any = result;
      if (result instanceof Map) {
        data = Object.fromEntries(result);
      }

      const score = data.score;
      const label = data.label;

      if (!data || score === -1 || score === -1n || label === "Not Scanned") {
        return null;
      }

      return {
        ...data,
        score: Number(score),
      } as ScanResult;
    } catch (e) {
      console.error("getRiskScore error:", e);
      return null;
    }
  }

  async getMultipleScores(
    targets: string[]
  ): Promise<Record<string, ScanResult | null>> {
    if (!this.isReady()) return {};
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_multiple_scores",
        args: [targets],
      });

      // Result is a dict/Map of target -> scan result
      let data: Record<string, any> = {};
      if (result instanceof Map) {
        data = Object.fromEntries(result);
      } else if (typeof result === "object" && result !== null) {
        data = result;
      }

      // Normalize each entry
      const normalized: Record<string, ScanResult | null> = {};
      for (const [target, raw] of Object.entries(data)) {
        let entry: any = raw;
        if (raw instanceof Map) entry = Object.fromEntries(raw);
        if (!entry || entry.score === -1 || entry.score === -1n || entry.label === "Not Scanned") {
          normalized[target] = null;
        } else {
          normalized[target] = { ...entry, score: Number(entry.score) } as ScanResult;
        }
      }
      return normalized;
    } catch (e) {
      console.error("getMultipleScores error:", e);
      return {};
    }
  }

  async getFlags(target: string): Promise<FlagResult[]> {
    if (!this.isReady()) return [];
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_flags",
        args: [target],
      });

      let data = result;
      if (result instanceof Map) {
        data = Object.fromEntries(result);
      }

      if (!Array.isArray(data)) return [];
      return data as FlagResult[];
    } catch (e) {
      console.error("getFlags error:", e);
      return [];
    }
  }

  async getFlagCount(target: string): Promise<number> {
    if (!this.isReady()) return 0;
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_flag_count",
        args: [target],
      });
      return Number(result) || 0;
    } catch (e) {
      console.error("getFlagCount error:", e);
      return 0;
    }
  }

  async getAllScanned(): Promise<string[]> {
    if (!this.isReady()) return [];
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_all_scanned",
        args: [],
      });
      if (!Array.isArray(result)) return [];
      return result as string[];
    } catch (e) {
      console.error("getAllScanned error:", e);
      return [];
    }
  }

  // ─── WRITE METHODS ──────────────────────────────────────

  async submitTarget(
    target: string,
    targetType: ScanType,
    chain: ChainType = "eth"
  ): Promise<TransactionReceipt> {
    if (!this.hasAccount) {
      throw new Error("Wallet not connected. Please connect your wallet before scanning.");
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`submitTarget attempt ${attempt}/3`);

        const txHash = await this.client.writeContract({
          address: this.contractAddress,
          functionName: "submit_target",
          args: [target, targetType, chain],
          value: BigInt(0),
        });

        console.log("Transaction submitted:", txHash);
        console.log("Waiting for confirmation...");

        const receipt = await this.client.waitForTransactionReceipt({
          hash: txHash,
          status: "ACCEPTED" as any,
          retries: 80,
          interval: 5000,
        });

        console.log("Transaction confirmed:", receipt);
        return receipt as TransactionReceipt;

      } catch (e: any) {
        console.error(`Attempt ${attempt} failed:`, e);
        lastError = e;
        if (attempt < 3) {
          await new Promise(r => setTimeout(r, 2000));
        }
      }
    }

    throw new Error(`Scan failed after 3 attempts: ${lastError?.message || "Unknown error"}`);
  }

  async scanMultiple(
    targets: string[],
    targetType: ScanType,
    chain: ChainType = "eth"
  ): Promise<TransactionReceipt> {
    if (!this.hasAccount) {
      throw new Error("Wallet not connected. Please connect your wallet before scanning.");
    }

    if (targets.length === 0) throw new Error("At least one target required.");
    if (targets.length > 10) throw new Error("Maximum 10 targets per batch scan.");

    try {
      console.log(`scanMultiple: ${targets.length} targets`);

      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "scan_multiple",
        args: [targets, targetType, chain],
        value: BigInt(0),
      });

      console.log("Batch scan submitted:", txHash);

      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 120,   // batch scans take longer — up to 10 minutes
        interval: 5000,
      });

      console.log("Batch scan confirmed:", receipt);
      return receipt as TransactionReceipt;

    } catch (e: any) {
      console.error("scanMultiple error:", e);
      throw new Error(`Batch scan failed: ${e.message || "Unknown error"}`);
    }
  }

  async flagTarget(
    target: string,
    evidence: string
  ): Promise<TransactionReceipt> {
    if (!this.hasAccount) {
      throw new Error("Wallet not connected. Please connect your wallet before flagging.");
    }
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "flag_target",
        args: [target, evidence],
        value: BigInt(0),
      });

      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 40,
        interval: 5000,
      });

      return receipt as TransactionReceipt;
    } catch (e) {
      console.error("flagTarget error:", e);
      throw new Error("Flag submission failed. Please try again.");
    }
  }
}

export default TrustScan;