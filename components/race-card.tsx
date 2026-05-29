import Image from "next/image";
import Link from "next/link";

type Race = {
  name: string;
  date: string;
  location: string;
  time?: string;
  results?: string;
  image?: string;
};

const formatDate = (date: string) => {
  // adjust for timezone so the day doesn't shift backwards
  const d = new Date(date);
  const userTimezone = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() + userTimezone).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const isUpcoming = (date: string) => new Date(date) > new Date();

export default function RaceCard({ race }: { race: Race }) {
  const upcoming = isUpcoming(race.date);
  const year = new Date(race.date).getFullYear();

  return (
    <div
      className={`group relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted ${
        upcoming ? "ring-2 ring-offset-2 ring-gray-400 ring-offset-background" : ""
      }`}
    >
      {race.image ? (
        <Image
          src={`/${race.image}`}
          alt={race.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        // placeholder shown until a bib photo is dropped in /public
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-4 text-center">
          <span className="text-4xl font-bold tabular-nums text-foreground/70">
            {year}
          </span>
          <span className="line-clamp-2 text-xs text-muted-foreground">
            {race.name}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
            bib coming soon
          </span>
        </div>
      )}

      {upcoming && (
        <span className="absolute right-2 top-2 z-10 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide shadow-sm">
          upcoming
        </span>
      )}

      {/* sleek detail overlay, revealed on hover */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end gap-1 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100">
        <h3 className="text-sm font-bold leading-tight text-white">
          {race.name}
        </h3>
        <div className="flex items-center justify-between gap-2 text-[11px] text-white/80">
          <span>{race.location}</span>
          <span className="tabular-nums">{formatDate(race.date)}</span>
        </div>
        {race.time && (
          <span className="text-base font-bold tabular-nums text-white">
            {race.time}
          </span>
        )}
        {race.results && (
          <Link
            href={race.results}
            target="_blank"
            className="mt-1 w-fit text-[11px] font-medium text-white/90 underline underline-offset-2 hover:text-white"
          >
            Results →
          </Link>
        )}
      </div>
    </div>
  );
}
