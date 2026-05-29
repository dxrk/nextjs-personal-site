"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

function pickN(images: string[], n: number): string[] {
  if (images.length === 0) return [];
  const pool = [...images];
  const out: string[] = [];
  for (let k = 0; k < n; k++) {
    if (pool.length === 0) pool.push(...images);
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

type PhotosRevealLinkProps = {
  href: string;
  images: string[];
  className?: string;
  children: React.ReactNode;
};

// rotation-only fan: pivoting around origin-top places each card's bottom on an
// arc, so the deck swoops into a U (outer cards higher, middle cards lower)
const fan = [
  "delay-200 group-hover:-rotate-[34deg]",
  "delay-150 group-hover:-rotate-[12deg]",
  "delay-100 group-hover:rotate-[12deg]",
  "delay-75 group-hover:rotate-[34deg]",
];

export function PhotosRevealLink({
  href,
  images,
  className,
  children,
}: PhotosRevealLinkProps) {
  const [cards, setCards] = useState<string[]>([]);

  // shared reveal effect: hidden + scaled down by default, springs in on hover.
  // origin-top makes the cards hang from a top hinge so the fan swoops into a U shape
  const layer =
    "absolute inset-0 origin-top overflow-hidden rounded-md border-[3px] border-white shadow-md opacity-0 scale-0 rotate-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-100";

  return (
    <span
      className="group relative inline-block"
      onMouseEnter={() => setCards(pickN(images, 4))}
    >
      <Link href={href} className={className}>
        {children}
      </Link>

      {cards.length > 0 && (
        <span className="pointer-events-none absolute top-full left-1/2 z-40 mt-5 h-28 w-24 -translate-x-1/2">
          {cards.map((photo, i) => (
            <span key={i} className={cn(layer, fan[i])}>
              <Image
                src={`/portfolio/${photo}`}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
                draggable={false}
              />
            </span>
          ))}
        </span>
      )}
    </span>
  );
}
