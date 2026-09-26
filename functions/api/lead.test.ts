import { describe, it, expect } from 'vitest';
import { validateLeadBody } from './lead';

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
