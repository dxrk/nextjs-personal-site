import { NextRequest, NextResponse } from "next/server";
import {
  secondsToHours,
  secondsToMinutes,
  metersToMiles,
  formatPace,
} from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    // Optional: Add timeout and error handling for fetch
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const [statsResponse, activitiesResponse] = await Promise.all([
      fetch("https://www.strava.com/api/v3/athletes/23600577/stats", {
        headers: {
          Authorization: `Bearer ${process.env.STRAVA_ACCESS_TOKEN}`,
        },
        signal: controller.signal,
      }),
      fetch("https://www.strava.com/api/v3/activities", {
        headers: {
          Authorization: `Bearer ${process.env.STRAVA_ACCESS_TOKEN}`,
        },
        signal: controller.signal,
      }),
    ]);

    clearTimeout(timeoutId);

    if (!statsResponse.ok || !activitiesResponse.ok) {
      return NextResponse.json(
        { error: "Unable to retrieve Strava data" },
        { status: 500 }
      );
    }

    const statsData = await statsResponse.json();
    const activitiesData = await activitiesResponse.json();

    const yearStats = {
      totalMiles: parseFloat(
        metersToMiles(statsData.ytd_run_totals.distance)
      ).toFixed(2),
      totalRuns: statsData.ytd_run_totals.count,
      totalTime: secondsToHours(statsData.ytd_run_totals.moving_time),
    };

    const latestRun = activitiesData[0]
      ? {
          name: activitiesData[0].name,
          distance: parseFloat(
            metersToMiles(activitiesData[0].distance)
          ).toFixed(2),
          time: secondsToMinutes(activitiesData[0].moving_time),
          pace: formatPace(activitiesData[0].average_speed),
          date: activitiesData[0].start_date,
          link: `https://www.strava.com/activities/${activitiesData[0].id}`,
        }
      : null;

    return NextResponse.json({ yearStats, latestRun });
  } catch (error) {
    console.error("Error fetching Strava data:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
