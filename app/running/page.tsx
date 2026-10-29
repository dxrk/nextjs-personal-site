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
    <main className="select-none flex flex-col items-center min-h-dvh py-10 sm:py-16">
      <div className="w-11/12 md:w-3/4 max-w-3xl flex flex-col gap-8">
        <section>
          <div className="mb-8 flex items-baseline justify-between gap-6">
            <h1 className="text-5xl sm:text-6xl font-extrabold font-heading leading-none">
              <WhisperText delay={350} startDelay={0.4} duration={1.2}>
                <span data-word className="inline-block">
                  Running
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
