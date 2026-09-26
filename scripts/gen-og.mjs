#!/usr/bin/env node
/**
 * Generates OG images (1200x630 PNG) from SVG sources.
 * Uses @resvg/resvg-js for SVG-to-PNG conversion.
 * Run: node scripts/gen-og.mjs
 * Output: client/public/og/*.png
 */
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUTPUT_DIR = join(ROOT, 'client', 'public', 'og');

mkdirSync(OUTPUT_DIR, { recursive: true });

const images = [
  { name: 'default', svg: readFileSync(join(__dirname, 'og-source', 'default.svg'), 'utf8') },
  { name: 'pricing', svg: readFileSync(join(__dirname, 'og-source', 'pricing.svg'), 'utf8') },
  { name: 'demo', svg: readFileSync(join(__dirname, 'og-source', 'demo.svg'), 'utf8') },
];

for (const { name, svg } of images) {
  const resvg = new Resvg(svg, { width: 1200, height: 630 });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  const outPath = join(OUTPUT_DIR, `${name}.png`);
  writeFileSync(outPath, pngBuffer);
  console.log(`Generated ${outPath} (${pngBuffer.length} bytes)`);
}

console.log('OG images generated successfully.');
