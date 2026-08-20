"use client";

import { ReactNode } from "react";

export function Background({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-background">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 35%, #B0E2FF 0%, transparent 70%)",
          opacity: 0.4,
          mixBlendMode: "multiply",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export { Background as Component };
