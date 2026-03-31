"use client";

import React from "react";

export function GridBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {/* Mesh Gradients provided by globals.css (bg-mesh) */}
      <div className="bg-mesh" />
      
      {/* Noise Texture provided by globals.css (bg-noise) */}
      <div className="bg-noise" />

      {/* Structured Grid */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.03] text-foreground"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Radial fade for the grid */}
      <div 
        className="absolute inset-0" 
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 0%, var(--background) 90%)'
        }}
      />
    </div>
  );
}
