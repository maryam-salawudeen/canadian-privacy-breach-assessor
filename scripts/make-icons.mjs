// Draws the shield-and-check mark as PNG app icons with no image dependencies.
// Run with `npm run icons`; output goes to public/.
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const BG = [0x0b, 0x10, 0x17];
const MARK = [0x4f, 0xb3, 0xff];
const SS = 4; // supersampling per axis

function crc32(buf) {
  let crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    let c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
function png(size, rgba) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))
  ]);
}

// Shape in a 0..40 unit box, matching public/favicon.svg.
function inShield(u, v) {
  if (v < 7 || v > 33 || u < 10 || u > 30) return false;
  const top = 11 - 4 * (1 - Math.abs(u - 20) / 10); // roof from (10,11) up to (20,7)
  if (v < top) return false;
  if (v <= 19) return true;
  // lower half narrows to the point at (20,33)
  const t = (v - 19) / 14;
  return Math.abs(u - 20) <= 10 * Math.sqrt(1 - t * t);
}
function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}
function inCheck(u, v) {
  return distToSegment(u, v, 15.5, 20.5, 18.7, 23.7) < 1.3 || distToSegment(u, v, 18.7, 23.7, 24.7, 17.3) < 1.3;
}
function sample(u, v, { rounded, scale }) {
  if (rounded) {
    const r = 9, x = Math.min(u, 40 - u), y = Math.min(v, 40 - v);
    if (x < r && y < r && (r - x) ** 2 + (r - y) ** 2 > r * r) return null;
  }
  const su = 20 + (u - 20) / scale, sv = 20 + (v - 20) / scale;
  if (inShield(su, sv)) return inCheck(su, sv) ? BG : MARK;
  return BG;
}
function render(size, opts) {
  const out = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    let r = 0, g = 0, b = 0, a = 0;
    for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
      const c = sample(((x + (sx + 0.5) / SS) / size) * 40, ((y + (sy + 0.5) / SS) / size) * 40, opts);
      if (c) { r += c[0]; g += c[1]; b += c[2]; a++; }
    }
    const i = (y * size + x) * 4, n = SS * SS;
    if (a) { out[i] = r / a; out[i + 1] = g / a; out[i + 2] = b / a; }
    out[i + 3] = Math.round((a / n) * 255);
  }
  return png(size, out);
}

writeFileSync("public/icon-192.png", render(192, { rounded: true, scale: 1 }));
writeFileSync("public/icon-512.png", render(512, { rounded: true, scale: 1 }));
writeFileSync("public/icon-maskable-512.png", render(512, { rounded: false, scale: 0.8 }));
writeFileSync("public/apple-touch-icon.png", render(180, { rounded: false, scale: 0.9 }));
console.log("Icons written to public/");
