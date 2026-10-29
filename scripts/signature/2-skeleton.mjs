// Extracts pen strokes from a signature PNG:
//   1. threshold to ink
//   2. Zhang-Suen thinning -> 1px skeleton
//   3. skeleton -> graph of segments between endpoints/junctions, spurs pruned
//   4. greedy walk per connected component: start at leftmost endpoint, keep
//      heading at junctions, lift the pen for anything left over
//   5. simplify (RDP) + Catmull-Rom -> cubic beziers
// Output: strokes.json { viewBox, width, strokes:[{d,len}], meanInk } and debug.svg
import Jimp from "jimp";
import fs from "fs";

const [, , src, outDir] = process.argv;
const img = await Jimp.read(src);
const { width: W, height: H, data } = img.bitmap;

// --- 1. ink mask
const ink = new Uint8Array(W * H);
let inkCount = 0;
for (let i = 0; i < W * H; i++) {
  const r = data[i * 4], g = data[i * 4 + 1], b = data[i * 4 + 2], a = data[i * 4 + 3];
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  if (a > 128 && lum < 140) { ink[i] = 1; inkCount++; }
}
const at = (x, y) => (x < 0 || y < 0 || x >= W || y >= H ? 0 : ink[y * W + x]);

// --- 2. Zhang-Suen thinning
function thinPass(step) {
  const kill = [];
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      if (!ink[y * W + x]) continue;
      const p2 = at(x, y - 1), p3 = at(x + 1, y - 1), p4 = at(x + 1, y), p5 = at(x + 1, y + 1);
      const p6 = at(x, y + 1), p7 = at(x - 1, y + 1), p8 = at(x - 1, y), p9 = at(x - 1, y - 1);
      const n = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
      if (n < 2 || n > 6) continue;
      const seq = [p2, p3, p4, p5, p6, p7, p8, p9, p2];
      let t = 0;
      for (let k = 0; k < 8; k++) if (seq[k] === 0 && seq[k + 1] === 1) t++;
      if (t !== 1) continue;
      if (step === 0) {
        if (p2 * p4 * p6 !== 0 || p4 * p6 * p8 !== 0) continue;
      } else {
        if (p2 * p4 * p8 !== 0 || p2 * p6 * p8 !== 0) continue;
      }
      kill.push(y * W + x);
    }
  }
  for (const i of kill) ink[i] = 0;
  return kill.length;
}
let iter = 0;
while (true) {
  const a = thinPass(0), b = thinPass(1);
  iter++;
  if (a + b === 0 || iter > 200) break;
}
// strip redundant corner pixels so the skeleton is minimally 8-connected:
// a pixel whose ink neighbours form one contiguous arc (one 0->1 transition)
// and number two or more is a staircase corner, not a path pixel
function stripCorners() {
  let removed = 0;
  // ring positions: 0 N, 1 NE, 2 E, 3 SE, 4 S, 5 SW, 6 W, 7 NW. Two ring pixels
  // touch when they are consecutive, or both orthogonal and 90 degrees apart.
  const touch = (i, j) => {
    const d = Math.abs(i - j) % 8, dd = Math.min(d, 8 - d);
    return dd === 1 || (dd === 2 && i % 2 === 0 && j % 2 === 0);
  };
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    if (!ink[y * W + x]) continue;
    const ring = [at(x, y - 1), at(x + 1, y - 1), at(x + 1, y), at(x + 1, y + 1), at(x, y + 1), at(x - 1, y + 1), at(x - 1, y), at(x - 1, y - 1)];
    const on = [];
    ring.forEach((v, i) => v && on.push(i));
    if (on.length < 2) continue;
    // are the ink neighbours one connected group without the centre?
    const seen = new Set([on[0]]);
    const stack = [on[0]];
    while (stack.length) {
      const i = stack.pop();
      for (const j of on) if (!seen.has(j) && touch(i, j)) { seen.add(j); stack.push(j); }
    }
    if (seen.size === on.length) { ink[y * W + x] = 0; removed++; }
  }
  return removed;
}
for (let k = 0; k < 8; k++) if (stripCorners() === 0) break;
let skelCount = 0;
for (let i = 0; i < W * H; i++) skelCount += ink[i];
const meanInk = inkCount / skelCount;
console.log(`ink ${inkCount}px, skeleton ${skelCount}px, mean width ${meanInk.toFixed(1)}px, ${iter} iters`);

