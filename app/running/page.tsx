"use client";
import Link from "next/link";
import { RACES } from "./races-data";
import RaceCard from "./race-card";
import StravaCard from "./strava-card";

export default function HomeUtil() {
  // sort races by date (most recent first)
  const sortedRaces = RACES.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <main className="md:container select-none font-mono flex items-top justify-center min-h-screen pt-16 pb-16">
      <div className="w-11/12 md:w-3/4 h-5/6">
        <div className="flex flex-col gap-8">
          <header className="flex justify-between items-left text-sm">
            <div className="flex gap-5">
              <Link href="/" className="hover:underline">
                home
              </Link>
              <Link href="/projects" className="hover:underline">
                projects
              </Link>
              <Link href="/running" className="hover:underline font-bold">
                running
              </Link>
              <Link href="/photos" className="hover:underline">
                photos
              </Link>
            </div>
          </header>
          <section className="">
            <h2 className="text-xl font-bold mb-8">Running</h2>
            {/* <StravaCard /> */}
            <div className="grid grid-cols-1 gap-4">
              {sortedRaces.map((race) => (
                <RaceCard key={race.name} race={race} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
