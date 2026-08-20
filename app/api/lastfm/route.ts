import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type LastFmImage = { size: string; "#text": string };

export async function GET() {
  const apiKey = process.env.LASTFM_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "LASTFM_API_KEY not set" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=darkfrc&api_key=${apiKey}&format=json&limit=1`,
      { cache: "no-store" },
    );
    const data = await res.json();
    const track = data?.recenttracks?.track?.[0];

    if (!track) {
      return NextResponse.json({ error: "No recent tracks" }, { status: 404 });
    }

    // last.fm sometimes returns empty strings for larger sizes — take the
    // largest image that actually has a URL
    const images: LastFmImage[] = Array.isArray(track.image) ? track.image : [];
    const image =
      [...images].reverse().find((img) => img?.["#text"])?.["#text"] ?? null;

    return NextResponse.json({
      image,
      url: track.url ?? null,
      name: track.name ?? null,
      nowPlaying: track["@attr"]?.nowplaying === "true",
    });
  } catch {
    return NextResponse.json({ error: "last.fm request failed" }, { status: 502 });
  }
}
