import React from 'react';
export function PassCard({ passId = 'PASS 09-472', state = 'valid', expires = 'expires 18:00', holo = true, children, style }) {
  const stateColors = { valid: 'var(--osp-state-valid)', expiring: 'var(--osp-state-expiring)', revoked: 'var(--osp-state-revoked)' };
  return React.createElement('div', { style: { background: 'var(--osp-ink)', border: '1px solid var(--osp-hairline)', width: 260, fontFamily: 'var(--osp-font-sans)', ...style } },
    holo && React.createElement('div', { style: { height: 6, background: 'var(--osp-tornasol)' } }),
    React.createElement('div', { style: { padding: 20, display: 'flex', flexDirection: 'column', gap: 12 } },
      React.createElement('svg', { viewBox: '0 0 64 64', fill: 'none', style: { width: 44, height: 44 } },
        React.createElement('path', { d: 'M8 40 C 16 14, 30 16, 26 32 C 24 40, 34 36, 42 32', stroke: 'var(--osp-beacon)', strokeWidth: 4 }),
        React.createElement('rect', { x: 46, y: 27, width: 6, height: 6, fill: 'var(--osp-beacon)' }),
        React.createElement('rect', { x: 54, y: 22, width: 5, height: 5, fill: 'var(--osp-beacon)' })),
      React.createElement('div', { style: { fontWeight: 700, fontSize: 16, color: 'var(--osp-text)' } }, passId),
      React.createElement('div', { style: { fontSize: 12, color: stateColors[state] || 'var(--osp-trace)', letterSpacing: '0.04em' } }, state + ' · ' + expires),
      children));
}
