"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { RECORD_FLING_EVENT } from "@/components/use-konami";

const BASE_SPEED = 0.4; // degrees per frame for the idle spin while a track plays
const FRICTION = 0.985; // momentum decay per frame after a flick
const SETTLE = 0.04; // how quickly momentum eases back to the idle spin while playing
const MIN_SPEED = 0.02; // below this we let the disc come to rest

type RecordProps = {
  src?: string;
  alt?: string;
  href?: string;
  spinning?: boolean;
  className?: string;
};

// grooves drawn as circles so the disc is a flat object, not a gradient
const GROOVES = Array.from({ length: 34 }, (_, i) => 21 + i * 0.8);

export function Record({
  src,
  alt = "Record",
  href,
  spinning = true,
  className = "",
}: RecordProps) {
  const discRef = useRef<HTMLDivElement>(null);
  const [artBroken, setArtBroken] = useState(false);
  const rotation = useRef(0);
  const velocity = useRef(0);
  const dragging = useRef(false);
  const moved = useRef(false);
  const lastAngle = useRef(0);
  const lastTime = useRef(0);

  // album art + drag/click are available whenever there's a track to show;
  // the auto-spin only runs while a track is actually playing
  const hasTrack = !!src;
  const spinningRef = useRef(spinning);

  useEffect(() => {
    spinningRef.current = spinning;
  }, [spinning]);

  // a new track gets a fresh chance to load its artwork
  useEffect(() => {
    setArtBroken(false);
  }, [src]);

  useEffect(() => {
    let raf: number;

    const tick = () => {
      if (!dragging.current) {
        rotation.current += velocity.current;

        if (spinningRef.current) {
          // a track is playing: keep a steady idle spin, but let any flick
          // momentum ease back toward that baseline speed
          velocity.current += (BASE_SPEED - velocity.current) * SETTLE;
        } else {
          // nothing playing: a flick keeps its momentum and slows via friction
          velocity.current *= FRICTION;
          if (Math.abs(velocity.current) < MIN_SPEED) velocity.current = 0;
        }
      }
      if (discRef.current) {
        discRef.current.style.transform = `rotate(${rotation.current}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // the konami code sends the disc flying; friction or the idle spin takes
  // over from there
  useEffect(() => {
    const fling = () => {
      velocity.current = 140;
    };
    window.addEventListener(RECORD_FLING_EVENT, fling);
    return () => window.removeEventListener(RECORD_FLING_EVENT, fling);
  }, []);

  const angleFromCenter = (clientX: number, clientY: number) => {
    const rect = discRef.current!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
  };

  // active drag listeners live on window so we always catch the release,
  // even if the pointer ends up well past the (rotating) disc
  const cleanupDrag = useRef<(() => void) | null>(null);

  useEffect(() => () => cleanupDrag.current?.(), []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!hasTrack) return;
    dragging.current = true;
    moved.current = false;
    lastAngle.current = angleFromCenter(e.clientX, e.clientY);
    lastTime.current = performance.now();

    const handleMove = (ev: PointerEvent) => {
      const angle = angleFromCenter(ev.clientX, ev.clientY);
      let delta = angle - lastAngle.current;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      if (Math.abs(delta) > 1) moved.current = true;

      rotation.current += delta;

      const now = performance.now();
      const dt = now - lastTime.current;
      if (dt > 0) velocity.current = (delta / dt) * 16; // ~deg per frame

      lastAngle.current = angle;
      lastTime.current = now;
    };

    const handleUp = () => {
      dragging.current = false;
      cleanupDrag.current?.();
    };

    cleanupDrag.current = () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
      cleanupDrag.current = null;
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
  };

  const open = () => {
    if (hasTrack && href) window.open(href, "_blank", "noopener,noreferrer");
  };

  const onClick = () => {
    if (!moved.current) open();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  };

  // no artwork, no record: the disc only appears with a real label on it
  if (!src || artBroken) return null;

  return (
    <div
      ref={discRef}
      onPointerDown={onPointerDown}
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={hasTrack ? "button" : undefined}
      tabIndex={hasTrack ? 0 : undefined}
      aria-label={hasTrack ? `Open ${alt} on last.fm` : "Record"}
      className={`relative aspect-square select-none rounded-full bg-[#111] touch-none outline-none focus-visible:ring-4 focus-visible:ring-[var(--accent)] ${
        hasTrack ? "cursor-grab active:cursor-grabbing" : "cursor-default"
      } ${className}`}
    >
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
      >
        {GROOVES.map((r) => (
          <circle
            key={r}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="#1e1e1e"
            strokeWidth="0.35"
          />
        ))}
      </svg>

      {/* album label */}
      {src && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[40%] w-[40%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="200px"
            draggable={false}
            className="object-cover"
            onError={() => setArtBroken(true)}
          />
        </div>
      )}

      {/* center hole */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[5%] w-[5%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "var(--field)" }}
      />
    </div>
  );
}
