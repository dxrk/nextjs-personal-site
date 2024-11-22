"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomeUtil() {
  const [columns, setColumns] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
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

  // Organize photos into columns for masonry layout
  const organizePhotosIntoColumns = (photos: string[]) => {
    const cols = Array.from({ length: columns }, () => [] as string[]);
    photos.forEach((photo: string, index: number) =>
      cols[index % columns].push(photo)
    );
    return cols;
  };

  // Update columns based on screen size
  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 640) {
        setColumns(1);
      } else if (window.innerWidth < 1024) {
        setColumns(2);
      } else {
        setColumns(3);
      }
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  // Simulate loading and set loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // Adjust timeout as needed

    return () => clearTimeout(timer);
  }, []);

  const shuffledPhotos = shuffleArray([...photos]);
  const photoColumns = organizePhotosIntoColumns(shuffledPhotos);

  // Skeleton Loader Component
  const SkeletonLoader = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {[...Array(columns)].map((_, columnIndex) => (
        <div key={columnIndex} className="flex flex-col gap-4">
          {[...Array(3)].map((_, photoIndex) => (
            <div
              key={`skeleton-${columnIndex}-${photoIndex}`}
              className="bg-gray-300 rounded-lg w-full h-64"
            ></div>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <main className="md:container select-none font-mono flex items-top justify-center min-h-screen pt-16 pb-16">
      <div className="w-11/12 md:w-3/4 h-5/6">
        <div className="flex flex-col gap-8">
          <header className="flex justify-between items-left text-sm">
            <div className="flex gap-5">
              <Link href="/" className="hover:underline">
                home
              </Link>
              <Link href="/projects" className="hover:underline">
                projects
              </Link>
              <Link href="/running" className="hover:underline">
                running
              </Link>
              <Link href="/photos" className="hover:underline font-bold">
                photos
              </Link>
            </div>
          </header>
          <section>
            <h2 className="text-xl font-bold mb-8">Photos</h2>
            <p className="mb-8">Shot on a Fujifilm X100V.</p>

            {isLoading ? (
              <SkeletonLoader />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {photoColumns.map((column, columnIndex) => (
                  <div key={columnIndex} className="flex flex-col gap-4">
                    {column.map((photo, photoIndex) => (
                      <div
                        key={`${columnIndex}-${photoIndex}`}
                        className="relative w-full"
                      >
                        <Image
                          src={`/portfolio/${photo}`}
                          alt={photo}
                          width={1000}
                          height={1000}
                          className="rounded-lg w-full h-auto"
                          draggable="false"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
