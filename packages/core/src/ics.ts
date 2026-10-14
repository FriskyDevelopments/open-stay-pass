/**
 * RFC 5545 calendar for a stay pass.
 *
 * The file carries check-in, check-out, location, and arrival instructions.
 * It does not carry Wi-Fi secrets, lock state, or signing material.
 */

export type StayPass = {
  /** Becomes the VEVENT UID verbatim. */
  id: string;
  checkIn: Date;
  checkOut: Date;
  location: string;
  /** Plain text placed in DESCRIPTION. */
  arrivalInstructions: string;
  /**
   * IANA time zone for DTSTART and DTEND. When omitted, those values are UTC.
   * DTSTAMP is always UTC.
   */
  timeZone?: string;
  /** Clock for DTSTAMP. Defaults to the time of the call. */
  dtstamp?: Date;
  summary?: string;
  url?: string;
};

const CRLF = "\r\n";
const MAX_LINE_OCTETS = 75;
const encoder = new TextEncoder();

const PRODID = "-//FriskyDevelopments//Open Stay Pass//EN";

function requireDate(value: Date, label: string): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new Error(`Stay pass ${label} must be a valid Date.`);
  }
  return value;
}

function requireSingleLine(value: string, label: string): void {
  if (value.length === 0 || /[\r\n]/.test(value)) {
    throw new Error(`Stay pass ${label} must be a single non-empty line.`);
  }
}

function assertTimeZone(timeZone: string): void {
  if (!/^([A-Za-z0-9_+-]+)(\/[A-Za-z0-9_+-]+)*$/.test(timeZone)) {
    throw new Error(`Stay pass time zone is not an IANA name: ${timeZone}`);
  }
  try {
    Intl.DateTimeFormat("en-US", { timeZone });
  } catch {
    throw new Error(`Stay pass time zone is not an IANA name: ${timeZone}`);
  }
}

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

function formatZoned(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find(part => part.type === type)?.value ?? "";
  const hour = get("hour") === "24" ? "00" : get("hour");
  return `${get("year")}${get("month")}${get("day")}T${hour}${get("minute")}${get("second")}`;
}

function formatDateTime(
  name: "DTSTART" | "DTEND",
  date: Date,
  timeZone: string | undefined
): string {
  if (!timeZone) return `${name}:${formatUtc(date)}`;
  assertTimeZone(timeZone);
  return `${name};TZID=${timeZone}:${formatZoned(date, timeZone)}`;
}

// RFC 5545 content lines are capped at 75 octets; continuation lines start
// with a single space. Folding walks Unicode code points so a multi-byte
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

export function toICS(pass: StayPass): string {
  requireSingleLine(pass.id, "id");
  const checkIn = requireDate(pass.checkIn, "checkIn");
  const checkOut = requireDate(pass.checkOut, "checkOut");
  if (!(checkOut.getTime() > checkIn.getTime())) {
    throw new Error("Stay pass check-out must follow check-in.");
  }
  const dtstamp = requireDate(pass.dtstamp ?? new Date(), "dtstamp");
  if (pass.url !== undefined) requireSingleLine(pass.url, "url");
  if (pass.timeZone) assertTimeZone(pass.timeZone);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${PRODID}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${pass.id}`,
    `DTSTAMP:${formatUtc(dtstamp)}`,
    formatDateTime("DTSTART", checkIn, pass.timeZone),
    formatDateTime("DTEND", checkOut, pass.timeZone),
    ...(pass.summary !== undefined
      ? [`SUMMARY:${escapeText(pass.summary)}`]
      : []),
    `DESCRIPTION:${escapeText(pass.arrivalInstructions)}`,
    `LOCATION:${escapeText(pass.location)}`,
    ...(pass.url !== undefined ? [`URL:${pass.url}`] : []),
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `${lines.map(foldLine).join(CRLF)}${CRLF}`;
}
