import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Medal } from "lucide-react";

type Race = {
  name: string;
  date: string;
  location: string;
  time: string;
  results: string;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function RaceCard({ race }: { race: Race }) {
  return (
    <div className="flex flex-col gap-4 font-mono">
      <Card key={race.name} className="w-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Medal className="h-4 w-4" />
              <h3 className="font-semibold text-base">{race.name}</h3>
            </div>
            <Link
              href={race.results}
              className="text-sm text-gray-500 hover:underline"
              target="_blank"
            >
              Results →
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  {race.location}
                </Badge>
                <span className="text-gray-500">{formatDate(race.date)}</span>
              </div>
              <span className="font-bold tabular-nums">{race.time}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
