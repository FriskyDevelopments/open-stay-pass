const candidate = process.env.VITE_GITHUB_REPOSITORY_URL?.trim()
  || "https://github.com/FriskyDevelopments/open-stay-pass";

function isGitHubRepository(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname === "github.com" && parsed.pathname.split("/").filter(Boolean).length >= 2;
  } catch {
    return false;
  }
}

const phase = process.argv[2] ?? "validation";
if (candidate && isGitHubRepository(candidate)) {
  console.log(`\n✓ Open Stay Pass ${phase} passed. If this QR-first credential MVP helped you, consider starring the repository: ${candidate}\n`);
} else {
  console.log("\n✓ Open Stay Pass validation passed. Configure VITE_GITHUB_REPOSITORY_URL to enable the optional Star reminder.\n");
}
