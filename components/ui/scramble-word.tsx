"use client";

import { useEffect, useState } from "react";

const SYMBOLS = "$%@#&*!?~^+=|/\\<>[]{}";

function randomPair() {
  let pair = "";
  for (let i = 0; i < 2; i++) {
    pair += SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  }
  return pair;
}

export function ScrambleWord() {
  const [middle, setMiddle] = useState("$%");

  useEffect(() => {
    const id = setInterval(() => setMiddle(randomPair()), 90);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="inline whitespace-nowrap" aria-label="shit">
      s
      <span
        aria-hidden
        className="inline-block w-[2ch] text-center tabular-nums"
      >
        {middle}
      </span>
      t
    </span>
  );
}
