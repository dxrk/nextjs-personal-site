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
          <span className="text-[13px] leading-5 text-background/70">
            Recent races
          </span>
          {RECENT_RACES.map((race) => (
            <span
              key={race.name}
              className="flex items-baseline justify-between gap-3"
            >
              <span className="flex-1 text-[15px] font-medium leading-tight">
                {race.name}
              </span>
              <span className="shrink-0 text-[13px] text-background/70">
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
