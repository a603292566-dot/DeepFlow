import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import zlib from "node:zlib";

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function makeIcon(size) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  const center = (size - 1) / 2;
  const radius = size * 0.36;

  for (let y = 0; y < size; y += 1) {
    const row = y * (size * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < size; x += 1) {
      const offset = row + 1 + x * 4;
      const t = (x + y) / (size * 2);
      let r = Math.round(47 + t * 54);
      let g = Math.round(111 - t * 28);
      let b = Math.round(103 + t * 42);
      const distance = Math.hypot(x - center, y - center);
      if (distance < radius) {
        const inner = 1 - distance / radius;
        r = Math.round(255 * inner + r * (1 - inner));
        g = Math.round(253 * inner + g * (1 - inner));
        b = Math.round(248 * inner + b * (1 - inner));
      }
      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
      raw[offset + 3] = 255;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

const iconDir = resolve("icons");
await mkdir(iconDir, { recursive: true });
await writeFile(resolve(iconDir, "icon-192.png"), makeIcon(192));
await writeFile(resolve(iconDir, "icon-512.png"), makeIcon(512));
