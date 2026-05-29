"use client";
import Link from "next/link";
import { RACES } from "./races-data";
import RaceCard from "@/components/race-card";
import WhisperText from "@/components/ui/whisper-text";

export default function HomeUtil() {
  // sort races by date (most recent first)
  const sortedRaces = [...RACES].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <main className="select-none flex flex-col items-center min-h-screen py-16">
      <div className="w-11/12 md:w-3/4 max-w-3xl flex flex-col gap-8">
        <Link
          href="/"
          className="w-fit text-sm text-gray-500 transition-colors hover:text-foreground"
        >
          ← back
        </Link>
        <section>
          <h1 className="text-3xl font-bold mb-2">
            <WhisperText delay={350} startDelay={0.4} duration={1.2}>
              <span data-word className="inline-block">
                Running
              </span>
            </WhisperText>
          </h1>
          <p className="mb-8 text-muted-foreground">
            A few races I&apos;ve run. Hover a bib for the details.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedRaces.map((race) => (
              <RaceCard key={race.name} race={race} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
