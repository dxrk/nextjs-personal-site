"use client";

import { ReactNode } from "react";

export function Background({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 hidden md:block"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, #B0E2FF 0%, transparent 70%)",
          opacity: 0.4,
          mixBlendMode: "multiply",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export { Background as Component };
