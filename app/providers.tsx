"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { WalletProvider } from "@/lib/genlayer/WalletProvider";
import { useFlagMonitor } from "@/lib/hooks/useNotificationSystem";

function FlagMonitor() {
  useFlagMonitor();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 2000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <FlagMonitor />
        {children}
      </WalletProvider>
      <Toaster
        position="bottom-center"
        theme="dark"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: 'oklch(0.08 0.02 220)',
            border: '1px solid oklch(0.14 0.03 220)',
            color: 'oklch(0.92 0.02 210)',
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            boxShadow: '0 8px 32px oklch(0 0 0 / 0.6)',
          },
        }}
      />
    </QueryClientProvider>
  );
}