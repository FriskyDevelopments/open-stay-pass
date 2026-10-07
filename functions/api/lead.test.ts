import { describe, it, expect, vi } from 'vitest';
import { onRequest, toListsPayload, validateLeadBody } from './lead';

describe('validateLeadBody', () => {
  const valid = {
    name: 'Maria García',
    email: 'maria@example.com',
    organization: 'Hotel Sol',
    propertyCount: '2-5',
    interest: 'implementation',
    message: 'We want to set up QR arrival.',
    consent: true,
    hp: '',
  };

  it('accepts valid data', () => {
    expect(validateLeadBody(valid)).toEqual({ ok: true });
  });

  it('rejects honeypot filled', () => {
    expect(validateLeadBody({ ...valid, hp: 'spam' })).toEqual({ ok: false, reason: 'bot' });
  });

  it('rejects missing name', () => {
    const { name: _, ...rest } = valid;
    expect(validateLeadBody(rest as any)).toMatchObject({ ok: false });
  });

  it('rejects invalid email', () => {
    expect(validateLeadBody({ ...valid, email: 'notanemail' })).toMatchObject({ ok: false });
  });

  it('rejects invalid interest', () => {
    expect(validateLeadBody({ ...valid, interest: 'hacking' })).toMatchObject({ ok: false });
  });

  it('rejects missing consent', () => {
    expect(validateLeadBody({ ...valid, consent: false })).toMatchObject({ ok: false });
  });

  it('rejects name too long', () => {
    expect(validateLeadBody({ ...valid, name: 'a'.repeat(101) })).toMatchObject({ ok: false });
  });

  it('rejects message too long', () => {
    expect(validateLeadBody({ ...valid, message: 'a'.repeat(2001) })).toMatchObject({ ok: false });
  });
});

describe('lead forwarding to frisky-lists', () => {
  const valid = {
    name: 'Maria García',
    email: 'maria@example.com',
    organization: 'Hotel Sol',
    propertyCount: '2-5',
    interest: 'implementation',
    message: 'We want to set up QR arrival.',
    consent: true,
    hp: '',
  };

  const call = async (body: unknown, workerStatus = 200) => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: workerStatus === 200 }), { status: workerStatus }));
    vi.stubGlobal('fetch', fetchMock);
    const request = new Request('https://staypass-gtm-preview.pages.dev/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.9', Origin: 'https://staypass-gtm-preview.pages.dev' },
      body: JSON.stringify(body),
    });
    const res = await onRequest({ request, env: {}, params: {} });
    vi.unstubAllGlobals();
    return { res, fetchMock };
  };

  it('shapes the payload for the staypass waitlist', () => {
    const p = toListsPayload(valid, 'https://staypass.dev/pricing');
    expect(p).toMatchObject({ email: 'maria@example.com', list: 'staypass-waitlist', source: 'contact', referrer: 'https://staypass.dev/pricing' });
    expect(p.meta).toMatchObject({ form: 'contact', name: 'Maria García', interest: 'implementation', consent: true });
  });

  it('forwards valid leads to the worker with the visitor ip and returns 200 (no more 503)', async () => {
    const { res, fetchMock } = await call(valid);
    expect(res.status).toBe(200);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://frisky-lists.hrgrrtks2p.workers.dev/subscribe');
    expect(init.headers['X-Frisky-Client-IP']).toBe('203.0.113.9');
    expect(JSON.parse(init.body).list).toBe('staypass-waitlist');
  });

  it('passes rate limiting through and hides upstream failures', async () => {
    expect((await call(valid, 429)).res.status).toBe(429);
    expect((await call(valid, 500)).res.status).toBe(502);
  });

  it('answers honeypot hits with a quiet 200 and never calls the worker', async () => {
    const { res, fetchMock } = await call({ ...valid, hp: 'spam' });
    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects invalid input without calling the worker', async () => {
    const { res, fetchMock } = await call({ ...valid, email: 'nope' });
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
