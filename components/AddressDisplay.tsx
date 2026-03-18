"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { formatAddress } from "@/lib/genlayer/wallet";

interface AddressDisplayProps {
  address: string | null;
  maxLength?: number;
  className?: string;
  showCopy?: boolean;
}

export function AddressDisplay({
  address,
  maxLength = 12,
  className = "",
  showCopy = false,
}: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);

  if (!address) {
    return <span className={className}>—</span>;
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  const shortened = formatAddress(address, maxLength);

  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      title={address}
    >
      <span className="font-mono text-xs">{shortened}</span>
      {showCopy && (
        <button
          onClick={handleCopy}
          className="opacity-40 hover:opacity-100 transition-opacity p-0.5 hover:bg-primary/10 rounded"
          aria-label="Copy address"
        >
          {copied ? (
            <Check className="w-3 h-3 text-primary" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </button>
      )}
    </span>
  );
}