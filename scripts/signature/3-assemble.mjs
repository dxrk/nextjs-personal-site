// Builds strokes.json from a hand-written pen order over out/segments.json.
// Spec tokens: "12" = segment 12 a->b, "12r" = reversed, "J" = the pen goes
// back over drawn ink (a jump in the path, nothing new revealed).
import fs from "fs";

const segs = JSON.parse(fs.readFileSync("out/segments.json", "utf8"));
const byId = new Map(segs.map((s) => [s.i, s]));

const SPEC = [
  // Ben
  ["7r", "6", "J", "8", "25", "J", "24", "60", "69", "56r", "55", "J", "61", "39r", "37", "J", "62", "68", "J", "67"],
  // Talesnik
  ["1", "12r", "0r", "J", "16", "63", "J", "48r", "40r", "J", "50", "54r", "21r", "19", "J", "43r", "32r", "30", "J", "45", "75", "J", "71r", "70r", "33r", "J", "34r", "26r", "4r", "J", "23r", "J", "27r"],
  // the dot on the i
  ["22"],
];

function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  const [x0, y0] = pts[0], [x1, y1] = pts[pts.length - 1];
  let maxD = 0, idx = 0;
  const L = Math.hypot(x1 - x0, y1 - y0) || 1e-9;
  for (let i = 1; i < pts.length - 1; i++) {
    const [x, y] = pts[i];
    const dist = Math.abs((y1 - y0) * x - (x1 - x0) * y + x1 * y0 - y1 * x0) / L;
    if (dist > maxD) { maxD = dist; idx = i; }
  }
  if (maxD > eps) {
    const a = rdp(pts.slice(0, idx + 1), eps), b = rdp(pts.slice(idx), eps);
    return [...a.slice(0, -1), ...b];
  }
  return [pts[0], pts[pts.length - 1]];
}
function cubicLen(p1, c1, c2, p2, n = 24) {
  let len = 0, px = p1[0], py = p1[1];
  for (let k = 1; k <= n; k++) {
    const t = k / n, u = 1 - t;
    const x = u * u * u * p1[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p2[0];
    const y = u * u * u * p1[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p2[1];
    len += Math.hypot(x - px, y - py); px = x; py = y;
  }
  return len;
}
function catmullToPath(pts) {
  if (pts.length === 2) return { d: `M ${pts[0][0]} ${pts[0][1]} L ${pts[1][0]} ${pts[1][1]}`, len: Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]) };
  let d = `M ${pts[0][0]} ${pts[0][1]}`, len = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0]} ${p2[1]}`;
    len += cubicLen(p1, c1, c2, p2);
  }
  return { d, len };
}

const usedIds = new Set();
const strokes = SPEC.map((tokens, si) => {
  const runs = [[]];
  for (const tok of tokens) {
    if (tok === "J") { if (runs[runs.length - 1].length) runs.push([]); continue; }
    const rev = tok.endsWith("r");
    const id = Number(rev ? tok.slice(0, -1) : tok);
    const seg = byId.get(id);
    if (!seg) throw new Error(`no segment ${id}`);
    usedIds.add(id);
    const pts = rev ? [...seg.xy].reverse() : seg.xy;
    const run = runs[runs.length - 1];
    if (run.length) {
      const [lx, ly] = run[run.length - 1];
      const gap = Math.hypot(pts[0][0] - lx, pts[0][1] - ly);
      if (gap > 6) console.warn(`stroke ${si + 1}: ${tok} starts ${gap.toFixed(0)}px from the previous end (${lx},${ly})->(${pts[0]})`);
      run.push(...pts.slice(1));
    } else run.push(...pts);
  }
  // one piece per pen-down run: SVG restarts the dash pattern at every
  // subpath, so each run must be its own path to animate in sequence
  const pieces = runs.filter((r) => r.length > 1).map((r) => catmullToPath(rdp(r, 1.6))).map((p) => ({ d: p.d, len: Math.ceil(p.len) }));
  return { pieces, len: pieces.reduce((t, p) => t + p.len, 0), start: runs[0][0], jumps: pieces.length - 1 };
});

const skipped = segs.filter((s) => !usedIds.has(s.i) && s.len > 4).map((s) => `${s.i}(${s.len}px)`);
if (skipped.length) console.warn("unused segments:", skipped.join(" "));

const prev = JSON.parse(fs.readFileSync("out/strokes.json", "utf8"));
fs.writeFileSync("out/strokes.json", JSON.stringify({ viewBox: prev.viewBox, meanInk: prev.meanInk, strokes }));

const [, , W, H] = prev.viewBox.split(" ").map(Number);
const hue = (i) => `hsl(${(i * 47) % 360} 80% 45%)`;
fs.writeFileSync("out/debug.svg", `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;background:#fff">
${strokes.map((s, i) => `<path d="${s.pieces.map((p) => p.d).join(" ")}" fill="none" stroke="${hue(i)}" stroke-width="10" stroke-linecap="round"/><circle cx="${s.start[0]}" cy="${s.start[1]}" r="14" fill="${hue(i)}"/>`).join("\n")}
</svg>`);
console.log(strokes.map((s, i) => `#${i + 1} len ${s.len} jumps ${s.jumps}`).join("\n"));
