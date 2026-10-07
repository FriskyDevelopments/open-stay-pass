import { describe, expect, it, vi } from 'vitest';
import { WAITLIST_ENDPOINT, isLikelyEmail, joinWaitlist, readUtm } from './waitlist';

const response = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('waitlist client', () => {
  it('validates emails loosely', () => {
    expect(isLikelyEmail(' host@example.com ')).toBe(true);
    expect(isLikelyEmail('nope')).toBe(false);
    expect(isLikelyEmail('a@b.c')).toBe(false);
  });

  it('reads utm params', () => {
    expect(readUtm('?utm_source=x&utm_campaign=launch&foo=1')).toEqual({ source: 'x', campaign: 'launch' });
  });

  it('posts to the worker with the staypass list', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response(200, { ok: true, confirm: false }));
    const result = await joinWaitlist({ email: 'Host@Example.com ', source: 'landing', fetchImpl });
    expect(result).toEqual({ ok: true });
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe(`${WAITLIST_ENDPOINT}/subscribe`);
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({ email: 'Host@Example.com', list: 'staypass-waitlist', source: 'landing', website: '' });
  });

  it('maps worker errors', async () => {
    expect(await joinWaitlist({ email: 'a@example.com', source: 's', fetchImpl: vi.fn().mockResolvedValue(response(429, { error: 'rate_limited' })) }))
      .toEqual({ ok: false, reason: 'rate_limited' });
    expect(await joinWaitlist({ email: 'a@example.com', source: 's', fetchImpl: vi.fn().mockResolvedValue(response(400, { error: 'invalid_email' })) }))
      .toEqual({ ok: false, reason: 'invalid_email' });
    expect(await joinWaitlist({ email: 'a@example.com', source: 's', fetchImpl: vi.fn().mockResolvedValue(response(500, {})) }))
      .toEqual({ ok: false, reason: 'server' });
    expect(await joinWaitlist({ email: 'a@example.com', source: 's', fetchImpl: vi.fn().mockRejectedValue(new Error('offline')) }))
      .toEqual({ ok: false, reason: 'network' });
  });
});
