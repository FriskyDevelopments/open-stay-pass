import { toICS } from "../packages/core/src/index";
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
  const arrivalInstructions =
    locale === "es"
      ? `Guía de llegada HostCasa para ${event.guestName}. Abre el enlace seguro: ${event.arrivalUrl}`
      : `HostCasa arrival guide for ${event.guestName}. Open the secure link: ${event.arrivalUrl}`;
  return toICS({
    id: `${event.credentialId}@open-stay-pass`,
    checkIn: event.arrivalAt,
    checkOut: event.departureAt,
    location: event.propertyName,
    arrivalInstructions,
    summary,
    url: event.arrivalUrl,
    dtstamp: now,
  });
}
