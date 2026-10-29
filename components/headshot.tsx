"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  src: string;
  /** a second photo that fades in on hover; silently ignored if it 404s */
  altSrc?: string;
  alt: string;
  size?: number;
  className?: string;
};

export function Headshot({ src, altSrc, alt, size = 96, className = "" }: Props) {
  const [altOk, setAltOk] = useState(true);
  const [flipped, setFlipped] = useState(false);
  const canSwap = !!altSrc && altOk;

  return (
    <span
      className={`group relative block shrink-0 overflow-hidden rounded-2xl ${className}`}
      style={{ width: size, height: size }}
      onClick={() => canSwap && setFlipped((f) => !f)}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        draggable={false}
        className="block"
        priority
      />
      {canSwap && (
        <Image
          src={altSrc!}
          alt=""
          width={size}
          height={size}
          draggable={false}
          onError={() => setAltOk(false)}
          className={`absolute inset-0 transition-opacity duration-300 ${
            flipped ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        />
      )}
    </span>
  );
}
