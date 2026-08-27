import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectFile = (path: string) => resolve(process.cwd(), path);

describe("public repository readiness", () => {
  it("keeps a locked CI validation workflow for main and pull requests", async () => {
    const workflow = await readFile(projectFile(".github/workflows/ci.yml"), "utf8");
    expect(workflow).toContain("pnpm install --frozen-lockfile");
    expect(workflow).toContain("pnpm validate");
    expect(workflow).toContain("pull_request:");
    expect(workflow).toContain("branches: [main]");
  });

  it("ships recognized issue forms that protect credential and security boundaries", async () => {
    const config = await readFile(projectFile(".github/ISSUE_TEMPLATE/config.yml"), "utf8");
    const bugForm = await readFile(projectFile(".github/ISSUE_TEMPLATE/bug_report.yml"), "utf8");
    const featureForm = await readFile(projectFile(".github/ISSUE_TEMPLATE/feature_request.yml"), "utf8");
    expect(config).toContain("security/advisories/new");
    expect(bugForm).toContain("signed URLs");
    expect(featureForm).toContain("QR-first");
    expect(featureForm).toContain("physical-access secrets");
  });

  it("documents the verified repository, demo, and press-kit entry points", async () => {
    const readme = await readFile(projectFile("README.md"), "utf8");
    expect(readme).toContain("https://github.com/FriskyDevelopments/open-stay-pass");
    expect(readme).toContain("https://staypass-pmz7aqns.manus.space");
    expect(readme).toContain("https://staypass-pmz7aqns.manus.space/press-kit");
    expect(readme).toContain("English-first");
    expect(readme).not.toContain("Spanish-first press kit");
    expect(readme).not.toContain("cp .env.example .env");
  });

  it("does not ship generated debug collectors to public visitors", async () => {
    await expect(readFile(projectFile("client/public/__manus__/debug-collector.js"), "utf8")).rejects.toThrow();
  });
});
