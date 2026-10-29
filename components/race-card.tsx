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

const formatDate = (date: string) =>
  // noon avoids the day shifting backwards across timezones
  new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const isUpcoming = (date: string) => new Date(date) > new Date();

export default function RaceCard({ race }: { race: Race }) {
  const upcoming = isUpcoming(race.date);

  return (
    <div
      className={`group relative flex min-h-[200px] flex-col justify-between overflow-hidden rounded-xl p-4 ${
        upcoming ? "bg-foreground text-background" : "bg-secondary"
      }`}
    >
      {race.image && (
        <Image
          src={`/${race.image}`}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}

      {/* a flat scrim keeps the text readable when a bib photo is behind it */}
      <div
        className={`relative z-10 flex h-full flex-col justify-between gap-3 ${
          race.image ? "text-white" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold leading-tight">{race.name}</h3>
          {upcoming && (
            <span className="shrink-0 text-[13px] font-medium">Upcoming</span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {race.time && (
            <span className="font-heading text-4xl leading-none">
              {race.time}
            </span>
          )}
          <div className="flex flex-wrap items-baseline gap-x-2 text-[13px] leading-5">
            <span>{race.location}</span>
            <span aria-hidden>·</span>
            <span>{formatDate(race.date)}</span>
            {race.results && (
              <span className="whitespace-nowrap">
                <span aria-hidden>· </span>
                <Link
                  href={race.results}
                  target="_blank"
                  className="underline underline-offset-4 hover:opacity-70"
                >
                  Results ↗
                </Link>
              </span>
            )}
          </div>
        </div>
      </div>

      {race.image && (
        <div className="absolute inset-0 bg-black/55" aria-hidden />
      )}
    </div>
  );
}
