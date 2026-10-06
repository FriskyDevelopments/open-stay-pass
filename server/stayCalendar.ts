import type { Locale } from "../shared/openStay";

export type StayCalendarEvent = {
  credentialId: string;
  propertyName: string;
  guestName: string;
  arrivalAt: Date;
  departureAt: Date;
  arrivalUrl: string;
  locale?: Locale;
};

const CRLF = "\r\n";
const MAX_LINE_OCTETS = 75;
const encoder = new TextEncoder();

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function formatUtc(date: Date): string {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
}

// RFC 5545 content lines are capped at 75 octets; continuation lines start
// with a single space. Folding walks UTF-16 code points so a multi-byte
// character is never split across a fold.
function foldLine(line: string): string {
  if (encoder.encode(line).length <= MAX_LINE_OCTETS) return line;
  const segments: string[] = [];
  let current = "";
  let used = 0;
  let cap = MAX_LINE_OCTETS;
  for (const char of line) {
    const size = encoder.encode(char).length;
    if (used + size > cap) {
      segments.push(current);
      current = "";
      used = 0;
      cap = MAX_LINE_OCTETS - 1;
    }
    current += char;
    used += size;
  }
  segments.push(current);
  return segments.join(`${CRLF} `);
}

// The event carries only what a calendar invite needs: property, dates, and
// the same signed arrival URL the QR already exposes. Wi-Fi credentials,
// lock state, and tokens beyond the existing link stay out of the file.
export function buildStayCalendarIcs(
  event: StayCalendarEvent,
  now = new Date()
): string {
  if (!(event.departureAt.getTime() > event.arrivalAt.getTime())) {
    throw new Error("Stay calendar departure must follow arrival.");
  }
  const locale = event.locale ?? "en";
  const summary =
    locale === "es"
      ? `Estancia en ${event.propertyName}`
      : `Stay at ${event.propertyName}`;
  const description =
    locale === "es"
      ? `Guía de llegada HostCasa para ${event.guestName}. Abre el enlace seguro: ${event.arrivalUrl}`
      : `HostCasa arrival guide for ${event.guestName}. Open the secure link: ${event.arrivalUrl}`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FriskyDevelopments//Open Stay Pass//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.credentialId}@open-stay-pass`,
    `DTSTAMP:${formatUtc(now)}`,
    `DTSTART:${formatUtc(event.arrivalAt)}`,
    `DTEND:${formatUtc(event.departureAt)}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `LOCATION:${escapeText(event.propertyName)}`,
    `URL:${event.arrivalUrl}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `${lines.map(foldLine).join(CRLF)}${CRLF}`;
}