// --- 3. graph
const N8 = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
const deg = new Uint8Array(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (!ink[y * W + x]) continue;
  let d = 0;
  for (const [dx, dy] of N8) d += at(x + dx, y + dy);
  deg[y * W + x] = d;
}
const isNode = (i) => ink[i] && deg[i] !== 2;

// walk segments from every node pixel along each neighbour
const visitedEdge = new Set(); // key "a>b" of consecutive pixels
const edgeKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
let segments = []; // {pts:[[x,y],...], a:nodeIdx, b:nodeIdx}

function walkFrom(start, next) {
  const pts = [start, next];
  visitedEdge.add(edgeKey(start, next));
  let prev = start, cur = next;
  while (!isNode(cur)) {
    const cx = cur % W, cy = (cur / W) | 0;
    let nxt = -1;
    for (const [dx, dy] of N8) {
      const n = (cy + dy) * W + (cx + dx);
      if (n === prev || !at(cx + dx, cy + dy)) continue;
      if (visitedEdge.has(edgeKey(cur, n))) continue;
      nxt = n;
      break;
    }
    if (nxt < 0) break;
    visitedEdge.add(edgeKey(cur, nxt));
    pts.push(nxt);
    prev = cur; cur = nxt;
  }
  return pts;
}

for (let i = 0; i < W * H; i++) {
  if (!isNode(i)) continue;
  const x = i % W, y = (i / W) | 0;
  for (const [dx, dy] of N8) {
    if (!at(x + dx, y + dy)) continue;
    const n = (y + dy) * W + (x + dx);
    if (visitedEdge.has(edgeKey(i, n))) continue;
    const pts = walkFrom(i, n);
    segments.push({ pts });
  }
}
// closed loops with no nodes at all (rare): seed from any unvisited deg-2 pixel
for (let i = 0; i < W * H; i++) {
  if (!ink[i] || deg[i] !== 2) continue;
  const x = i % W, y = (i / W) | 0;
  let touched = false;
  for (const [dx, dy] of N8) {
    if (!at(x + dx, y + dy)) continue;
    if (visitedEdge.has(edgeKey(i, (y + dy) * W + (x + dx)))) { touched = true; break; }
  }
  if (touched) continue;
  for (const [dx, dy] of N8) {
    if (!at(x + dx, y + dy)) continue;
    const pts = walkFrom(i, (y + dy) * W + (x + dx));
    pts.push(i);
    segments.push({ pts, loop: true });
    break;
  }
}

