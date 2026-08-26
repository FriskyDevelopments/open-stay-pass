import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";

const width = 58;
const height = 58;
const pixels = Buffer.alloc((width * 4 + 1) * height);
for (let y = 0; y < height; y += 1) {
  const row = y * (width * 4 + 1);
  pixels[row] = 0;
  for (let x = 0; x < width; x += 1) {
    const pos = row + 1 + x * 4;
    const accent = x > 14 && x < 43 && y > 14 && y < 43;
    pixels[pos] = accent ? 62 : 17;
    pixels[pos + 1] = accent ? 163 : 26;
    pixels[pos + 2] = accent ? 132 : 28;
    pixels[pos + 3] = 255;
  }
}
const chunk = (type, data) => {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  let value = 0xffffffff;
  const input = Buffer.concat([Buffer.from(type), data]);
  for (const byte of input) {
    value ^= byte;
    for (let i = 0; i < 8; i += 1) value = (value >>> 1) ^ (0xedb88320 & -(value & 1));
  }
  crc.writeUInt32BE((value ^ 0xffffffff) >>> 0);
  return Buffer.concat([length, Buffer.from(type), data, crc]);
};
const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk("IHDR", Buffer.from([0, 0, 0, width, 0, 0, 0, height, 8, 6, 0, 0, 0])),
  chunk("IDAT", deflateSync(pixels)),
  chunk("IEND", Buffer.alloc(0)),
]);
writeFileSync("server/wallet/folios-icon.png", png);
