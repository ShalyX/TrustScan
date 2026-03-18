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
          className="backdrop-blur-xl border transition-all duration-500 ease-out"
          style={{
            borderColor: `oklch(0.14 0.03 220 / ${0.4 + scrollProgress * 0.4})`,
            background: `linear-gradient(135deg,
              oklch(0.05 0.01 220 / ${0.1 + scrollProgress * 0.5}) 0%,
              oklch(0.08 0.02 220 / ${0.05 + scrollProgress * 0.4}) 100%)`,
            borderRadius: `${borderRadius}px`,
            borderWidth: "1px",
            borderLeftWidth: isScrolled ? "1px" : "0px",
            borderRightWidth: isScrolled ? "1px" : "0px",
            borderTopWidth: isScrolled ? "1px" : "0px",
            boxShadow: isScrolled
              ? "0 16px 48px 0 rgba(0,0,0,0.4), inset 0 1px 0 0 oklch(0.82 0.18 155 / 0.05)"
              : "none",
            backdropFilter: "blur(16px) saturate(180%)",
            WebkitBackdropFilter: "blur(16px) saturate(180%)",
          }}
        >
          <div
            className="px-6 transition-all duration-500 mx-auto"
            style={{ maxWidth: isScrolled ? "80rem" : "112rem" }}
          >
            <div
              className="flex items-center justify-between transition-all duration-500"
              style={{ height: `${headerHeight}px` }}
            >
              {/* Left: Logo */}
              <div className="flex items-center gap-2">
                <LogoMark size="md" className="flex md:hidden" />
                <Logo size="md" className="hidden md:flex" />
              </div>

              {/* Center: Stats */}
              <div className="hidden md:flex items-center gap-6 text-xs font-mono">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>Scans</span>
                  <span className="text-primary font-bold">{totalScans}</span>
                </div>
                {dangerousScans > 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>Dangerous</span>
                    <span className="text-destructive font-bold">{dangerousScans}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-muted-foreground/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span>GenLayer Testnet</span>
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