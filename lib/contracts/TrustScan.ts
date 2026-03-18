import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import type { ScanResult, FlagResult, ScanType, ChainType, TransactionReceipt } from "./types";

const STUDIO_URL =
  process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api";

const CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`) ||
  "0x9312Fdc35E76Cb6e4a9ec9F0D2548834ce525eC9";

// FIX: Validate a hex address string
function isValidAddress(addr: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(addr);
}

class TrustScan {
  private contractAddress: `0x${string}`;
  private client: ReturnType<typeof createClient>;
  private hasAccount: boolean;

  constructor(address?: string | null) {
    this.contractAddress = CONTRACT_ADDRESS;
    // FIX: Track whether a valid account was provided
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
      console.warn("updateAccount: invalid address provided, skipping.");
      return;
    }
    this.hasAccount = true;
    this.client = createClient({
      chain: studionet,
      endpoint: STUDIO_URL,
      account: address as `0x${string}`,
    } as any);
  }

  // FIX: Guard — returns true only when contract address and client are ready
  private isReady(): boolean {
    return isValidAddress(this.contractAddress);
  }

  // ─── READ METHODS ───────────────────────────────────────

  async getRiskScore(target: string): Promise<ScanResult | null> {
  console.log("=== getRiskScore Debug ===");
  console.log("Contract Address:", this.contractAddress);
  console.log("Target:", target);
  console.log("Is Ready:", this.isReady());
  console.log("Has Account:", this.hasAccount);
  
  if (!this.isReady()) {
    console.log("❌ Not ready - skipping RPC call");
    return null;
  }
  
  try {
    console.log("📡 Calling readContract...");
    const result: any = await this.client.readContract({
      address: this.contractAddress,
      functionName: "get_risk_score",
      args: [target],
    });
    console.log("✅ Raw result:", result);
    
    if (!result || result.score === -1 || result.label === "Not Scanned") {
      console.log("⚠️ No valid result (not scanned yet)");
      return null;
    }
    return result as ScanResult;
  } catch (e) {
    console.error("❌ getRiskScore error:", e);
    return null;
  }
}

  async getFlags(target: string): Promise<FlagResult[]> {
    // FIX: Skip RPC call if client isn't ready
    if (!this.isReady()) return [];
    try {
      const result: any = await this.client.readContract({
        address: this.contractAddress,
        functionName: "get_flags",
        args: [target],
      });
      if (!Array.isArray(result)) return [];
      return result as FlagResult[];
    } catch (e) {
      console.error("getFlags error:", e);
      return [];
    }
  }

  async getFlagCount(target: string): Promise<number> {
    // FIX: Skip RPC call if client isn't ready
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
    // FIX: Skip RPC call if client isn't ready
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
    // FIX: Require a connected wallet for write operations
    if (!this.hasAccount) {
      throw new Error("Wallet not connected. Please connect your wallet before scanning.");
    }
    try {
      const txHash = await this.client.writeContract({
        address: this.contractAddress,
        functionName: "submit_target",
        args: [target, targetType, chain],
        value: BigInt(0),
      });

      const receipt = await this.client.waitForTransactionReceipt({
        hash: txHash,
        status: "ACCEPTED" as any,
        retries: 80,
        interval: 5000,
      });

      return receipt as TransactionReceipt;
    } catch (e) {
      console.error("submitTarget error:", e);
      throw new Error("Scan failed. Please try again.");
    }
  }

  async flagTarget(
    target: string,
    evidence: string
  ): Promise<TransactionReceipt> {
    // FIX: Require a connected wallet for write operations
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