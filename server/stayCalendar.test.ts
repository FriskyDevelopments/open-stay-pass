import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";
import { hashCredentialToken, issueCredentialToken } from "./credentialService";
import { buildStayCalendarIcs, type StayCalendarEvent } from "./stayCalendar";

const mocks = vi.hoisted(() => ({
  getCredentialById: vi.fn(),
  getStayById: vi.fn(),
  recordCredentialActivity: vi.fn(),
}));

vi.mock("./openStayDb", () => ({
  getCredentialById: mocks.getCredentialById,
  getStayById: mocks.getStayById,
  recordCredentialActivity: mocks.recordCredentialActivity,
}));

import { openStayRouter } from "./openStayRouter";

const baseEvent: StayCalendarEvent = {
  credentialId: "credential-1",
  propertyName: "La Casa de Barra",
  guestName: "Frisky",
  arrivalAt: new Date("2026-11-01T15:00:00.000Z"),
  departureAt: new Date("2026-11-04T11:00:00.000Z"),
  arrivalUrl: "https://staypass.dev/arrival/token-abc",
};

const unfoldedLines = (ics: string) =>
  ics.split("\r\n").filter(line => !line.startsWith(" "));

describe("stay calendar ICS generator", () => {
  it("emits a single-event VCALENDAR with CRLF endings and UTC timestamps", () => {
    const ics = buildStayCalendarIcs(
      baseEvent,
      new Date("2026-10-06T12:00:00.000Z")
    );
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    expect(ics).not.toMatch(/[^\r]\n/);
    const lines = unfoldedLines(ics);
    for (const required of [
      "VERSION:2.0",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      "END:VEVENT",
    ]) {
      expect(lines).toContain(required);
    }
    expect(lines).toContain("UID:credential-1@open-stay-pass");
    expect(lines).toContain("DTSTAMP:20261006T120000Z");
    expect(lines).toContain("DTSTART:20261101T150000Z");
    expect(lines).toContain("DTEND:20261104T110000Z");
    expect(lines).toContain("SUMMARY:Stay at La Casa de Barra");
    expect(lines).toContain("LOCATION:La Casa de Barra");
    expect(lines).toContain("URL:https://staypass.dev/arrival/token-abc");
    expect(lines).toContain("STATUS:CONFIRMED");
  });

  it("escapes text values that contain separators, backslashes, or newlines", () => {
    const ics = buildStayCalendarIcs({
      ...baseEvent,
      propertyName: "Casa; Norte, Suite\\B\nLower",
    });
    expect(ics).toContain(
      "SUMMARY:Stay at Casa\\; Norte\\, Suite\\\\B\\nLower"
    );
    expect(ics).toContain("LOCATION:Casa\\; Norte\\, Suite\\\\B\\nLower");
  });

  it("folds content lines to at most 75 octets without splitting a multi-byte character", () => {
    const ics = buildStayCalendarIcs({
      ...baseEvent,
      propertyName: `Hacienda ${"í".repeat(80)}`,
    });
    for (const line of ics.split("\r\n")) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
    expect(ics).toContain("\r\n ");
  });

  it("localizes the summary and description for Spanish guests", () => {
    const ics = buildStayCalendarIcs({ ...baseEvent, locale: "es" });
    expect(ics).toContain("SUMMARY:Estancia en La Casa de Barra");
    expect(ics).toContain("DESCRIPTION:Guía de llegada HostCasa para Frisky.");
  });

  it("rejects a stay whose departure does not follow arrival", () => {
    expect(() =>
      buildStayCalendarIcs({ ...baseEvent, departureAt: baseEvent.arrivalAt })
    ).toThrow("departure");
    expect(() =>
      buildStayCalendarIcs({
        ...baseEvent,
        departureAt: new Date(baseEvent.arrivalAt.getTime() - 1),
      })
    ).toThrow("departure");
  });
});

describe("arrival credential calendar payload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns a downloadable ICS event alongside the resolved stay", async () => {
    const token = issueCredentialToken({
      credentialId: "credential-1",
      scope: "arrival",
      expiresAt: Date.now() + 60_000,
    });
    mocks.getCredentialById.mockResolvedValue({
      id: "credential-1",
      operatorId: 7,
      stayId: "stay-1",
      tokenHash: hashCredentialToken(token),
      status: "active",
      expiresAt: new Date(Date.now() + 60_000),
    });
    mocks.getStayById.mockResolvedValue({
      id: "stay-1",
      propertyName: "La Casa de Barra",
      guestName: "Frisky",
      arrivalAt: new Date("2026-11-01T15:00:00.000Z"),
      departureAt: new Date("2026-11-04T11:00:00.000Z"),
    });
    mocks.recordCredentialActivity.mockResolvedValue({ shouldNotify: false });

    const caller = openStayRouter.createCaller({
      user: null,
      req: {} as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    });
    const result = await caller.public.arrival({ token, locale: "en" });

    expect(result.stay.id).toBe("stay-1");
    expect(result.calendarIcs).toContain("BEGIN:VCALENDAR");
    expect(result.calendarIcs).toContain("SUMMARY:Stay at La Casa de Barra");
    expect(result.calendarIcs.replace(/\r\n /g, "")).toContain(
      `URL:https://staypass.dev/arrival/${token}`
    );
    // The calendar carries the same signed link the QR exposes and nothing
    // more: Wi-Fi secrets never enter the event payload.
    expect(result.calendarIcs).not.toContain("wifiPassword");
  });
});
