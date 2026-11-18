// Entry for make.fun news-image-20261117: "The World in One Day".
// The program writes the front-page image (entry.png, committed beside
// this file) to /output/entry.png. It runs with no network, Node 22
// standard library only.
//
// Local test:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// then check that out/entry.png exists and matches entry.png.

import { copyFileSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const src = join(here, "entry.png");
const dst = join(outDir, "entry.png");
copyFileSync(src, dst);
// Fail loudly if the copy came out wrong instead of shipping a bad file.
if (statSync(dst).size !== statSync(src).size) {
  throw new Error("entry.png copy size mismatch");
}
