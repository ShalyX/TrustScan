"use client";

import { Navbar } from "@/components/Navbar";
import { ScanPanel } from "@/components/ScanPanel";
import { RecentScans } from "@/components/RecentScans";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-20 pb-12 px-4 md:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">

          {/* Hero */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest uppercase text-primary mb-6 opacity-80">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Powered by GenLayer AI
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-5 leading-none tracking-tight">
              Scan before<br />you interact.
            </h1>
            <p className="text-base text-muted-foreground max-w-xl mx-auto leading-relaxed font-mono">
              AI-powered security scanner for wallets, URLs, and token contracts.
              Cross-referenced across Etherscan, GoPlus, and Chainabuse.
            </p>
          </div>

          {/* Scan Panel — input + result card */}
          <div className="animate-slide-up">
            <ScanPanel />
          </div>

          {/* Recent Scans */}
          <div className="animate-fade-in mt-8" style={{ animationDelay: "150ms" }}>
            <RecentScans />
          </div>

          {/* How it Works */}
          <div className="mt-10 ts-card p-6 md:p-8 animate-fade-in" style={{ animationDelay: "250ms" }}>
            <h2 className="text-xl font-bold mb-5">How it Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="text-primary font-bold font-mono">01. Submit</div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Paste a wallet address, URL, or token contract. Connect your wallet and hit scan.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-primary font-bold font-mono">02. Analyze</div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  GenLayer AI validators cross-reference Etherscan, GoPlus, and Chainabuse in real time.
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-primary font-bold font-mono">03. Decide</div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Get a score, a label, and a plain-English summary. Know exactly what you're dealing with.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground font-mono">
            <span>TrustScan</span>
            <span className="opacity-30">·</span>
            <a href="https://genlayer.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              Powered by GenLayer
            </a>
            <span className="opacity-30">·</span>
            <a href="https://studio.genlayer.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              Studio
            </a>
            <span className="opacity-30">·</span>
            <a href="https://docs.genlayer.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}