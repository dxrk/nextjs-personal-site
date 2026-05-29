"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

const BASE_SPEED = 0.4; // degrees per frame when spinning freely

type RecordProps = {
  src?: string;
  alt?: string;
  href?: string;
  size?: number;
  spinning?: boolean;
};

export function Record({
  src,
  alt = "Record",
  href,
  size = 128,
  spinning = true,
}: RecordProps) {
  const discRef = useRef<HTMLDivElement>(null);
  const rotation = useRef(0);
  const velocity = useRef(BASE_SPEED);
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

  useEffect(() => {
    let raf: number;

    const tick = () => {
      if (spinningRef.current && !dragging.current) {
        rotation.current += velocity.current;
        // ease momentum back toward the idle spin speed
        velocity.current += (BASE_SPEED - velocity.current) * 0.04;
      }
      if (discRef.current) {
        discRef.current.style.transform = `rotate(${rotation.current}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const angleFromCenter = (clientX: number, clientY: number) => {
    const rect = discRef.current!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!hasTrack) return;
    dragging.current = true;
    moved.current = false;
    lastAngle.current = angleFromCenter(e.clientX, e.clientY);
    lastTime.current = performance.now();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const angle = angleFromCenter(e.clientX, e.clientY);
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

  const onPointerUp = () => {
    dragging.current = false;
  };

  const onClick = () => {
    if (hasTrack && !moved.current && href) {
      window.open(href, "_blank", "noopener,noreferrer");
    }
  };

  const label = Math.round(size * 0.42);
  const hole = Math.max(6, Math.round(size * 0.05));

  return (
    <div
      ref={discRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={onClick}
      role={hasTrack ? "button" : undefined}
      aria-label={hasTrack ? `Open ${alt}` : "Record"}
      className={`relative shrink-0 rounded-full touch-none shadow-md ring-1 ring-black/10 ${
        hasTrack ? "cursor-grab active:cursor-grabbing" : "cursor-default"
      }`}
      style={{
        width: size,
        height: size,
        background:
          "repeating-radial-gradient(circle at center, #111 0px, #111 1px, #1c1c1c 2px, #1c1c1c 3px)",
      }}
    >
      {/* album label */}
      {src && (
        <Image
          src={src}
          alt={alt}
          width={label * 1.5}
          height={label * 1.5}
          draggable={false}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none select-none"
          style={{ width: label * 1.5, height: label * 1.5 }}
        />
      )}

      {/* center hole */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background pointer-events-none"
        style={{ width: hole, height: hole }}
      />
    </div>
  );
}
