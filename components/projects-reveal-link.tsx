"use client";

import { ReactNode } from "react";
import { PROJECT_DATA } from "@/app/projects/data";
import { RevealLink } from "@/components/reveal-link";

function pickProjects(n: number) {
  const pool = [...PROJECT_DATA];
  const out: (typeof PROJECT_DATA)[number][] = [];
  for (let k = 0; k < n && pool.length > 0; k++) {
    const i = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
}

type Props = {
  href: string;
  className?: string;
  children: ReactNode;
};

export function ProjectsRevealLink({ href, className, children }: Props) {
  return (
    <RevealLink
      href={href}
      className={className}
      getPreview={() => (
        <span className="flex flex-col gap-2">
          <span className="text-[13px] leading-5 text-background/70">
            A few things I&apos;ve built
          </span>
          {pickProjects(3).map((project) => (
            <span key={project.title} className="flex flex-col">
              <span className="text-[15px] font-medium leading-tight">
                {project.title}
              </span>
              <span className="text-[13px] leading-5 text-background/70">
                {project.techStack.slice(0, 3).join(" · ")}
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
