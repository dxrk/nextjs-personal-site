"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RESUME_DATA } from "@/app/data";
import { Record } from "@/components/record";
import { GradientText } from "@/components/ui/gradient-text";
import { ScrambleWord } from "@/components/ui/scramble-word";
import WhisperText from "@/components/ui/whisper-text";
import { PhotosRevealLink } from "@/components/photos-reveal-link";
import { ProjectsRevealLink } from "@/components/projects-reveal-link";
import { RunningRevealLink } from "@/components/running-reveal-link";

const inlineLink =
  "font-semibold underline underline-offset-4 hover:text-gray-500 transition-colors";

export default function Home() {
  // link last.fm to get most recent song
  const [song, setSong] = useState<string | null>(null);
  const [songUrl, setSongUrl] = useState<string | null>(null);
  const [songName, setSongName] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function getPhotos() {
      try {
        const response = await fetch("/api/portfolio");
        const data = await response.json();
        if (!cancelled && Array.isArray(data)) setPhotos(data);
      } catch {
        /* ignore */
      }
    }

    getPhotos();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function getSong() {
      try {
        const response = await fetch(
          `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=darkfrc&api_key=${process.env.LASTFM_API_KEY}&format=json`,
        );
        const data = await response.json();
        if (cancelled) return;

        const track = data.recenttracks.track[0];
        const nowPlaying = track?.["@attr"]?.nowplaying === "true";

        setSong(track.image[3]["#text"]);
        setSongUrl(track.url);
        setSongName(track.name);
        setIsPlaying(nowPlaying);
      } catch {
        /* ignore */
      }
    }

    getSong();
    const interval = setInterval(getSong, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <main className="select-none flex flex-col items-center justify-center min-h-screen py-10">
      <div className="w-11/12 md:w-3/4 max-w-3xl">
        {/* ===== Intro ===== */}
        <section className="flex flex-col gap-5">
          {/* Header: headshot + greeting on the left, spinning record on the right */}
          <div className="flex justify-between items-center gap-4">
            <div className="flex flex-col gap-3">
              <h1 className="text-3xl font-bold">
                <WhisperText delay={350} startDelay={0.4} duration={1.2}>
                  <span data-word className="inline-block">
                    Hey,
                  </span>
                  <span data-word className="inline-block">
                    I&apos;m
                  </span>
                  <span data-word className="inline-block">
                    <GradientText>Ben</GradientText>
                  </span>
                </WhisperText>
              </h1>
            </div>
          </div>

          {/* Intro copy */}
          <p className="leading-relaxed">
            {/* TODO: replace this with your real intro copy */}
            I&apos;m a graduate of the University of Maryland with a degree in
            Computer Science. I like to build cool <ScrambleWord /> — take a
            look at my{" "}
            <ProjectsRevealLink href="/projects" className={inlineLink}>
              projects
            </ProjectsRevealLink>
            . When I&apos;m not at a keyboard you&apos;ll probably find me{" "}
            <RunningRevealLink href="/running" className={inlineLink}>
              running
            </RunningRevealLink>{" "}
            or out shooting{" "}
            <PhotosRevealLink
              href="/photos"
              images={photos}
              className={inlineLink}
            >
              photos.
            </PhotosRevealLink>
          </p>

          {/* Sign-off: headshot + signature + socials */}
          <div className="flex items-center gap-4">
            <Image
              src="/profile.png"
              alt="Ben Talesnik"
              width={96}
              height={96}
              className="rounded-2xl shrink-0"
              draggable={false}
            />
            <div className="flex flex-col gap-3">
              <Image
                src="/signature.png"
                alt="Ben Talesnik signature"
                width={180}
                height={61}
                draggable={false}
                className="-ml-1 mix-blend-multiply"
              />
              <div className="flex gap-3">
                <Link href="https://instagram.com/bentalesnik">
                  <Image
                    src="/img/instagram.png"
                    alt="Instagram"
                    width={20}
                    height={20}
                    draggable={false}
                  />
                </Link>
                <Link href="https://linkedin.com/in/bentalesnik/">
                  <Image
                    src="/img/linkedin.png"
                    alt="LinkedIn"
                    width={20}
                    height={20}
                    draggable={false}
                  />
                </Link>
                <Link href="https://open.spotify.com/user/bentalesnik">
                  <Image
                    src="/img/spotify.png"
                    alt="Spotify"
                    width={20}
                    height={20}
                    draggable={false}
                  />
                </Link>
                <Link href="https://github.com/dxrk">
                  <Image
                    src="/img/github.png"
                    alt="GitHub"
                    width={20}
                    height={20}
                    draggable={false}
                  />
                </Link>
                <Link href="https://www.strava.com/athletes/23600577">
                  <Image
                    src="/img/strava.png"
                    alt="Strava"
                    width={20}
                    height={20}
                    draggable={false}
                  />
                </Link>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 shrink-0 self-end ml-auto">
              <Record
                src={song ?? undefined}
                alt={songName ?? "Record"}
                href={songUrl ?? undefined}
                size={96}
                spinning={isPlaying}
              />
            </div>
          </div>
        </section>

        {/* ===== Divider ===== */}
        <Separator className="my-6" />

        {/* ===== Resume ===== */}
        <section aria-label="Resume" className="flex flex-col gap-6">
          {/* Education */}
          <div id="education" className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">Education</h2>
            {RESUME_DATA.education.map((education) => (
              <div key={education.school} className="flex flex-col gap-2 mt-2">
                <div className="flex items-center justify-between gap-2 text-base">
                  <h3 className="inline-flex items-center justify-center gap-x-1 font-semibold leading-none">
                    <a className="hover:underline" href={education.link}>
                      {education.school}
                    </a>
                  </h3>
                  <div className="text-sm tabular-nums text-gray-500">
                    {education.start} - {education.end ?? "Present"}
                  </div>
                </div>

                <h4 className="text-sm leading-none text-gray-500">
                  {education.title}
                </h4>
                <div className="flex flex-wrap gap-1">
                  {education.badges.map((badge) => (
                    <Badge
                      variant="secondary"
                      className="align-middle text-xs"
                      key={badge}
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Work Experience */}
          <div id="work" className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">Work Experience</h2>
            {RESUME_DATA.work.map((work) => (
              <div
                key={work.company + work.title}
                className="flex flex-col gap-2 mt-2 mb-1"
              >
                <div className="flex items-center justify-between gap-2 text-base">
                  <h3 className="inline-flex items-center justify-center gap-x-1 font-semibold leading-none">
                    <a className="hover:underline" href={work.link}>
                      {work.company}
                    </a>
                    <Badge variant="outline" className="align-middle text-xs">
                      {work.location}
                    </Badge>
                  </h3>
                  <div className="text-sm tabular-nums text-gray-500">
                    {work.start} - {work.end ?? "Present"}
                  </div>
                </div>

                <h4 className="text-sm leading-none text-gray-700">
                  {work.title}
                </h4>
                <p className="text-sm leading-tight text-gray-500 line-clamp-2">
                  {work.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {work.badges.map((badge) => (
                    <Badge
                      variant="secondary"
                      className="align-middle text-xs"
                      key={badge}
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div id="skills" className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">Skills</h2>
            <div className="flex flex-wrap gap-1">
              {RESUME_DATA.skills.map((skill) => (
                <Badge
                  variant="outline"
                  className="align-middle text-xs"
                  key={skill}
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
