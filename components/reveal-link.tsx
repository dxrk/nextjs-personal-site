"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";

type RevealLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
  /** called on each hover so the preview can be re-randomized */
  getPreview: () => ReactNode;
  /** tailwind width class for the popover card */
  width?: string;
};

export function RevealLink({
  href,
  className,
  children,
  getPreview,
  width = "w-60",
}: RevealLinkProps) {
  const [preview, setPreview] = useState<ReactNode>(null);

  return (
    <span
      className="group relative inline-block"
      onMouseEnter={() => setPreview(getPreview())}
    >
      <Link href={href} className={className}>
        {children}
      </Link>

      {preview && (
        <span
          className={`pointer-events-none absolute top-full left-1/2 z-40 mt-2 -translate-x-1/2 origin-top -translate-y-1 scale-95 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100 ${width}`}
        >
          <span className="block rounded-lg border bg-background p-3 text-left shadow-xl">
            {preview}
          </span>
        </span>
      )}
    </span>
  );
}
