"use client";

import { useState, useEffect } from "react";
import { AccountPanel } from "./AccountPanel";
import { Logo, LogoMark } from "./Logo";
import { useRecentScans } from "@/lib/hooks/useTrustScan";
import type { ScanRecord } from "@/lib/contracts/types";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { scans } = useRecentScans();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = 80;
      setIsScrolled(scrollY > 20);
      const progress = Math.min(Math.max((scrollY - 10) / threshold, 0), 1);
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const paddingTop = Math.round(scrollProgress * 16);
  const headerHeight = 64 - Math.round(scrollProgress * 8);

  const getBorderRadius = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      return Math.round(scrollProgress * 9999);
    }
    return 0;
  };
  const borderRadius = getBorderRadius();

  const totalScans = scans.length;
  const dangerousScans = scans.filter((s: ScanRecord) => s.label === "Dangerous").length;

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out"
      style={{ paddingTop: `${paddingTop}px` }}
    >
      <div
        className="transition-all duration-500 ease-out"
        style={{
          width: "100%",
          maxWidth: isScrolled ? "80rem" : "100%",
          margin: "0 auto",
          borderRadius: `${borderRadius}px`,
        }}
      >
        <div
          className="transition-all duration-500 ease-out"
          style={{
            borderColor: isScrolled ? `var(--border)` : "transparent",
            background: isScrolled ? `var(--card)` : "transparent",
            borderRadius: `${borderRadius}px`,
            borderWidth: "1px",
            boxShadow: isScrolled
              ? "0 20px 40px -12px rgba(0,0,0,0.5), inset 0 1px 0 0 var(--inner-border)"
              : "none",
            backdropFilter: isScrolled ? "blur(20px) saturate(180%)" : "none",
            WebkitBackdropFilter: isScrolled ? "blur(20px) saturate(180%)" : "none",
          }}
        >
          <div
            className="px-6 transition-all duration-500 mx-auto"
            style={{ maxWidth: isScrolled ? "75rem" : "112rem" }}
          >
            <div
              className="flex items-center justify-between transition-all duration-500"
              style={{ height: `${headerHeight}px` }}
            >
              {/* Left: Logo */}
              <div className="flex items-center gap-2">
                <Logo size="md" />
              </div>

              {/* Center: Stats pills */}
              <div className="hidden md:flex items-center gap-2 text-[10px] font-mono font-bold tracking-wider uppercase">
                <div className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-muted/20 border border-border/40 text-muted-foreground transition-all hover:bg-muted/30">
                  <span className="opacity-50">Scans</span>
                  <span className="text-primary">{totalScans}</span>
                </div>
                {dangerousScans > 0 && (
                  <div className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-destructive/10 border border-destructive/20 text-destructive transition-all hover:bg-destructive/20">
                    <span className="opacity-50">Threats</span>
                    <span>{dangerousScans}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 py-1.5 px-3 rounded-full bg-primary/5 border border-primary/10 text-primary/80 transition-all hover:bg-primary/10 ml-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--primary)]" />
                  <span>GenLayer Studionet</span>
                </div>
              </div>

              {/* Right: Wallet */}
              <div className="flex items-center gap-3">
                <AccountPanel />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}