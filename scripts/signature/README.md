# Signature animation pipeline

Regenerates `components/signature-path.ts` from `public/signature.png`.
Run from this folder; needs Node 22+ and `npm i potrace@2` here (brings jimp).

```bash
node 1-fill.mjs ../../public/signature.png              # -> sig.json (filled glyphs, potrace)
node 2-skeleton.mjs ../../public/signature.png out       # -> out/segments.json + out/segs-*.svg (labelled centreline pieces)
node 3-assemble.mjs                                      # -> out/strokes.json from the hand-written order in SPEC
node 4-emit.mjs ../../components/signature-path.ts
```

Step 2 thins the ink to a 1px skeleton and cuts it into segments between
junctions; open `out/segs-left.svg`, `segs-mid.svg`, `segs-right.svg` to read
the segment ids. Step 3 holds the pen order as a list of those ids (`12` = as
traced, `12r` = reversed, `J` = the pen goes back over its own line, which
starts a new piece). If the PNG changes, the ids change: re-read the SVGs and
rewrite SPEC.

Why pieces: SVG restarts the dash pattern at every subpath, so each pen-down
run is its own `<path>` and `components/signature.tsx` times them back to back.
