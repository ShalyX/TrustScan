"use client";

import { useState, useEffect } from "react";
import { Loader2, Flag, AlertCircle } from "lucide-react";
import { useWallet } from "@/lib/genlayer/wallet";
import { useFlag } from "@/lib/hooks/useTrustScan";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

interface FlagModalProps {
  target: string;
  onClose: () => void;
  onSuccess: () => void;
}

function shortTarget(t: string) {
  return t.length > 32 ? `${t.slice(0, 16)}...${t.slice(-8)}` : t;
}

export function FlagModal({ target, onClose, onSuccess }: FlagModalProps) {
  const { address, isConnected } = useWallet();
  const { flag, isFlagging, isSuccess, error: flagError } = useFlag();

  const [evidence, setEvidence] = useState("");
  const [validationError, setValidationError] = useState("");

  // Close on success
  useEffect(() => {
    if (isSuccess) {
      onSuccess();
    }
  }, [isSuccess]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      setValidationError("Connect your wallet to submit a flag.");
      return;
    }

    const trimmed = evidence.trim();
    if (trimmed.length < 10) {
      setValidationError("Evidence must be at least 10 characters.");
      return;
    }
    if (trimmed.length > 500) {
      setValidationError("Evidence must be under 500 characters.");
      return;
    }

    setValidationError("");
    flag({ target, evidence: trimmed, address });
  };

  return (
    <Dialog open onOpenChange={(open: any) => { if (!open && !isFlagging) onClose(); }}>
      <DialogContent className="ts-card border-border sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Flag className="w-5 h-5 text-destructive" />
            Flag Target
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Submit a community report. AI validators will assess credibility.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Target display */}
          <div className="p-3 rounded-lg bg-muted/20 border border-border space-y-1">
            <p className="text-xs text-muted-foreground">Flagging</p>
            <code className="text-xs font-mono break-all text-foreground">
              {shortTarget(target)}
            </code>
          </div>

          {/* Reporter */}
          <div className="p-3 rounded-lg bg-muted/20 border border-border space-y-1">
            <p className="text-xs text-muted-foreground">Reporter</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <code className="text-xs font-mono text-primary">
                {address
                  ? `${address.slice(0, 8)}...${address.slice(-6)}`
                  : "Not connected"}
              </code>
            </div>
          </div>

          {/* Evidence */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">Evidence</label>
              <span className="text-xs text-muted-foreground font-mono">
                {evidence.length}/500
              </span>
            </div>
            <textarea
              value={evidence}
              onChange={e => {
                setEvidence(e.target.value);
                setValidationError("");
              }}
              placeholder="Describe what you observed. Be specific — mention transaction hashes, dates, amounts, or links. More detail = higher credibility score."
              rows={5}
              maxLength={500}
              disabled={isFlagging}
              className="ts-input w-full px-4 py-3 text-sm resize-none font-mono leading-relaxed"
            />
            <p className="text-xs text-muted-foreground">
              Your report will be evaluated by GenLayer AI validators for credibility and severity. Credible reports affect the target&apos;s risk score.
            </p>
          </div>

          {/* Errors */}
          {(validationError || flagError) && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="text-xs">
                {validationError || flagError}
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 font-mono text-xs"
              onClick={onClose}
              disabled={isFlagging}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 btn-danger font-mono text-xs"
              disabled={isFlagging || evidence.trim().length < 10}
            >
              {isFlagging ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Flag className="w-3.5 h-3.5 mr-2" />
                  Submit Flag
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}