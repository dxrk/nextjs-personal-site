"use client";

import Image from "next/image";
import Link from "next/link";
import { JSX, SVGProps, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { PROJECT_DATA } from "@/app/projects/data";
import { ProjectCard } from "@/components/project-card";

export default function HomeUtil(this: any) {
  return (
    <main className="md:container select-none font-mono flex items-top justify-center min-h-screen pt-16 pb-16">
      <div className="w-11/12 md:w-3/4 h-5/6">
        <div className="flex flex-col gap-8">
          <header className="flex justify-between items-left text-sm">
            <div className="flex gap-3">
              <Link href="/" className="hover:underline">
                home
              </Link>
              <Link href="projects" className="hover:underline font-bold">
                projects
              </Link>
              <Link href="photos" className="hover:underline">
                photos
              </Link>
            </div>
          </header>
          <section className="print-force-new-page scroll-mb-16">
            <h2 className="text-xl font-bold mb-8">Projects</h2>
            <div className="-mx-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-2 print:grid-cols-2 print:gap-2">
              {PROJECT_DATA.map((project) => {
                return (
                  <ProjectCard
                    key={project.title}
                    title={project.title}
                    description={project.description}
                    tags={project.techStack}
                    link={project.link ? project.link.href : undefined}
                    wip={project.wip ? project.wip : false}
                  />
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
