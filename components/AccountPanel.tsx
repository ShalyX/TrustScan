"use client";

import { useState } from "react";
import { Shield, LogOut, AlertCircle, ExternalLink } from "lucide-react";
import { useWallet } from "@/lib/genlayer/wallet";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

const METAMASK_INSTALL_URL = "https://metamask.io/download/";

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function AccountPanel() {
  const {
    address,
    isConnected,
    isMetaMaskInstalled,
    isOnCorrectNetwork,
    isLoading,
    connectWallet,
    disconnectWallet,
    switchWalletAccount,
  } = useWallet();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleConnect = async () => {
    if (!isMetaMaskInstalled) return;
    try {
      setIsConnecting(true);
      setConnectionError("");
      await connectWallet();
      setIsModalOpen(false);
    } catch (err: any) {
      if (!err.message?.includes("rejected")) {
        setConnectionError(err.message || "Failed to connect to MetaMask");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setIsModalOpen(false);
  };

  const handleSwitchAccount = async () => {
    try {
      setIsSwitching(true);
      setConnectionError("");
      await switchWalletAccount();
    } catch (err: any) {
      if (!err.message?.includes("rejected")) {
        setConnectionError(err.message || "Failed to switch account");
      }
    } finally {
      setIsSwitching(false);
    }
  };

  // Not connected
  if (!isConnected) {
    return (
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            disabled={isLoading}
            className="border-primary/30 text-primary hover:bg-primary/10 hover:border-primary font-mono text-xs"
          >
            <Shield className="w-3.5 h-3.5 mr-2" />
            Connect Wallet
          </Button>
        </DialogTrigger>

        <DialogContent className="ts-card border-border">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Connect Wallet
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm">
              Connect your MetaMask wallet to scan targets on GenLayer
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {!isMetaMaskInstalled ? (
              <>
                <Alert className="bg-suspicious/10 border-suspicious/20">
                  <AlertCircle className="h-4 w-4 text-suspicious" />
                  <AlertTitle>MetaMask Not Detected</AlertTitle>
                  <AlertDescription className="text-sm">
                    Install MetaMask to connect your wallet and start scanning.
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={() => window.open(METAMASK_INSTALL_URL, "_blank")}
                  className="w-full btn-primary"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Install MetaMask
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleConnect}
                  className="w-full btn-primary h-12"
                  disabled={isConnecting}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {isConnecting ? "Connecting..." : "Connect MetaMask"}
                </Button>

                {connectionError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Connection Error</AlertTitle>
                    <AlertDescription>{connectionError}</AlertDescription>
                  </Alert>
                )}

                <div className="p-4 rounded-lg bg-muted/20 border border-border text-xs text-muted-foreground space-y-1">
                  <p>Connecting will:</p>
                  <ol className="list-decimal list-inside space-y-1 mt-1">
                    <li>Connect your wallet to TrustScan</li>
                    <li>Add the GenLayer network to MetaMask</li>
                    <li>Switch to the GenLayer network</li>
                  </ol>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Connected
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="font-mono text-xs text-primary">
            {shortAddr(address!)}
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="ts-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Wallet</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Your connected wallet details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {/* Address */}
          <div className="p-3 rounded-lg bg-muted/20 border border-border space-y-1">
            <p className="text-xs text-muted-foreground">Address</p>
            <code className="text-xs font-mono break-all text-foreground">{address}</code>
          </div>

          {/* Network status */}
          <div className="p-3 rounded-lg bg-muted/20 border border-border space-y-1">
            <p className="text-xs text-muted-foreground">Network</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOnCorrectNetwork ? "bg-primary" : "bg-suspicious animate-pulse"}`} />
              <span className="text-xs font-mono">
                {isOnCorrectNetwork ? "GenLayer Studio" : "Wrong Network"}
              </span>
            </div>
          </div>

          {!isOnCorrectNetwork && (
            <Alert className="bg-suspicious/10 border-suspicious/20">
              <AlertCircle className="h-4 w-4 text-suspicious" />
              <AlertTitle>Wrong Network</AlertTitle>
              <AlertDescription className="text-xs">
                Switch to GenLayer network in MetaMask or reconnect.
              </AlertDescription>
            </Alert>
          )}

          {connectionError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="text-xs">{connectionError}</AlertDescription>
            </Alert>
          )}

          <div className="pt-3 border-t border-border space-y-2">
            <Button
              onClick={handleSwitchAccount}
              variant="outline"
              className="w-full text-xs font-mono"
              disabled={isSwitching || isLoading}
            >
              {isSwitching ? "Switching..." : "Switch Account"}
            </Button>
            <Button
              onClick={handleDisconnect}
              variant="outline"
              className="w-full text-xs font-mono text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10"
              disabled={isSwitching || isLoading}
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              Disconnect
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}