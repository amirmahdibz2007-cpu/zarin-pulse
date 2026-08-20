'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { copy } from '@zarinpulse/contracts';
import { allNav } from '../lib/nav';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [merchants, setMerchants] = useState<{ key: string }[]>([]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((v) => !v);
      }
      if (event.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!open || merchants.length > 0) return;
    fetch('/artifacts/merchants-index.json')
      .then((res) => (res.ok ? res.json() : []))
      .then((rows: { key: string }[]) => setMerchants(rows.slice(0, 343)))
      .catch(() => setMerchants([]));
  }, [open, merchants.length]);

  const hits = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const pages = allNav.filter((r) => r.label.includes(q) || r.href.includes(needle));
    const ms = merchants
      .filter((m) => m.key.toLowerCase().includes(needle))
      .slice(0, 8)
      .map((m) => ({ href: `/m/${m.key}`, label: m.key }));
    return [...pages, ...ms];
  }, [q, merchants]);

  return (
    <>
      <button
        type="button"
        className="control-neuro inline-flex min-h-11 min-w-11 items-center justify-center px-3 text-sm"
        onClick={() => setOpen(true)}
      >
        {copy.searchOpen}
      </button>
      {open ? (
        <div className="overlay-scrim z-50 p-4" onClick={() => setOpen(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={copy.searchPlaceholder}
              className="control-neuro min-h-11 w-full px-3"
            />
            <ul className="mt-3 max-h-80 overflow-auto">
              {hits.map((hit) => (
                <li key={hit.href}>
                  <Link
                    href={hit.href}
                    className="flex min-h-11 items-center rounded-lg px-2"
                    onClick={() => setOpen(false)}
                  >
                    {hit.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
