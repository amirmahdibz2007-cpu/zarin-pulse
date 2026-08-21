import { copy } from '@zarinpulse/contracts';

const LAYERS = [
  { id: 'raw', title: copy.codeMap.layers.rawTitle, body: copy.codeMap.layers.rawBody, path: 'data/' },
  {
    id: 'etl',
    title: copy.codeMap.layers.etlTitle,
    body: copy.codeMap.layers.etlBody,
    path: 'packages/etl',
  },
  {
    id: 'analytics',
    title: copy.codeMap.layers.analyticsTitle,
    body: copy.codeMap.layers.analyticsBody,
    path: 'packages/analytics · contracts',
  },
  {
    id: 'artifacts',
    title: copy.codeMap.layers.artifactsTitle,
    body: copy.codeMap.layers.artifactsBody,
    path: 'public/artifacts',
  },
  {
    id: 'web',
    title: copy.codeMap.layers.webTitle,
    body: copy.codeMap.layers.webBody,
    path: 'apps/web',
  },
] as const;

export function JudgeCodeMap() {
  return (
    <section className="code-map" aria-label={copy.codeMap.title}>
      <header className="code-map-head">
        <p className="code-map-kicker">{copy.nav.judge}</p>
        <h2 className="code-map-title">{copy.codeMap.title}</h2>
        <p className="code-map-lede">{copy.codeMap.lede}</p>
      </header>
      <ol className="code-map-rail">
        {LAYERS.map((layer, index) => (
          <li key={layer.id} className="code-map-node" style={{ ['--i' as string]: String(index) }}>
            <div className="code-map-index" aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </div>
            <div className="code-map-card">
              <p className="code-map-card-title">{layer.title}</p>
              <p className="code-map-card-body">{layer.body}</p>
              <p className="code-map-path">{layer.path}</p>
            </div>
            {index < LAYERS.length - 1 ? <span className="code-map-arrow" aria-hidden="true" /> : null}
          </li>
        ))}
      </ol>
      <p className="code-map-note">{copy.codeMap.note}</p>
    </section>
  );
}
