import potrace from "potrace";
import fs from "fs";
const src = process.argv[2];
potrace.trace(src, { threshold: 160, turdSize: 20, optTolerance: 0.4, color: "#000" }, (err, svg) => {
  if (err) throw err;
  const d = [...svg.matchAll(/ d="([^"]+)"/g)].map(m => m[1]).join(" ");
  const vb = svg.match(/viewBox="([^"]+)"/)?.[1] ?? svg.match(/width="(\d+)" height="(\d+)"/).slice(1,3).join(" ");
  fs.writeFileSync("sig.json", JSON.stringify({ viewBox: vb, d }));
  console.log("viewBox", vb, "path chars", d.length);
});
