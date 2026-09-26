// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the env vars before import
beforeEach(() => {
  vi.stubEnv('VITE_ANALYTICS_ENDPOINT', '');
  vi.stubEnv('VITE_ANALYTICS_WEBSITE_ID', '');
});

describe('track() no-op when analytics unconfigured', () => {
  it('does not throw when umami is absent', async () => {
    // Dynamic import so env vars are evaluated after stub
    const { track } = await import('./analytics');
    expect(() => track('demo_start')).not.toThrow();
  });

  it('does not throw when umami is present', async () => {
    const { track } = await import('./analytics');
    const mockTrack = vi.fn();
    // In jsdom environment, window is defined
    if (typeof window !== 'undefined') {
      (window as unknown as Record<string, unknown>).umami = { track: mockTrack };
    }
    // With no endpoint configured, track should still no-op
    expect(() => track('pricing_view')).not.toThrow();
  });
});


describe('routeMeta', () => {
  it('has entries for all main routes', async () => {
    const { ROUTE_META } = await import('./routeMeta');
    for (const route of ['/', '/pricing', '/demo', '/start', '/contact', '/privacy', '/terms', '/security', '/license']) {
      expect(ROUTE_META[route]).toBeDefined();
      expect(ROUTE_META[route].title.length).toBeGreaterThan(5);
      expect(ROUTE_META[route].description.length).toBeGreaterThan(10);
    }
  });
});
