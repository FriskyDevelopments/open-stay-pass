import React from 'react';
export function Input({ label, value, onChange, placeholder, meta, type = 'text', style }) {
  return React.createElement('label', { style: { display: 'flex', flexDirection: 'column', gap: 6, fontFamily: 'var(--osp-font-sans)', ...style } },
    label && React.createElement('span', { style: { font: 'var(--osp-text-label)', letterSpacing: 'var(--osp-tracking-label)', color: 'var(--osp-text)' } }, label),
    React.createElement('input', { type, value, placeholder, onChange,
      style: { background: 'var(--osp-surface-raised)', border: '1px solid var(--osp-hairline)', color: 'var(--osp-text)',
        padding: '11px 14px', fontSize: 15, fontFamily: 'var(--osp-font-sans)', borderRadius: 'var(--osp-radius)', outline: 'none', minHeight: 20 } }),
    meta && React.createElement('span', { style: { font: 'var(--osp-text-meta)', color: 'var(--osp-trace)' } }, meta));
}