// collapse junction clusters: node id = representative pixel within radius 3
const toXY = (i) => [i % W, (i / W) | 0];
const nodeReps = [];
function nodeId(pix) {
  const [x, y] = toXY(pix);
  for (let k = 0; k < nodeReps.length; k++) {
    const [rx, ry] = nodeReps[k];
    if (Math.abs(rx - x) <= 3 && Math.abs(ry - y) <= 3) return k;
  }
  nodeReps.push([x, y]);
  return nodeReps.length - 1;
}
for (const s of segments) {
  s.a = nodeId(s.pts[0]);
  s.b = nodeId(s.pts[s.pts.length - 1]);
  s.xy = s.pts.map(toXY);
  s.len = 0;
  for (let k = 1; k < s.xy.length; k++) s.len += Math.hypot(s.xy[k][0] - s.xy[k - 1][0], s.xy[k][1] - s.xy[k - 1][1]);
}
// prune spurs: short segments with one free end hanging off a junction
const nodeDegree = () => {
  const d = new Map();
  for (const s of segments) { d.set(s.a, (d.get(s.a) || 0) + 1); d.set(s.b, (d.get(s.b) || 0) + 1); }
  return d;
};
for (let pass = 0; pass < 3; pass++) {
  const d = nodeDegree();
  const before = segments.length;
  segments = segments.filter((s) => {
    if (s.loop) return true;
    const freeA = d.get(s.a) === 1, freeB = d.get(s.b) === 1;
    if ((freeA || freeB) && !(freeA && freeB) && s.len < meanInk * 1.2) return false;
    return true;
  });
  if (segments.length === before) break;
}
console.log(`segments ${segments.length}, nodes ${nodeReps.length}`);
// dump every segment with an id for hand-ordering
{
  const hue = (i) => `hsl(${(i * 53) % 360} 75% 40%)`;
  const segSvg = (vb) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" style="width:100%;height:auto;background:#fff">
<path d="${JSON.parse(fs.readFileSync("sig.json","utf8")).d}" fill="#000" fill-opacity="0.08"/>
${segments.map((sg, i) => {
  const m = sg.xy[Math.floor(sg.xy.length / 2)];
  const d = "M " + sg.xy.filter((_, k) => k % 3 === 0 || k === sg.xy.length - 1).map((p) => p.join(" ")).join(" L ");
  return `<path d="${d}" fill="none" stroke="${hue(i)}" stroke-width="5"/>
<circle cx="${sg.xy[0][0]}" cy="${sg.xy[0][1]}" r="7" fill="${hue(i)}"/>
<rect x="${m[0] + 6}" y="${m[1] - 30}" width="${28 + 12 * String(i).length}" height="34" fill="#fff" fill-opacity="0.85"/>
<text x="${m[0] + 10}" y="${m[1] - 4}" font-size="30" font-weight="bold" font-family="sans-serif" fill="${hue(i)}">${i}</text>`;
}).join("\n")}
</svg>`;
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(`${outDir}/segs-left.svg`, segSvg("0 0 1000 626"));
  fs.writeFileSync(`${outDir}/segs-mid.svg`, segSvg("950 0 950 626"));
  fs.writeFileSync(`${outDir}/segs-right.svg`, segSvg("1850 0 900 626"));
  fs.writeFileSync(`${outDir}/segments.json`, JSON.stringify(segments.map((sg, i) => ({ i, a: sg.xy[0], b: sg.xy[sg.xy.length - 1], len: Math.round(sg.len), xy: sg.xy }))));
  console.log(segments.map((sg, i) => `${i}: (${sg.xy[0]})->(${sg.xy[sg.xy.length - 1]}) len ${Math.round(sg.len)}`).join("\n"));
}


// --- 4. order into strokes
// connected components over nodes
const adj = new Map();
segments.forEach((s, idx) => {
  if (!adj.has(s.a)) adj.set(s.a, []);
  if (!adj.has(s.b)) adj.set(s.b, []);
  adj.get(s.a).push(idx);
  if (s.b !== s.a) adj.get(s.b).push(idx);
});
const compOf = new Map();
let compCount = 0;
for (const n of adj.keys()) {
  if (compOf.has(n)) continue;
  const stack = [n];
  compOf.set(n, compCount);
  while (stack.length) {
    const c = stack.pop();
    for (const si of adj.get(c)) {
      const s = segments[si];
      for (const m of [s.a, s.b]) if (!compOf.has(m)) { compOf.set(m, compCount); stack.push(m); }
    }
  }
  compCount++;
}
const comps = [];
for (let c = 0; c < compCount; c++) {
  const segs = segments.map((s, i) => i).filter((i) => compOf.get(segments[i].a) === c);
  const nodes = [...new Set(segs.flatMap((i) => [segments[i].a, segments[i].b]))];
  const minX = Math.min(...segs.map((i) => Math.min(...segments[i].xy.map((p) => p[0]))));
  const totalLen = segs.reduce((t, i) => t + segments[i].len, 0);
  comps.push({ segs, nodes, minX, totalLen });
}
comps.sort((p, q) => p.minX - q.minX);

const polyLenPre = (pts) => pts.reduce((t, p, i) => (i && p && pts[i - 1] ? t + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : t), 0);
const used = new Set();
const strokes = []; // arrays of [x,y]
const heading = (pts, fromStart) => {
  const k = Math.min(12, pts.length - 1);
  const [x0, y0] = fromStart ? pts[0] : pts[pts.length - 1];
  const [x1, y1] = fromStart ? pts[k] : pts[pts.length - 1 - k];
  return Math.atan2(y1 - y0, x1 - x0);
};
const angDiff = (a, b) => { let d = Math.abs(a - b) % (2 * Math.PI); return d > Math.PI ? 2 * Math.PI - d : d; };

// shortest path over the whole graph (visited edges allowed) from node a to
// any node in `targets`; returns the list of [segIdx, reversed] to walk
function routeTo(a, targets) {
  const prev = new Map([[a, null]]);
  const queue = [a];
  while (queue.length) {
    const n = queue.shift();
    if (targets.has(n) && n !== a) {
      const path = [];
      let cur = n;
      while (prev.get(cur)) { path.unshift(prev.get(cur)); cur = prev.get(cur)[0]; }
      return path; // [[fromNode, segIdx, reversed], ...]
    }
    for (const si of adj.get(n) || []) {
      const sg = segments[si];
      const m = sg.a === n ? sg.b : sg.a;
      if (!prev.has(m)) { prev.set(m, [n, si, sg.b === n && sg.a !== n]); queue.push(m); }
    }
  }
  return null;
}
const RETRACE_MAX = Infinity; // cursive: the pen goes back over its own line rather than lifting
// ink already drawn, on an 8px grid, so parallel skeleton branches of one
// thick stroke are not drawn twice
const CELL = 8, COVER_R = meanInk * 0.6;
const drawn = new Map();
const cellKey = (x, y) => `${(x / CELL) | 0},${(y / CELL) | 0}`;
function markDrawn(pts) { for (const [x, y] of pts) { const k = cellKey(x, y); if (!drawn.has(k)) drawn.set(k, []); drawn.get(k).push([x, y]); } }
function nearDrawn(x, y) {
  const cx = (x / CELL) | 0, cy = (y / CELL) | 0, r = Math.ceil(COVER_R / CELL);
  for (let i = -r; i <= r; i++) for (let j = -r; j <= r; j++) {
    const list = drawn.get(`${cx + i},${cy + j}`);
    if (!list) continue;
    for (const [px, py] of list) if (Math.hypot(px - x, py - y) <= COVER_R) return true;
  }
  return false;
}
function covered(si) {
  if (used.has(si)) return true;
  const pts = segments[si].xy;
  let hit = 0;
  for (let k = 0; k < pts.length; k += 2) if (nearDrawn(pts[k][0], pts[k][1])) hit++;
  const frac = hit / Math.ceil(pts.length / 2);
  if (frac >= 0.9 && pts.length > 4) { used.add(si); return true; }
  return false;
} // px of going back over drawn ink before lifting instead

for (const comp of comps) {
  const d = nodeDegree();
  const endpoints = comp.nodes.filter((n) => d.get(n) === 1);
  const pool = endpoints.length ? endpoints : comp.nodes;
  // start: leftmost endpoint (ties -> lower on the page, where upstrokes begin)
  // start: an endpoint in the top-left corner of the group if there is one
  // (a capital's crossbar or hook), else the leftmost endpoint, lower first
  const xs = comp.nodes.map((n) => nodeReps[n][0]), ys = comp.nodes.map((n) => nodeReps[n][1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const corner = pool.filter((n) => nodeReps[n][0] < x0 + 0.35 * (x1 - x0) && nodeReps[n][1] < y0 + 0.25 * (y1 - y0));
  const leftmost = (list) => list.reduce((best, n) => {
    const [x, y] = nodeReps[n], [bx, by] = nodeReps[best];
    return x < bx - 8 || (Math.abs(x - bx) <= 8 && y > by) ? n : best;
  }, list[0]);
  let startNode = corner.length ? corner.reduce((b, n) => (nodeReps[n][1] < nodeReps[b][1] ? n : b), corner[0]) : leftmost(pool);

  const unusedAt = (n) => (adj.get(n) || []).filter((i) => !used.has(i) && !covered(i));

  while (comp.segs.some((i) => !used.has(i))) {
    let cur = startNode;
    let stroke = [];
    let lastHeading = null;
    while (true) {
      let options = unusedAt(cur);
      if (!options.length) {
        // retrace over drawn ink to the nearest node that still has work
        const targets = new Set(comp.nodes.filter((n) => unusedAt(n).length));
        const route = routeTo(cur, targets);
        if (!route) break;
        const routeLen = route.reduce((t, [, si]) => t + segments[si].len, 0);
        if (routeLen > RETRACE_MAX) break;
        // the pen goes back over drawn ink: nothing new appears, so the
        // stroke just jumps (an M in the path) to where work resumes
        for (const [, si, rev] of route) {
          const sg = segments[si];
          const pts = rev ? [...sg.xy].reverse() : sg.xy;
          lastHeading = heading(pts, false);
          cur = rev ? sg.a : sg.b;
        }
        if (stroke.length) stroke.push(null);
        options = unusedAt(cur);
        if (!options.length) break;
      }
      // Fleury-ish: avoid a branch that dead-ends while other branches remain
      const scored = options.map((i) => {
        const sg = segments[i];
        const rev = sg.b === cur && sg.a !== cur;
        const far = rev ? sg.a : sg.b;
        const deadEnd = unusedAt(far).filter((j) => j !== i).length === 0;
        const h = heading(sg.xy, !rev);
        const turn = lastHeading === null ? 0 : angDiff(lastHeading, h);
        const isLoop = far === cur;
        const deadEndBias = deadEnd && options.length > 1 ? (sg.len < 700 ? -0.8 : 1.5) : 0;
        return { i, rev, score: turn + deadEndBias + (isLoop ? -1.5 : 0) + (lastHeading === null ? -sg.len / 1000 : 0) };
      });
      scored.sort((p, q) => p.score - q.score);
      const { i: pick, rev: pickRev } = scored[0];
      const sg = segments[pick];
      used.add(pick);
      const pts = pickRev ? [...sg.xy].reverse() : sg.xy;
      markDrawn(pts);
      const afterJump = stroke.length && stroke[stroke.length - 1] === null;
      stroke.push(...(stroke.length && !afterJump ? pts.slice(1) : pts));
      lastHeading = heading(pts, false);
      cur = pickRev ? sg.a : sg.b;
      if (sg.loop) break;
    }
    if (stroke.length > 1) strokes.push(stroke);
    const remaining = comp.nodes.filter((n) => unusedAt(n).length);
    if (!remaining.length) break;
    // lift: leftmost unfinished point, but a start whose stroke would climb
    // steeply is penalised (a stem is drawn from its top)
    const liftScore = (n) => {
      const si = unusedAt(n)[0];
      const sg = segments[si];
      const rev = sg.b === n && sg.a !== n;
      const h = heading(sg.xy, !rev);
      const climbs = Math.sin(h) < -0.5; // screen y grows downward
      return nodeReps[n][0] + (climbs ? 400 : 0);
    };
    startNode = remaining.reduce((best, n) => (liftScore(n) < liftScore(best) ? n : best), remaining[0]);
  }
}
// drop junk
for (let i = strokes.length - 1; i >= 0; i--) if (polyLenPre(strokes[i]) < 12) strokes.splice(i, 1);
console.log(`strokes ${strokes.length}`);

// --- 5. simplify + smooth
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
const polyLen = polyLenPre;
const splitJumps = (pts) => pts.reduce((acc, p) => { if (p === null) acc.push([]); else acc[acc.length - 1].push(p); return acc; }, [[]]).filter((r) => r.length > 1);

const out = strokes.map((pts) => {
  const runs = splitJumps(pts);
  const parts = runs.map((r) => catmullToPath(rdp(r, 1.6)));
  const d = parts.map((p) => p.d).join(" ");
  const len = parts.reduce((t, p) => t + p.len, 0);
  const first = runs[0][0], lastRun = runs[runs.length - 1];
  return { d, len: Math.ceil(len), start: first, end: lastRun[lastRun.length - 1], jumps: runs.length - 1, polyLen: Math.round(polyLen(pts)) };
});
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(`${outDir}/strokes.json`, JSON.stringify({ viewBox: `0 0 ${W} ${H}`, meanInk: +meanInk.toFixed(1), strokes: out }, null, 0));

// debug: strokes coloured in order, numbered at their start
const hue = (i) => `hsl(${(i * 47) % 360} 80% 45%)`;
const dbg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;background:#fff">
${out.map((s, i) => `<path d="${s.d}" fill="none" stroke="${hue(i)}" stroke-width="${Math.max(4, meanInk * 0.5)}" stroke-linecap="round"/>
<circle cx="${s.start[0]}" cy="${s.start[1]}" r="14" fill="${hue(i)}"/>
<text x="${s.start[0] + 18}" y="${s.start[1] - 10}" font-size="40" font-family="sans-serif" fill="${hue(i)}">${i + 1}</text>`).join("\n")}
</svg>`;
fs.writeFileSync(`${outDir}/debug.svg`, dbg);
console.log(out.map((s, i) => `#${i + 1} len ${s.len} (poly ${s.polyLen}) jumps ${s.jumps} from (${s.start}) to (${s.end})`).join("\n"));
