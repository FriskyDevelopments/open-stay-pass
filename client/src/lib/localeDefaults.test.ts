import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Pages that own locale state directly and use onChange={setLocale} on LanguageToggle.
// Home.tsx delegates locale to SiteNav (which uses onChange={setLocale} internally).
const directLocaleOwners = [
  "client/src/pages/Arrival.tsx",
  "client/src/pages/Handoff.tsx",
  "client/src/pages/Integrations.tsx",
  "client/src/pages/Operator.tsx",
];

// Home now delegates to SiteNav but still owns useState<Locale>("en")
const delegatedLocaleOwners = [
  "client/src/pages/Home.tsx",
];

describe("English-first locale defaults", () => {
  it("starts every locale-owning surface in English without removing its Spanish path", async () => {
    const directSources = await Promise.all(directLocaleOwners.map((path) => readFile(resolve(process.cwd(), path), "utf8")));
    directSources.forEach((source) => {
      expect(source).toContain('useState<Locale>("en")');
      expect(source).toContain('onChange={setLocale}');
    });
  });

  it("Home.tsx starts in English (delegates locale to SiteNav)", async () => {
    const delegatedSources = await Promise.all(delegatedLocaleOwners.map((path) => readFile(resolve(process.cwd(), path), "utf8")));
    delegatedSources.forEach((source) => {
      expect(source).toContain('useState<Locale>("en")');
      // Home delegates via setLocale={setLocale} to SiteNav
      expect(source).toContain('setLocale={setLocale}');
    });
  });
});
