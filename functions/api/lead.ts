export interface Env {
  LEAD_WEBHOOK_URL?: string;
}

type PagesFunction<Env = Record<string, unknown>> = (
  context: { request: Request; env: Env; params: Record<string, string> }
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

const corsHeaders = (request: Request) => {
  const origin = request.headers.get('Origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
};

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, reason: 'method_not_allowed' }), {
      status: 405,
      headers: corsHeaders(request),
    });
  }

  if (!env.LEAD_WEBHOOK_URL) {
    return new Response(JSON.stringify({ ok: false, reason: 'not_configured' }), {
      status: 503,
      headers: corsHeaders(request),
    });
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, reason: 'invalid_json' }), {
      status: 400,
      headers: corsHeaders(request),
    });
  }

  const validation = validateLeadBody(body);
  if (!validation.ok) {
    return new Response(JSON.stringify(validation), {
      status: 400,
      headers: corsHeaders(request),
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    // Log non-PII
    console.log(JSON.stringify({
      event: 'lead_received',
      interest: body.interest,
      propertyCount: body.propertyCount,
      timestamp: new Date().toISOString()
    }));

    const response = await fetch(env.LEAD_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Webhook failed with status ${response.status}`);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: corsHeaders(request),
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ ok: false, reason: 'webhook_error' }), {
      status: 502,
      headers: corsHeaders(request),
    });
  }
};
