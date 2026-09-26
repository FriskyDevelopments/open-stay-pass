/**
 * Analytics helper — typed track() that no-ops when analytics is not configured.
 * Loads Umami only when BOTH VITE_ANALYTICS_ENDPOINT and VITE_ANALYTICS_WEBSITE_ID are set.
 * No PII is ever passed to events.
 */

export type TrackEvent =
  | 'demo_start'
  | 'demo_complete'
  | 'pricing_view'
  | 'contact_submit'
  | 'start_selfhost';

const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT as string | undefined;
const websiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID as string | undefined;

const isConfigured =
  typeof endpoint === 'string' &&
  endpoint.length > 0 &&
  endpoint.startsWith('https://') &&
  typeof websiteId === 'string' &&
  websiteId.length > 0;

/** Inject the umami script once when analytics is configured. */
export function initAnalytics(): void {
  if (!isConfigured) return;
  if (document.querySelector('[data-umami-init]')) return;
  const s = document.createElement('script');
  s.defer = true;
  s.src = `${endpoint}/script.js`;
  s.setAttribute('data-website-id', websiteId!);
  s.setAttribute('data-umami-init', 'true');
  document.head.appendChild(s);
}

/** Track a funnel event. No-ops when analytics is not configured. No PII. */
export function track(event: TrackEvent, data?: Record<string, string | number | boolean>): void {
  if (!isConfigured) return;
  try {
    // umami exposes window.umami after script load
    const w = window as unknown as { umami?: { track: (name: string, data?: unknown) => void } };
    if (w.umami?.track) {
      w.umami.track(event, data);
    }
  } catch {
    // silent — never crash on analytics failure
  }
}
