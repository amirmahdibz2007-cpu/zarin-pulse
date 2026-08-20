'use client';

import Link from 'next/link';
import { useState } from 'react';
import { copy } from '@zarinpulse/contracts';
import { extraNav } from '../lib/nav';

export function MoreSheet() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="nav-bottom-link w-full"
        data-active={open ? 'true' : 'false'}
        onClick={() => setOpen(true)}
      >
        {copy.nav.more}
      </button>
      {open ? (
        <div className="overlay-scrim" onClick={() => setOpen(false)}>
          <div className="sheet-panel" onClick={(e) => e.stopPropagation()}>
            <p className="mb-3 text-lg font-bold">{copy.moreTitle}</p>
            <ul className="grid grid-cols-2 gap-2">
              {extraNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="control-neuro flex min-h-11 items-center px-3"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
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
