import React from "react";

export type LogoSize = "sm" | "md" | "lg";

interface LogoProps {
  size?: LogoSize;
  className?: string;
  showWordmark?: boolean;
}

const sizeMap = {
  sm: { icon: "w-5 h-5", text: "text-base" },
  md: { icon: "w-6 h-6", text: "text-xl" },
  lg: { icon: "w-8 h-8", text: "text-2xl" },
};

export function Logo({ size = "md", className = "", showWordmark = true }: LogoProps) {
  const { icon: iconSize, text: textSize } = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Shield icon */}
      <svg
        className={`${iconSize} flex-shrink-0`}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="TrustScan Shield"
      >
        <path
          d="M16 2L4 7v9c0 7 5.4 13.5 12 15 6.6-1.5 12-8 12-15V7L16 2z"
          fill="oklch(0.82 0.18 155 / 0.15)"
          stroke="oklch(0.82 0.18 155)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M11 16l3 3 7-7"
          stroke="oklch(0.82 0.18 155)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Wordmark */}
      {showWordmark && (
        <span
          className={`${textSize} font-bold text-foreground font-[family-name:var(--font-display)] tracking-tight`}
          style={{ letterSpacing: "-0.03em" }}
        >
          TrustScan
        </span>
      )}
    </div>
  );
}

export function LogoMark(props: Omit<LogoProps, "showWordmark">) {
  return <Logo {...props} showWordmark={false} />;
}