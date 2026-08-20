'use client';

import { copy } from '@zarinpulse/contracts';
import { useState } from 'react';

export function CopyBriefButton(props: { text: string }) {
  const [state, setState] = useState<'idle' | 'ok' | 'err'>('idle');

  return (
    <button
      type="button"
      className="control-neuro inline-flex min-h-11 items-center px-4"
      onClick={() => {
        void (async () => {
          try {
            if (!navigator.clipboard?.writeText) {
              setState('err');
              return;
            }
            await navigator.clipboard.writeText(props.text);
            setState('ok');
          } catch {
            setState('err');
          }
        })();
      }}
    >
      {state === 'ok'
        ? copy.actionBrief.copied
        : state === 'err'
          ? copy.actionBrief.copyFailed
          : copy.actionBrief.copy}
    </button>
  );
}
