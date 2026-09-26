/**
 * Waitlist client for the shared frisky-lists Worker (Cloudflare Worker + D1).
 * The Worker answers 200 for new AND duplicate emails, so the UI never learns whether an address already exists.
 */
export const WAITLIST_LIST = 'staypass-waitlist' as const;

export const WAITLIST_ENDPOINT = (
  (import.meta.env.VITE_WAITLIST_ENDPOINT as string | undefined) || 'https://frisky-lists.hrgrrtks2p.workers.dev'
).replace(/\/+$/, '');

export type WaitlistResult =
  | { ok: true }
  | { ok: false; reason: 'invalid_email' | 'rate_limited' | 'network' | 'server' };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isLikelyEmail(value: string): boolean {
  const v = value.trim();
  return v.length <= 254 && EMAIL_RE.test(v);
}

export function readUtm(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const out: Record<string, string> = {};
  for (const key of ['source', 'medium', 'campaign', 'term', 'content']) {
    const value = params.get(`utm_${key}`);
    if (value) out[key] = value.slice(0, 200);
  }
  return out;
}

export async function joinWaitlist(input: {
  email: string;
  source: string;
  /** honeypot value; real people leave it empty */
  website?: string;
  fetchImpl?: typeof fetch;
}): Promise<WaitlistResult> {
  const doFetch = input.fetchImpl ?? fetch;
  const hasWindow = typeof window !== 'undefined';
  try {
    const res = await doFetch(`${WAITLIST_ENDPOINT}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: input.email.trim(),
        list: WAITLIST_LIST,
        source: input.source,
        referrer: hasWindow ? document.referrer || undefined : undefined,
        utm: hasWindow ? readUtm(window.location.search) : {},
        website: input.website ?? '',
      }),
    });
    if (res.ok) return { ok: true };
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    if (res.status === 429 || data.error === 'rate_limited') return { ok: false, reason: 'rate_limited' };
    if (data.error === 'invalid_email') return { ok: false, reason: 'invalid_email' };
    return { ok: false, reason: 'server' };
  } catch {
    return { ok: false, reason: 'network' };
  }
}
