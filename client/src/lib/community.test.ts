import { describe, expect, it } from "vitest";
import { getGitHubRepositoryUrl, getSupportLinks } from "./community";

describe("community support configuration", () => {
  it("returns only secure, verified support destinations", () => {
    expect(getSupportLinks({
      kofi: "https://ko-fi.com/openstaypass",
      nowpayments: "https://nowpayments.io/donation/Frisky",
      wise: "https://wise.com/pay/business/friskydevelopmentsllc",
    }).map(link => link.id)).toEqual(["kofi", "nowpayments", "wise"]);
    expect(getSupportLinks({
      kofi: "http://ko-fi.com/openstaypass",
      nowpayments: "https://example.com/donation/Frisky",
      wise: "https://wise.com/wrong/path",
    })).toEqual([]);
  });

  it("renders a GitHub star destination only for a secure GitHub repository URL", () => {
    expect(getGitHubRepositoryUrl()).toBe("https://github.com/FriskyDevelopments/open-stay-pass");
    expect(getGitHubRepositoryUrl("https://github.com/frisky/open-stay-pass")).toBe("https://github.com/frisky/open-stay-pass");
    expect(getGitHubRepositoryUrl("https://example.com/frisky/open-stay-pass")).toBeNull();
  });
});
