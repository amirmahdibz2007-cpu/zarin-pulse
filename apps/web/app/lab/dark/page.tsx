import { copy } from '@zarinpulse/contracts';
import { HomeDash } from '../../../components/HomeDash';
import { LabDarkHost } from '../../../components/LabDarkHost';

export const metadata = {
  robots: { index: false, follow: false },
};

export default function LabDarkPage() {
  return (
    <LabDarkHost>
      <div className="space-y-2 px-4 pt-2 lg:px-8">
        <p className="page-kicker">{copy.version.one}</p>
        <h1 className="text-2xl font-bold leading-9">{copy.lab.darkTitle}</h1>
        <p className="max-w-3xl text-sm leading-7 text-[color:var(--zp-muted)]">{copy.lab.darkLede}</p>
      </div>
      <HomeDash />
    </LabDarkHost>
  );
}
