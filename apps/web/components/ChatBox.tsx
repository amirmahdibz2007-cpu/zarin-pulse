'use client';

import { useState } from 'react';
import { copy } from '@zarinpulse/contracts';

type Msg = { role: 'user' | 'assistant'; text: string; demo?: boolean };

export function ChatBox() {
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [pending, setPending] = useState(false);

  async function send() {
    const text = input.trim();
    if (!text || pending) return;
    setInput('');
    setMsgs((m) => [...m, { role: 'user', text }]);
    setPending(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const body = (await res.json()) as { text: string; demo?: boolean; errorId?: string };
      if (!res.ok) {
        setMsgs((m) => [
          ...m,
          { role: 'assistant', text: `${copy.errorGeneric} ${body.errorId ?? 'chat'}` },
        ]);
        return;
      }
      const next: Msg = { role: 'assistant', text: body.text };
      if (body.demo) next.demo = true;
      setMsgs((m) => [...m, next]);
    } catch {
      setMsgs((m) => [...m, { role: 'assistant', text: `${copy.errorGeneric} chat-network` }]);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="space-y-2">
        {msgs.map((m, i) => (
          <li key={`${m.role}-${String(i)}`} className="surface-panel text-sm leading-7">
            {m.demo ? (
              <p className="mb-2 text-xs text-[color:var(--zp-warning)]">{copy.demoMode}</p>
            ) : null}
            {m.text}
          </li>
        ))}
      </ul>
      <textarea className="control-neuro min-h-24 p-3" value={input} onChange={(e) => setInput(e.target.value)} />
      <button
        type="button"
        className="control-neuro min-h-11 px-4"
        onClick={() => void send()}
        disabled={pending}
      >
        {copy.send}
      </button>
    </div>
  );
}
