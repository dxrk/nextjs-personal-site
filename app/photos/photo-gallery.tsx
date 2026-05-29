"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import WhisperText from "@/components/ui/whisper-text";

export type Photo = {
  filename: string;
  width: number;
  height: number;
};

function seededShuffle(array: Photo[], seed: number) {
  const shuffled = [...array];
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function PhotoCard({ photo }: { photo: Photo }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative w-full rounded-lg overflow-hidden"
      style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
    >
      <div
        className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer transition-opacity duration-500"
        style={{
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
          opacity: isLoaded ? 0 : 1,
        }}
      />
      {isVisible && (
        <Image
          src={`/portfolio/${photo.filename}`}
          alt={photo.filename}
          width={photo.width}
          height={photo.height}
          className="rounded-lg w-full h-auto"
          draggable="false"
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </div>
  );
}

function getColumns() {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth < 640) return 1;
  if (window.innerWidth < 1024) return 2;
  return 3;
}

function subscribeToResize(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

export default function PhotoGallery({
  photos,
  seed,
}: {
  photos: Photo[];
  seed: number;
}) {
  const columns = useSyncExternalStore(subscribeToResize, getColumns, () => 3);

  const shuffledPhotos = useMemo(
    () => seededShuffle(photos, seed),
    [photos, seed],
  );

  const photoColumns = useMemo(() => {
    const cols = Array.from({ length: columns }, () => [] as Photo[]);
    shuffledPhotos.forEach((photo, index) => cols[index % columns].push(photo));
    return cols;
  }, [shuffledPhotos, columns]);

  return (
    <main className="select-none flex flex-col items-center min-h-screen py-16">
      <div className="w-11/12 md:w-3/4 max-w-3xl flex flex-col gap-8">
        <Link
          href="/"
          className="w-fit text-sm text-gray-500 transition-colors hover:text-foreground"
        >
          ← back
        </Link>
        <section>
          <h1 className="text-3xl font-bold mb-2">
            <WhisperText delay={350} startDelay={0.4} duration={1.2}>
              <span data-word className="inline-block">
                Photos
              </span>
            </WhisperText>
          </h1>
          <p className="mb-8 text-muted-foreground">
            Shot on a Fujifilm X100V.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photoColumns.map((column, columnIndex) => (
              <div key={columnIndex} className="flex flex-col gap-4">
                {column.map((photo, photoIndex) => (
                  <PhotoCard
                    key={`${columnIndex}-${photoIndex}`}
                    photo={photo}
                  />
                ))}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
