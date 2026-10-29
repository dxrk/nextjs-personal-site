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
          className={`pointer-events-none absolute top-full left-1/2 z-40 mt-2 -translate-x-1/2 origin-top -translate-y-1 opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-hover:opacity-100 ${width}`}
        >
          <span className="block rounded-lg bg-foreground p-3.5 text-left text-background">
            {preview}
          </span>
        </span>
      )}
    </span>
  );
}
