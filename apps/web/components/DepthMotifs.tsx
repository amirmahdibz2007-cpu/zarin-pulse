'use client';

import { copy } from '@zarinpulse/contracts';
import { useInViewOnce } from '../lib/use-in-view';

export function RecoverableLayers(props: { caption: string }) {
  const { ref, active } = useInViewOnce<HTMLDivElement>(0.35);
  return (
    <div
      ref={ref}
      className={active ? 'depth-stack depth-stack-live' : 'depth-stack'}
      aria-hidden="true"
    >
      <span className="depth-layer depth-layer-a" />
      <span className="depth-layer depth-layer-b" />
      <span className="depth-layer depth-layer-c" />
      <p className="vision-cap depth-stack-cap">{props.caption}</p>
    </div>
  );
}

export function GatewayFlipPlate(props: { unhealthy: boolean }) {
  const { ref, active } = useInViewOnce<HTMLDivElement>(0.4);
  return (
    <div
      ref={ref}
      className={
        active
          ? props.unhealthy
            ? 'depth-flip depth-flip-live depth-flip-warn'
            : 'depth-flip depth-flip-live'
          : 'depth-flip'
      }
      aria-hidden="true"
    >
      <div className="depth-flip-inner">
        <span className="depth-flip-face depth-flip-ok">
          <span>{copy.lab.visionHealthOk}</span>
        </span>
        <span className="depth-flip-face depth-flip-bad">
          <span>{copy.lab.visionHealthBad}</span>
        </span>
      </div>
    </div>
  );
}
