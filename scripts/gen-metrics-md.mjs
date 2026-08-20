import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { METRICS } from '../packages/contracts/src/metrics/registry.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'docs', 'metrics.md');

const lines = [
  '# رجیستری متریک',
  '',
  'تولیدشده از `packages/contracts/src/metrics/registry.ts`. دست‌کاری مستقیم نکنید.',
  '',
];

for (const metric of METRICS) {
  lines.push(`## \`${metric.id}\` (v${metric.version})`);
  lines.push('');
  lines.push(`- **عنوان:** ${metric.titleFa}`);
  lines.push(`- **زبان ساده:** ${metric.plainFa}`);
  lines.push(`- **جزئیات فنی:** ${metric.technicalFa}`);
  lines.push(`- **واحد:** ${metric.unit} · **دانه:** ${metric.grain} · **CI:** ${metric.ciMethod}`);
  lines.push(`- **صورت:** ${metric.numeratorFa}`);
  lines.push(`- **مخرج:** ${metric.denominatorFa}`);
  lines.push(`- **حداقل نمونه:** ${String(metric.minSample)}`);
  lines.push(`- **شرط:** ${metric.conditionalOn}`);
  lines.push(`- **مخدوش‌کننده‌ها:** ${metric.confounders.join('؛ ')}`);
  if (metric.relativeOnly === true) {
    lines.push('- **فقط نسبی:** بله — `adjusted_fee` کارمزد واقعی نیست.');
  }
  lines.push('');
}

fs.writeFileSync(out, `${lines.join('\n')}\n`, 'utf8');
console.log(`wrote ${out} (${String(METRICS.length)} metrics)`);
