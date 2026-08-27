import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const localeOwners = [
  "client/src/pages/Arrival.tsx",
  "client/src/pages/Handoff.tsx",
  "client/src/pages/Home.tsx",
  "client/src/pages/Integrations.tsx",
  "client/src/pages/Operator.tsx",
];

describe("English-first locale defaults", () => {
  it("starts every locale-owning surface in English without removing its Spanish path", async () => {
    const sourceFiles = await Promise.all(localeOwners.map((path) => readFile(resolve(process.cwd(), path), "utf8")));
    sourceFiles.forEach((source) => {
      expect(source).toContain('useState<Locale>("en")');
      expect(source).toContain('onChange={setLocale}');
    });
  });
});
