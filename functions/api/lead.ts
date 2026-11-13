export interface Env {
  /** frisky-lists Worker base URL (defaults to the shared workers.dev deployment). */
  LISTS_ENDPOINT?: string;
  /** Optional: also mirror each lead to this webhook (best effort). */
  LEAD_WEBHOOK_URL?: string;
}

type PagesFunction<Env = Record<string, unknown>> = (
  context: { request: Request; env: Env; params: Record<string, string>; waitUntil?: (p: Promise<unknown>) => void }
) => Response | Promise<Response>;

export function validateLeadBody(body: any): { ok: true } | { ok: false; reason?: string } {
  if (typeof body !== 'object' || body === null) return { ok: false };
  
  if (body.hp !== undefined && body.hp !== '') return { ok: false, reason: 'bot' };

  if (typeof body.name !== 'string' || body.name.length < 1 || body.name.length > 100) return { ok: false };
  if (typeof body.email !== 'string' || body.email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return { ok: false };
  
  if (body.organization !== undefined && (typeof body.organization !== 'string' || body.organization.length > 200)) return { ok: false };

  const validPropertyCounts = ['1', '2-5', '6-20', '20+'];
  if (!validPropertyCounts.includes(body.propertyCount)) return { ok: false };

  const validInterests = ['implementation', 'managed', 'wallet', 'connector', 'ai', 'smartlock', 'general'];
  if (!validInterests.includes(body.interest)) return { ok: false };

  if (body.message !== undefined && (typeof body.message !== 'string' || body.message.length > 2000)) return { ok: false };

  if (body.consent !== true) return { ok: false };

  return { ok: true };
}

const DEFAULT_LISTS_ENDPOINT = 'https://frisky-lists.hrgrrtks2p.workers.dev';

const jsonHeaders = (request: Request): Record<string, string> => {
  const h: Record<string, string> = { 'Content-Type': 'application/json', Vary: 'Origin' };
  const origin = request.headers.get('Origin');
  // The contact form is same-origin; never open this endpoint to other sites.
  if (origin && origin === new URL(request.url).origin) {
    h['Access-Control-Allow-Origin'] = origin;
    h['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    h['Access-Control-Allow-Headers'] = 'Content-Type';
  }
  return h;
};

const reply = (request: Request, status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: jsonHeaders(request) });

/** Shape the contact form into a frisky-lists /subscribe payload (list=staypass-waitlist, source=contact). */
export function toListsPayload(body: any, referrer: string | null) {
  return {
    email: String(body.email).trim(),
    list: 'staypass-waitlist',
    source: 'contact',
    referrer: referrer ?? undefined,
    hp: '',
    meta: {
      form: 'contact',
      name: body.name,
      organization: body.organization || undefined,
      propertyCount: body.propertyCount,
      interest: body.interest,
      message: body.message || undefined,
      consent: true,
      consentAt: new Date().toISOString(),
    },
  };
}

export const onRequest: PagesFunction<Env> = async ({ request, env, waitUntil }) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: jsonHeaders(request) });
  }

  if (request.method !== 'POST') {
    return reply(request, 405, { ok: false, reason: 'method_not_allowed' });
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return reply(request, 400, { ok: false, reason: 'invalid_json' });
  }

  const validation = validateLeadBody(body);
  if (!validation.ok) {
    // Honeypot hits get a quiet success so bots learn nothing.
    if (validation.reason === 'bot') return reply(request, 200, { ok: true });
    return reply(request, 400, validation);
  }

  const endpoint = (env.LISTS_ENDPOINT || DEFAULT_LISTS_ENDPOINT).replace(/\/+$/, '');
  const visitorIp = request.headers.get('CF-Connecting-IP');

  try {
    // Log non-PII
    console.log(JSON.stringify({
      event: 'lead_received',
      interest: body.interest,
      propertyCount: body.propertyCount,
      timestamp: new Date().toISOString()
    }));

    const response = await fetch(`${endpoint}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(visitorIp ? { 'X-Frisky-Client-IP': visitorIp } : {}),
      },
      body: JSON.stringify(toListsPayload(body, request.headers.get('Referer'))),
      signal: AbortSignal.timeout(5000),
    });

    if (response.status === 429) return reply(request, 429, { ok: false, reason: 'rate_limited' });
    if (response.status === 400) return reply(request, 400, { ok: false, reason: 'invalid' });
    if (!response.ok) throw new Error(`frisky-lists responded ${response.status}`);

    // Optional mirror to a team webhook (e.g. chat alert). Best effort, never blocks the visitor.
    if (env.LEAD_WEBHOOK_URL) {
      waitUntil?.(
        fetch(env.LEAD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(5000),
        }).then(() => undefined, (err) => console.error('Lead webhook mirror failed:', String(err))),
      );
    }

    return reply(request, 200, { ok: true });
  } catch (error) {
    console.error('Lead forward error:', String(error));
    return reply(request, 502, { ok: false, reason: 'upstream_error' });
  }
};
