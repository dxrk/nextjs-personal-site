// writes components/signature-path.ts from sig.json (fill) + out/strokes.json (pen path)
import fs from "fs";
const fill = JSON.parse(fs.readFileSync("sig.json", "utf8"));
const st = JSON.parse(fs.readFileSync("out/strokes.json", "utf8"));
const pen = Math.round(st.meanInk * 1.6);
const ts = `// Generated from public/signature.png: the filled glyphs (potrace) and the
// pen's centreline in writing order (skeleton walk). Do not edit by hand.
export const SIGNATURE_VIEWBOX = ${JSON.stringify(fill.viewBox)};
/** mask stroke width that covers the ink from its centreline */
export const SIGNATURE_PEN = ${pen};
export const SIGNATURE_FILL =
  ${JSON.stringify(fill.d)};
/** one stroke per word (the pen lifts between them); each stroke is a
 *  sequence of pieces drawn back to back, split where the pen went back over
 *  its own line. len is in viewBox units. */
export const SIGNATURE_STROKES: { d: string; len: number }[][] = ${JSON.stringify(st.strokes.map((s) => s.pieces))};
`;
fs.writeFileSync(process.argv[2], ts);
console.log("wrote", process.argv[2], "strokes", st.strokes.length, "pen", pen);
