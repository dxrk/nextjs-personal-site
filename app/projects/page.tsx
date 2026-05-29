"use client";

import Link from "next/link";
import { PROJECT_DATA } from "@/app/projects/data";
import { ProjectCard } from "@/components/project-card";
import WhisperText from "@/components/ui/whisper-text";

export default function HomeUtil() {
  return (
    <main className="select-none flex flex-col items-center min-h-screen py-16">
      <div className="w-11/12 md:w-3/4 max-w-3xl flex flex-col gap-8">
        <Link
          href="/"
          className="w-fit text-sm text-gray-500 transition-colors hover:text-foreground"
        >
          ← back
        </Link>
        <section className="print-force-new-page scroll-mb-16">
          <h1 className="text-3xl font-bold mb-8">
            <WhisperText delay={350} startDelay={0.4} duration={1.2}>
              <span data-word className="inline-block">
                Projects
              </span>
            </WhisperText>
          </h1>
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
