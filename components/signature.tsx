"use client";

import { useId } from "react";
import {
  SIGNATURE_FILL,
  SIGNATURE_PEN,
  SIGNATURE_STROKES,
  SIGNATURE_VIEWBOX,
} from "@/components/signature-path";

type Props = {
  className?: string;
  /** seconds of actual pen time */
  duration?: number;
  /** seconds before the pen touches down */
  delay?: number;
  /** seconds the pen is in the air between words */
  lift?: number;
};

/**
 * The signature writes itself. The real ink (filled glyphs) is revealed
 * through a mask whose strokes follow the pen's centreline in writing order:
 * "Ben" in one go, "Talesnik" in one go, the i dotted last. Where the hand
 * went back over its own line the path is split, and the pieces run back to
 * back at constant pen speed. Pure CSS once rendered; under reduced motion
 * it is simply there.
 */
export function Signature({ className = "", duration = 4.5, delay = 0.5, lift = 0.16 }: Props) {
  const id = useId();
  const total = SIGNATURE_STROKES.flat().reduce((t, p) => t + p.len, 0);
  const penTime = Math.max(0.5, duration - lift * (SIGNATURE_STROKES.length - 1));

  let clock = delay;
  const timed = SIGNATURE_STROKES.flatMap((stroke, si) =>
    stroke.map((piece, pi) => {
      if (pi === 0 && si > 0) clock += lift;
      const seconds = (penTime * piece.len) / total;
      const start = clock;
      clock += seconds;
      return { ...piece, start, seconds };
    }),
  );

  return (
    <svg
      viewBox={SIGNATURE_VIEWBOX}
      className={className}
      role="img"
      aria-label="Ben Talesnik, signed"
      fill="none"
    >
      <mask id={id} maskUnits="userSpaceOnUse">
        <g
          stroke="#fff"
          fill="none"
          strokeWidth={SIGNATURE_PEN}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {timed.map((p, i) => (
            <path
              key={i}
              d={p.d}
              className="signature-pen"
              style={
                {
                  // a little over the measured length so the end is never clipped
                  "--len": Math.ceil(p.len * 1.02) + 2,
                  animationDuration: `${p.seconds.toFixed(3)}s`,
                  animationDelay: `${p.start.toFixed(3)}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </g>
      </mask>
      <path d={SIGNATURE_FILL} fill="currentColor" fillRule="evenodd" mask={`url(#${id})`} />
    </svg>
  );
}
