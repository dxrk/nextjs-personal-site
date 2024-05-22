"use client";

import Image from "next/image";
import Link from "next/link";
import { JSX, SVGProps, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { RESUME_DATA } from "@/app/data";

export default function HomeUtil(this: any) {
  // link last.fm to get most recent song
  const [song, setSong] = useState<string | null>(null);
  const [songUrl, setSongUrl] = useState<string | null>(null);

  useEffect(() => {
    getSong();

    setInterval(() => {
      getSong();
    }, 15000);
  }, []);

  const getSong = async () => {
    fetch(
      "https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=darkfrc&api_key=dc63aa42c6245c19fcbd9a051eb39800&format=json"
    )
      .then((response) => response.json())
      .then((data) => {
        setSong(data.recenttracks.track[0].image[3]["#text"]);
        setSongUrl(data.recenttracks.track[0].url);
      });
  };

  return (
    <main className="md:container select-none font-mono flex items-top justify-center min-h-screen pt-16 pb-16">
      <div className="w-11/12 md:w-3/4 h-5/6">
        <div className="flex flex-col gap-8">
          <header className="flex justify-between items-left text-sm">
            <div className="flex gap-3">
              <Link href="/" className="hover:underline font-bold">
                home
              </Link>
              <Link href="projects" className="hover:underline">
                projects
              </Link>
              <Link href="photos" className="hover:underline">
                photos
              </Link>
            </div>
          </header>
          <section id="main" className="flex flex-col gap-1">
            <div className="flex justify-between items-start">
              <div>
                <Image
                  src="/profile.png"
                  alt="Ben Talesnik"
                  width={65}
                  height={65}
                  className="rounded-full"
                />
                <h1 className="text-2xl font-bold">Ben Talesnik</h1>
                <p className="text-sm text-gray-500">
                  CS @ University of Maryland
                </p>
                <div className="flex gap-3 mt-3">
                  <Link href="https://instagram.com/bentalesnik">
                    <Image
                      src="/Home/img/instagram.png"
                      alt="Instagram"
                      width={20}
                      height={20}
                    />
                  </Link>
                  <Link href="https://linkedin.com/in/bentalesnik/">
                    <Image
                      src="/Home/img/linkedin.png"
                      alt="LinkedIn"
                      width={20}
                      height={20}
                    />
                  </Link>
                  <Link href="https://open.spotify.com/user/bentalesnik">
                    <Image
                      src="/Home/img/spotify.png"
                      alt="Spotify"
                      width={20}
                      height={20}
                    />
                  </Link>
                  <Link href="https://github.com/dxrk">
                    <Image
                      src="/Home/img/github.png"
                      alt="GitHub"
                      width={20}
                      height={20}
                    />
                  </Link>
                </div>
              </div>
              {song && songUrl && (
                <div className="flex justify-end">
                  <Link href={songUrl}>
                    <Image
                      src={song}
                      alt="Now Playing"
                      width={140}
                      height={140}
                      className="rounded-lg"
                    />
                  </Link>
                </div>
              )}
            </div>
          </section>
          <section id="education" className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">Education</h2>
            {RESUME_DATA.education.map((education) => {
              return (
                <div
                  key={education.school}
                  className="flex flex-col gap-3 mt-2"
                >
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
              );
            })}
          </section>
          <section id="work" className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">Work Experience</h2>
            {RESUME_DATA.work.map((work) => {
              return (
                <div
                  key={work.company}
                  className="flex flex-col gap-3 mt-3 mb-3"
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
                  <p className="text-sm leading-tight text-gray-500">
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
              );
            })}
          </section>
          <section id="skills" className="flex flex-col gap-1">
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
          </section>
        </div>
      </div>
    </main>
  );
}
