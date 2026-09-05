import React from 'react';
export function Button({ variant = 'primary', size = 'md', disabled, children, onClick, style }) {
  const pad = size === 'sm' ? '8px 14px' : size === 'lg' ? '14px 28px' : '11px 20px';
  const fs = size === 'sm' ? 14 : size === 'lg' ? 17 : 15;
  const base = {
    fontFamily: 'var(--osp-font-sans)', fontWeight: 700, fontSize: fs, letterSpacing: '0.01em',
    padding: pad, borderRadius: 'var(--osp-radius)', cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1, minHeight: size === 'sm' ? 36 : 'var(--osp-touch-min)',
    display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'filter 120ms, background 120ms',
  };
  const variants = {
    primary: { background: 'var(--osp-beacon)', color: 'var(--osp-ink)', border: '1px solid var(--osp-beacon)' },
    secondary: { background: 'transparent', color: 'var(--osp-beacon)', border: '1px solid var(--osp-beacon)' },
    ghost: { background: 'transparent', color: 'var(--osp-text)', border: '1px solid var(--osp-hairline)' },
    danger: { background: 'transparent', color: 'var(--osp-state-revoked)', border: '1px solid var(--osp-state-revoked)' },
  };
  const [hover, setHover] = React.useState(false);
  const hoverFx = hover && !disabled ? { filter: 'brightness(1.15)' } : {};
  return React.createElement('button', {
    onClick: disabled ? undefined : onClick, disabled,
    onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false),
    style: { ...base, ...variants[variant], ...hoverFx, ...style },
  }, children);
}
