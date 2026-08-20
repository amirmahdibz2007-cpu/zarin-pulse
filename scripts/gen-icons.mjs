import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i += 1) {
    c ^= buf[i];
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crc]);
}

function png(width, height, r, g, b) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 3 + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x += 1) {
      const o = row + 1 + x * 3;
      const onMark = x > width * 0.35 && x < width * 0.65 && y > height * 0.2 && y < height * 0.8;
      raw[o] = onMark ? 250 : r;
      raw[o + 1] = onMark ? 204 : g;
      raw[o + 2] = onMark ? 21 : b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const idat = zlib.deflateSync(raw);
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'apps', 'web', 'public');
const appDir = path.join(root, 'apps', 'web', 'app');
fs.mkdirSync(pub, { recursive: true });
fs.writeFileSync(path.join(pub, 'icon-192.png'), png(192, 192, 17, 24, 39));
fs.writeFileSync(path.join(pub, 'icon-512.png'), png(512, 512, 17, 24, 39));
fs.writeFileSync(path.join(pub, 'icon-maskable.png'), png(512, 512, 17, 24, 39));
fs.writeFileSync(path.join(appDir, 'apple-icon.png'), png(180, 180, 17, 24, 39));
const sha = createHash('sha256').update(png(192, 192, 17, 24, 39)).digest('hex').slice(0, 12);
console.log(`gen-icons: ok ${sha}`);
