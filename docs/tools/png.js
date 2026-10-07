// Minimal PNG decode/encode (8-bit RGBA/RGB/palette+tRNS, non-interlaced) using zlib.
const zlib = require('zlib'); const fs = require('fs');
const crcTable = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(buf) { let c = 0xffffffff; for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function decode(file) {
  const buf = fs.readFileSync(file); let pos = 8; let w, h, bitDepth, colorType, idat = [], plte = null, trns = null;
  while (pos < buf.length) { const len = buf.readUInt32BE(pos); const type = buf.toString('ascii', pos + 4, pos + 8); const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; if (data[12] !== 0) throw new Error('interlaced'); }
    else if (type === 'PLTE') plte = data; else if (type === 'tRNS') trns = data; else if (type === 'IDAT') idat.push(data);
    pos += 12 + len; }
  if (bitDepth !== 8) throw new Error('bitDepth ' + bitDepth);
  const ch = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType]; const raw = zlib.inflateSync(Buffer.concat(idat)); const stride = w * ch; const out = Buffer.alloc(w * h * 4);
  let prev = Buffer.alloc(stride); let p = 0;
  for (let y = 0; y < h; y++) { const f = raw[p++]; const line = Buffer.from(raw.subarray(p, p + stride)); p += stride;
    for (let i = 0; i < stride; i++) { const a = i >= ch ? line[i - ch] : 0, b = prev[i], c = i >= ch ? prev[i - ch] : 0; let v = line[i];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1; else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      line[i] = v & 255; }
    for (let x = 0; x < w; x++) { const o = (y * w + x) * 4; const i = x * ch;
      if (colorType === 6) { out[o] = line[i]; out[o + 1] = line[i + 1]; out[o + 2] = line[i + 2]; out[o + 3] = line[i + 3]; }
      else if (colorType === 2) { out[o] = line[i]; out[o + 1] = line[i + 1]; out[o + 2] = line[i + 2]; out[o + 3] = 255; }
      else if (colorType === 3) { const idx = line[i]; out[o] = plte[idx * 3]; out[o + 1] = plte[idx * 3 + 1]; out[o + 2] = plte[idx * 3 + 2]; out[o + 3] = trns && idx < trns.length ? trns[idx] : 255; }
      else if (colorType === 0) { out[o] = out[o + 1] = out[o + 2] = line[i]; out[o + 3] = 255; }
      else if (colorType === 4) { out[o] = out[o + 1] = out[o + 2] = line[i]; out[o + 3] = line[i + 1]; } }
    prev = line; }
  return { width: w, height: h, data: out };
}
function chunk(type, data) { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type, 'ascii'), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td)); return Buffer.concat([len, td, crc]); }
function encode(file, img) { const { width: w, height: h, data } = img; const raw = Buffer.alloc((w * 4 + 1) * h); for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; data.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  fs.writeFileSync(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))])); }
function px(img, x, y) { const o = (y * img.width + x) * 4; return [img.data[o], img.data[o + 1], img.data[o + 2], img.data[o + 3]]; }
function set(img, x, y, c) { if (x < 0 || y < 0 || x >= img.width || y >= img.height) return; const o = (y * img.width + x) * 4; img.data[o] = c[0]; img.data[o + 1] = c[1]; img.data[o + 2] = c[2]; img.data[o + 3] = c.length > 3 ? c[3] : 255; }
function create(w, h) { return { width: w, height: h, data: Buffer.alloc(w * h * 4) }; }
module.exports = { decode, encode, px, set, create };
