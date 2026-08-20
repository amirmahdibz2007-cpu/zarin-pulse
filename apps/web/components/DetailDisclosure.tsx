import { copy } from '@zarinpulse/contracts';

export function DetailDisclosure(props: { technicalFa: string }) {
  return (
    <details className="mt-2">
      <summary className="flex min-h-11 cursor-pointer items-center text-xs text-[color:var(--zp-muted)]">
        {copy.detailsToggle}
      </summary>
      <p className="mt-2 text-xs leading-6 text-[color:var(--zp-muted)]">{props.technicalFa}</p>
    </details>
  );
}
