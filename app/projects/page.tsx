"use client";

import Link from "next/link";
import { PROJECT_DATA } from "@/app/projects/data";
import { ProjectCard } from "@/components/project-card";
import WhisperText from "@/components/ui/whisper-text";

export default function HomeUtil() {
  return (
    <main className="select-none flex flex-col items-center min-h-dvh py-10 sm:py-16">
      <div className="w-11/12 md:w-3/4 max-w-3xl flex flex-col gap-8">
        <section className="print-force-new-page scroll-mb-16">
          <div className="mb-8 flex items-baseline justify-between gap-6">
            <h1 className="text-5xl sm:text-6xl font-extrabold font-heading leading-none">
              <WhisperText delay={350} startDelay={0.4} duration={1.2}>
                <span data-word className="inline-block">
                  Projects
                </span>
              </WhisperText>
            </h1>
            <Link
              href="/"
              className="shrink-0 text-[15px] text-gray-600 underline underline-offset-4 transition-colors hover:text-foreground"
            >
              ← back
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 print:grid-cols-2 print:gap-2">
            {PROJECT_DATA.map((project) => {
              return (
                <ProjectCard
                  key={project.title}
                  title={project.title}
                  description={project.description}
                  tags={project.techStack}
                  link={project.link?.href}
                  wip={project.wip ?? false}
                  contributors={
                    project.contributors?.map((contributor) => ({
                      name: Object.keys(contributor)[0],
                      github: Object.values(contributor)[0],
                    })) || []
                  }
                  trophies={project.trophies || []}
                />
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
