// Generates app/icon.png (512x512) and app/apple-icon.png (180x180) — the
// favicon and Apple touch icons for the site. Pure Node (no dependencies).
// Re-run with: node scripts/generate-icons.mjs
import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const TEAL = [20, 184, 166];
const BLUE = [59, 130, 246];
const DARK = [9, 14, 25];

// CRC-32 table + PNG chunk writer (same approach as scripts/generate-og-image.mjs).
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
const clamp01 = (v) => Math.max(0, Math.min(1, v));

/** Rounded-square dark background with a diagonal teal->blue gradient disc. */
function renderIcon(size) {
  const raw = Buffer.alloc(size * (1 + size * 4));
  const corner = size * 0.22;
  const radius = size * 0.31;
  const c = (size - 1) / 2;
  const half = (size - 1) / 2;

  for (let y = 0; y < size; y += 1) {
    const rowStart = y * (1 + size * 4);
    raw[rowStart] = 0; // PNG filter type: None
    for (let x = 0; x < size; x += 1) {
      // Distance to a rounded square (SDF) for anti-aliased, transparent corners.
      const qx = Math.abs(x - c) - (half - corner);
      const qy = Math.abs(y - c) - (half - corner);
      const rectDist =
        Math.min(Math.max(qx, qy), 0) +
        Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) -
        corner;
      const rectAlpha = clamp01(0.5 - rectDist);

      const t = (x / (size - 1) + y / (size - 1)) / 2;
      const px = rowStart + 1 + x * 4;

      if (rectAlpha <= 0) {
        raw[px] = 0;
        raw[px + 1] = 0;
        raw[px + 2] = 0;
        raw[px + 3] = 0;
        continue;
      }

      let r = DARK[0];
      let g = DARK[1];
      let b = DARK[2];

      // Gradient disc drawn over the background.
      const circleDist = Math.hypot(x - c, y - c) - radius;
      const circleAlpha = clamp01(0.5 - circleDist);
      if (circleAlpha > 0) {
        r = lerp(DARK[0], lerp(TEAL[0], BLUE[0], t), circleAlpha);
        g = lerp(DARK[1], lerp(TEAL[1], BLUE[1], t), circleAlpha);
        b = lerp(DARK[2], lerp(TEAL[2], BLUE[2], t), circleAlpha);
      }

      raw[px] = r;
      raw[px + 1] = g;
      raw[px + 2] = b;
      raw[px + 3] = Math.round(rectAlpha * 255);
    }
  }
  return raw;
}

function encodePng(size) {
  const raw = renderIcon(size);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: truecolor + alpha
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter method
  ihdr[12] = 0; // interlace

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), "..", "app");
mkdirSync(appDir, { recursive: true });

for (const [filename, size] of [
  ["icon.png", 512],
  ["apple-icon.png", 180],
]) {
  const outputPath = resolve(appDir, filename);
  const png = encodePng(size);
  writeFileSync(outputPath, png);
  console.log(`Generated ${outputPath} (${png.length} bytes)`);
}