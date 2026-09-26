/**
 * Per-route metadata for SEO. Sets document title, description, canonical URL, and hreflang.
 * Uses VITE_SITE_URL (default: https://staypass.dev).
 */

export interface RouteMeta {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
}

const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined) || 'https://staypass.dev';
const DEFAULT_OG = `${SITE_URL}/og/default.png`;

export const ROUTE_META: Record<string, RouteMeta> = {
  '/': {
    title: 'Open Stay Pass — Signed hospitality credential',
    description: 'One signed, revocable link powers QR, NDEF NFC, a bilingual HostCasa arrival guide, and Folios proof handoff. Self-hostable, MIT licensed.',
    path: '/',
    ogImage: DEFAULT_OG,
  },
  '/pricing': {
    title: 'Pricing — Open Stay Pass',
    description: 'Open-source core is free (MIT). Implementation, managed hosting, Wallet operations, verified connectors, AI continuity, and smart-lock design services are available on request.',
    path: '/pricing',
    ogImage: `${SITE_URL}/og/pricing.png`,
  },
  '/demo': {
    title: 'Interactive demo — Open Stay Pass',
    description: 'Step through the full credential lifecycle: create a stay, generate QR and NDEF URL, preview guest arrival, watch Folios handoff states, revoke. Simulated data, no credentials issued.',
    path: '/demo',
    ogImage: `${SITE_URL}/og/demo.png`,
  },
  '/start': {
    title: 'Get started — Open Stay Pass',
    description: 'Self-host Open Stay Pass in minutes, or work with the team for a managed implementation. MIT licensed, pnpm validate to verify.',
    path: '/start',
  },
  '/contact': {
    title: 'Contact — Open Stay Pass',
    description: 'Inquire about implementation sprints, managed hosting, Wallet operations, verified connectors, AI continuity, or smart-lock design services.',
    path: '/contact',
  },
  '/privacy': {
    title: 'Privacy — Open Stay Pass',
    description: 'Plain-language privacy policy for the Open Stay Pass product site.',
    path: '/privacy',
  },
  '/terms': {
    title: 'Terms — Open Stay Pass',
    description: 'Terms of use for the Open Stay Pass product site.',
    path: '/terms',
  },
  '/security': {
    title: 'Security — Open Stay Pass',
    description: 'Security boundary and responsible disclosure policy for Open Stay Pass.',
    path: '/security',
  },
  '/license': {
    title: 'License — Open Stay Pass',
    description: 'Open Stay Pass is MIT licensed. Read the full license text.',
    path: '/license',
  },
};

export function applyRouteMeta(path: string): void {
  const meta = ROUTE_META[path] || ROUTE_META['/'];
  const siteUrl = SITE_URL;
  const canonicalUrl = `${siteUrl}${meta.path}`;

  document.title = meta.title;

  setMeta('name', 'description', meta.description);
  setMeta('property', 'og:title', meta.title);
  setMeta('property', 'og:description', meta.description);
  setMeta('property', 'og:url', canonicalUrl);
  if (meta.ogImage) {
    setMeta('property', 'og:image', meta.ogImage);
    setMeta('name', 'twitter:image', meta.ogImage);
  }
  setMeta('name', 'twitter:title', meta.title);
  setMeta('name', 'twitter:description', meta.description);

  setLink('canonical', canonicalUrl);
  setHreflang('en', `${siteUrl}${meta.path}`);
  setHreflang('es', `${siteUrl}${meta.path}`);
  setHreflang('x-default', `${siteUrl}${meta.path}`);
}

function setMeta(attr: 'name' | 'property', key: string, value: string): void {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function setLink(rel: string, href: string): void {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function setHreflang(lang: string, href: string): void {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${lang}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = 'alternate';
    el.setAttribute('hreflang', lang);
    document.head.appendChild(el);
  }
  el.href = href;
}
