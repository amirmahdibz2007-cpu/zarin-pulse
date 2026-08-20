import Link from 'next/link';
import { copy } from '@zarinpulse/contracts';

export function EvidenceLink(props: { passportId: string }) {
  return (
    <Link
      href={`/passport/${encodeURIComponent(props.passportId)}`}
      className="link-quiet inline-flex min-h-11 items-center text-xs"
    >
      {copy.passportOpen}
    </Link>
  );
}
