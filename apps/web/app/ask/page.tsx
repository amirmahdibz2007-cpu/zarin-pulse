import { copy } from '@zarinpulse/contracts';
import { ChatBox } from '../../components/ChatBox';
import { PageHeader, PageShell } from '../../components/PageShell';

export default function AskPage() {
  return (
    <PageShell>
      <PageHeader title={copy.askTitle} lede={copy.demoMode} />
      <div className="chart-card">
        <ChatBox />
      </div>
    </PageShell>
  );
}
