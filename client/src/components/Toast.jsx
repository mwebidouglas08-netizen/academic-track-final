import { useState, useEffect, useCallback } from 'react';

let _setToast = null;

export function showToast(msg, type = 'info') {
  if (_setToast) _setToast({ msg, type, id: Date.now() });
}

export default function Toast() {
  const [toast, setToast] = useState(null);
  _setToast = setToast;

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!toast) return null;
  return (
    <div className={`toast ${toast.type}`} style={{ zIndex: 9999 }}>
      {toast.type === 'success' && '✓ '}
      {toast.type === 'error' && '✕ '}
      {toast.msg}
    </div>
  );
}
