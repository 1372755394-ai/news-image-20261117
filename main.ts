// Entry for make.fun news-image-20261117: "The World in One Day".
// The program writes the front-page image (entry.png, committed beside
// this file) to /output/entry.png. It runs with no network, Node 22
// standard library only.
//
// Local test:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// then check that out/entry.png exists and matches entry.png.

import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const src = join(here, "entry.png");
const dst = join(outDir, "entry.png");
// Fail loudly if the bundled image is not a PNG at all instead of
// shipping a corrupt file: the gate rejects anything that is not a
// whole PNG/JPEG, and a size check alone would not catch that.
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const srcBytes = readFileSync(src);
if (!srcBytes.subarray(0, 8).equals(PNG_SIGNATURE)) {
  throw new Error("entry.png is not a PNG file (bad signature)");
}
// Enforce the competition gate limits (at most 1 MiB, at most
// 1024x1024) from the PNG IHDR before copying, so an oversized
// image fails loudly here instead of being submitted invalid.
if (srcBytes.length > 1048576) {
  throw new Error(`entry.png is ${srcBytes.length} bytes, over the 1 MiB limit`);
}
if (srcBytes.length < 33 || srcBytes.toString("latin1", 12, 16) !== "IHDR") {
  throw new Error("entry.png has no IHDR chunk");
}
const width = srcBytes.readUInt32BE(16);
const height = srcBytes.readUInt32BE(20);
if (width > 1024 || height > 1024) {
  throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 limit`);
}
copyFileSync(src, dst);
// Fail loudly if the copy came out wrong instead of shipping a bad file.
if (statSync(dst).size !== statSync(src).size) {
  throw new Error("entry.png copy size mismatch");
}
