import { crc32, deflateSync } from 'node:zlib';
import { AvatarGenerator } from '../../application/ports.js';
import type { GeneratedImage } from '../../domain/hero-idea.js';

const WIDTH = 320;
const HEIGHT = 400;

export class DemoAvatarGenerator extends AvatarGenerator {
  async generate(_prompt: string, seed: string): Promise<GeneratedImage> {
    let hash = 7;
    for (let index = 0; index < seed.length; index++) {
      hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
    }
    const hue = hash % 360;
    const top = hslToRgb(hue, 0.7, 0.45);
    const bottom = hslToRgb((hue + 60) % 360, 0.65, 0.18);

    return { content: gradientPng(top, bottom) };
  }
}

type Rgb = [number, number, number];

function gradientPng(top: Rgb, bottom: Rgb): Buffer {
  const rows: Buffer[] = [];

  for (let y = 0; y < HEIGHT; y++) {
    const t = y / (HEIGHT - 1);
    const row = Buffer.alloc(1 + WIDTH * 3);
    for (let x = 0; x < WIDTH; x++) {
      const glow = Math.max(
        0,
        1 - Math.hypot(x - WIDTH / 2, y - HEIGHT * 0.4) / (WIDTH * 0.7),
      );
      for (let channel = 0; channel < 3; channel++) {
        const base = top[channel] * (1 - t) + bottom[channel] * t;
        row[1 + x * 3 + channel] = Math.min(255, Math.round(base + glow * 60));
      }
    }
    rows.push(row);
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(WIDTH, 0);
  header.writeUInt32BE(HEIGHT, 4);
  header.set([8, 2, 0, 0, 0], 8);

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(Buffer.concat(rows))),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function chunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function hslToRgb(hue: number, saturation: number, lightness: number): Rgb {
  const a = saturation * Math.min(lightness, 1 - lightness);
  const channel = (n: number) => {
    const k = (n + hue / 30) % 12;
    return Math.round(
      255 * (lightness - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))),
    );
  };
  return [channel(0), channel(8), channel(4)];
}
