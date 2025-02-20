import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Medal, Calendar } from "lucide-react";

type Race = {
  name: string;
  date: string;
  location: string;
  time: string | null;
  results: string | null;
};

const formatDate = (date: string) => {
  // Create date with timezone adjustment to prevent day shift
  const d = new Date(date);
  const userTimezone = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() + userTimezone).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const isUpcoming = (date: string) => {
  return new Date(date) > new Date();
};

export default function RaceCard({ race }: { race: Race }) {
  const upcoming = isUpcoming(race.date);

  return (
    <div className="flex flex-col gap-4 font-mono">
      <Card
        key={race.name}
        className={`w-full ${
          upcoming ? "animate-pulse-border border-2 border-gray-500" : ""
        }`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {upcoming ? (
                <Calendar className="h-4 w-4 text-gray-500" />
              ) : (
                <Medal className="h-4 w-4" />
              )}
              <h3 className="font-semibold text-base">{race.name}</h3>
              {upcoming && (
                <Badge
                  variant="default"
                  className="bg-gray-500 hover:bg-gray-500"
                >
                  Upcoming
                </Badge>
              )}
            </div>
            {!upcoming && race.results && (
              <Link
                href={race.results}
                className="text-sm text-gray-500 hover:underline"
                target="_blank"
              >
                Results →
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {race.location}
                </Badge>
                <span
                  className={`${
                    upcoming ? "text-gray-500 font-semibold" : "text-gray-500"
                  }`}
                >
                  {formatDate(race.date)}
                </span>
              </div>
              <span className="font-bold tabular-nums">{race.time}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <style jsx global>{`
        @keyframes pulse-border {
          0%,
          100% {
            border-color: transparent;
          }
          50% {
            border-color: #d1d5db;
          }
        }
        .animate-pulse-border {
          animation: pulse-border 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
