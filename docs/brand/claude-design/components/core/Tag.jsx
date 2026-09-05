import React from 'react';
export function Tag({ state = 'neutral', children }) {
  const colors = {
    valid: 'var(--osp-state-valid)', expiring: 'var(--osp-state-expiring)',
    revoked: 'var(--osp-state-revoked)', accent: 'var(--osp-beacon)', neutral: 'var(--osp-trace)',
  };
  const c = colors[state] || colors.neutral;
  return React.createElement('span', { style: {
    fontFamily: 'var(--osp-font-sans)', fontWeight: 500, fontSize: 13, letterSpacing: '0.04em',
    color: c, border: '1px solid ' + c, padding: '3px 10px', display: 'inline-flex', alignItems: 'center', gap: 6,
  } }, children);
}
