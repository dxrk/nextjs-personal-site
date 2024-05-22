"use client";

import Image from "next/image";
import Link from "next/link";

export default function HomeUtil() {
  const photosPath = require.context(
    "@/public/portfolio",
    false,
    /\.(png|jpe?g|svg)$/
  );

  const photos = photosPath.keys().map((photo) => photo.replace("./", ""));

  // Shuffle the photos array
  const shuffleArray = (array: string[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const shuffledPhotos = shuffleArray([...photos]);

  // Randomly assign sizing classes for bento grid layout
  const getRandomSizeClass = () => {
    const sizeClasses = [
      "bento-small",
      "bento-small",
      "bento-small",
      "bento-medium",
    ];
    return sizeClasses[Math.floor(Math.random() * sizeClasses.length)];
  };

  return (
    <main className="md:container select-none font-mono flex items-top justify-center min-h-screen pt-16 pb-16">
      <div className="w-11/12 md:w-3/4 h-5/6">
        <div className="flex flex-col gap-8">
          <header className="flex justify-between items-left text-sm">
            <div className="flex gap-3">
              <Link href="/" className="hover:underline">
                home
              </Link>
              <Link href="/projects" className="hover:underline">
                projects
              </Link>
              <Link href="/photos" className="hover:underline font-bold">
                photos
              </Link>
            </div>
          </header>
          <section className="">
            <h2 className="text-xl font-bold mb-8">Photos</h2>
            <p className="mb-8">Shot on a Fujifilm X100V.</p>
            <div className="bento-grid">
              {shuffledPhotos.map((photo, index) => (
                <div
                  key={index}
                  className={`bento-item ${getRandomSizeClass()}`}
                >
                  <Image
                    src={`/portfolio/${photo}`}
                    alt={photo}
                    width={1000}
                    height={1000}
                    className="rounded-lg"
                    draggable="false"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
