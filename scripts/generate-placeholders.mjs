import { mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const framesDir = join(__dirname, "..", "public", "frames-mobile");
mkdirSync(framesDir, { recursive: true });

const tones = [
  "#2b1a12",
  "#3d281c",
  "#5a3a22",
  "#c8873a",
  "#f5ede3",
];

for (let i = 0; i < tones.length; i++) {
  const name = `f_${String(i + 1).padStart(4, "0")}.webp`;
  const out = join(framesDir, name);
  await sharp({
    create: {
      width: 1280,
      height: 720,
      channels: 3,
      background: tones[i],
    },
  })
    .webp({ quality: 75 })
    .toFile(out);
  console.log("Wrote", name);
}

const ogPath = join(__dirname, "..", "public", "og.jpg");
await sharp({
  create: {
    width: 1200,
    height: 630,
    channels: 3,
    background: { r: 43, g: 26, b: 18 },
  },
})
  .jpeg({ quality: 85 })
  .toFile(ogPath);
console.log("Wrote public/og.jpg");
console.log("Done. Run scripts/make-frames.sh for the full hero sequence.");
