import { HomeDash } from '../../components/HomeDash';
import { MixPreviewLock } from '../../components/MixPreviewLock';
import { copy } from '@zarinpulse/contracts';

export const metadata = {
  robots: { index: false, follow: false },
};

export default function MixPreviewPage() {
  return (
    <>
      <MixPreviewLock />
      <p className="page-kicker px-4 lg:px-8">{copy.preview.hint}</p>
      <HomeDash />
    </>
  );
}
