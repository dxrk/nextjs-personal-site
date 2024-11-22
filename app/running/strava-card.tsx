import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Activity, Trophy } from "lucide-react";

type Run = {
  name: string;
  distance: number;
  time: string;
  pace: string;
  date: string;
  link: string;
};

type YearStats = {
  totalMiles: number;
  totalRuns: number;
  totalTime: string;
};

// meters to miles
const metersToMiles = (meters: number) => {
  return (meters / 1609.34).toFixed(1);
};

const secondsToHours = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const secondsToMinutes = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
};

const formatPace = (pace: number) => {
  const milePace = (1 / pace) * 26.8224;
  const minutes = Math.floor(milePace);
  const secs = Math.ceil((milePace % minutes) * 60);
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

const CACHE_DURATION = 1000 * 60 * 60;

const StravaCard = () => {
  const [latestRun, setLatestRun] = useState<Run | null>(null);
  const [yearStats, setYearStats] = useState<YearStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getLatestActivity = async () => {
    try {
      // Check cache first
      const cached = localStorage.getItem("stravaData");
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setLatestRun(data.latestRun);
          setYearStats(data.yearStats);
          return;
        }
      }

      // Fetch new data
      const res = await fetch("/api/strava/getStats");
      const data = await res.json();
      setLatestRun(data.latestRun);
      setYearStats(data.yearStats);

      // Cache the data
      localStorage.setItem(
        "stravaData",
        JSON.stringify({
          data: { yearStats: data.yearStats, latestRun: data.latestRun },
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      setError("Failed to fetch Strava data");
      console.error("Strava API Error:", err);
    }
  };

  useEffect(() => {
    getLatestActivity();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  if (!latestRun || !yearStats) return null;

  return (
    <>
      <Card className="w-full font-mono mb-6">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              {new Date().getFullYear()} Running Stats
            </h3>
            <Badge variant="secondary" className="text-xs">
              <Link href="https://www.strava.com/athletes/23600577">
                via Strava
              </Link>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {/* Yearly Stats */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Distance</span>
                <span className="text-xl font-bold tabular-nums">
                  {yearStats.totalMiles.toFixed(1)}mi
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Runs</span>
                <span className="text-xl font-bold tabular-nums">
                  {yearStats.totalRuns}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Time</span>
                <span className="text-xl font-bold tabular-nums">
                  {yearStats.totalTime}
                </span>
              </div>
            </div>

            {/* Latest Run */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4" />
                <span className="text-sm">
                  <b>Latest Run:</b>{" "}
                  <Link href={latestRun.link} className="hover:underline">
                    {latestRun.name}
                  </Link>
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(latestRun.date)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">Distance</span>
                  <span className="text-base font-bold tabular-nums">
                    {latestRun.distance.toFixed(1)}mi
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">Time</span>
                  <span className="text-base font-bold tabular-nums">
                    {latestRun.time}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500">Pace</span>
                  <span className="text-base font-bold tabular-nums">
                    {latestRun.pace}/mi
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Separator className="my-8" />
    </>
  );
};

export default StravaCard;
