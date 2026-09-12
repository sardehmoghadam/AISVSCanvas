// Generates public/opengraph-image.png — a branded 1200x630 placeholder for
// social link previews (OG/Twitter cards). Pure Node (no dependencies).
// Re-run with: node scripts/generate-og-image.mjs
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const WIDTH = 1200;
const HEIGHT = 630;

// Brand palette (matches the site's teal -> blue accents).
const TEAL = [20, 184, 166];
const BLUE = [59, 130, 246];
const DARK = [9, 14, 25];

// CRC-32 table (required for PNG chunk trailers).
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc = crcTable[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuffer = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

const lerp = (a, b, t) => Math.round(a + (b - a) * t);

const raw = Buffer.alloc(HEIGHT * (1 + WIDTH * 3));

for (let y = 0; y < HEIGHT; y += 1) {
  const rowStart = y * (1 + WIDTH * 3);
  raw[rowStart] = 0; // PNG filter type: None
  for (let x = 0; x < WIDTH; x += 1) {
    // Diagonal progress from top-left (teal) to bottom-right (blue).
    const t = (x / (WIDTH - 1) + y / (HEIGHT - 1)) / 2;

    // Soft vignette so the edges fade to dark.
    const nx = (x / (WIDTH - 1)) * 2 - 1;
    const ny = (y / (HEIGHT - 1)) * 2 - 1;
    const dist = Math.sqrt(nx * nx + ny * ny);
    const vignette = Math.max(0, 1 - Math.max(0, (dist - 0.5) / 0.95));

    const r = lerp(DARK[0], lerp(TEAL[0], BLUE[0], t), vignette);
    const g = lerp(DARK[1], lerp(TEAL[1], BLUE[1], t), vignette);
    const b = lerp(DARK[2], lerp(TEAL[2], BLUE[2], t), vignette);

    const px = rowStart + 1 + x * 3;
    raw[px] = r;
    raw[px + 1] = g;
    raw[px + 2] = b;
  }
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(WIDTH, 0);
ihdr.writeUInt32BE(HEIGHT, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // color type: truecolor RGB
ihdr[10] = 0; // compression: default
ihdr[11] = 0; // filter method: default
ihdr[12] = 0; // interlace: none

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw)),
  chunk("IEND", Buffer.alloc(0)),
]);

const outputPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "opengraph-image.png",
);

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, png);
console.log(`Generated ${outputPath} (${png.length} bytes)`);
