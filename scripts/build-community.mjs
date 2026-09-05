import { build } from "esbuild";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist/oss-review");
const source = path.join(root, "community");
const brand = path.join(root, "docs/brand/claude-design");
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const name of ["index.html", "styles.css", "_headers"]) await cp(path.join(source, name), path.join(output, name));
await cp(path.join(brand, "assets"), path.join(output, "assets"), { recursive: true });
await cp(brand, path.join(output, "design-system"), { recursive: true });
const tokens = await Promise.all(["fonts", "colors", "typography", "spacing", "effects"].map((name) => readFile(path.join(brand, "tokens", `${name}.css`), "utf8")));
await writeFile(path.join(output, "brand.css"), tokens.join("\n"));
await build({ entryPoints: [path.join(source, "app.ts")], outfile: path.join(output, "app.js"), bundle: true, platform: "browser", format: "esm", target: "es2022", minify: true, legalComments: "external" });

const escape = (text) => text.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
for (const [name, title, file] of [["license", "MIT license", "LICENSE"], ["conduct", "Code of Conduct", "CODE_OF_CONDUCT.md"]]) {
  const content = await readFile(path.join(root, file), "utf8");
  await writeFile(path.join(output, `${name}.html`), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} — Open Stay Pass</title><link rel="stylesheet" href="/brand.css"><link rel="stylesheet" href="/styles.css"></head><body><main class="document wrap"><a href="/">← Open Stay Pass community</a><h1>${title}</h1><pre>${escape(content)}</pre><p><a href="https://www.netlify.com/">This site is powered by Netlify</a></p></main></body></html>`);
}
// No product bundle, API proxy, runtime environment, or credential fixture enters this output.
console.info("Community docs + QR Studio built in dist/oss-review.");
