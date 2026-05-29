"use client";

import { ReactNode } from "react";
import { RACES } from "@/app/running/races-data";
import { RevealLink } from "@/components/reveal-link";

const RECENT_RACES = [...RACES].reverse().slice(0, 3);

type Props = {
  href: string;
  className?: string;
  children: ReactNode;
};

export function RunningRevealLink({ href, className, children }: Props) {
  return (
    <RevealLink
      href={href}
      className={className}
      getPreview={() => (
        <span className="flex flex-col gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
            recent races
          </span>
          {RECENT_RACES.map((race) => (
            <span
              key={race.name}
              className="flex items-baseline justify-between gap-3"
            >
              <span className="flex-1 text-xs font-semibold leading-tight">
                {race.name}
              </span>
              <span className="shrink-0 text-[10px] tabular-nums text-gray-500">
                {race.time}
              </span>
            </span>
          ))}
        </span>
      )}
    >
      {children}
    </RevealLink>
  );
}
