import { copy } from '@zarinpulse/contracts';
import Link from 'next/link';
import { ChatBox } from '../../components/ChatBox';
import { PageHeader, PageShell } from '../../components/PageShell';

export default function AskPage() {
  return (
    <PageShell>
      <PageHeader title={copy.askTitle} lede={copy.demoMode} />
      <p className="ops-block-hint mb-4">
        {copy.efficacy.askPreferAi}{' '}
        <Link className="ops-ladder-link" href="/ai">
          {copy.nav.ai}
        </Link>
      </p>
      <div className="chart-card">
        <ChatBox />
      </div>
    </PageShell>
  );
}
