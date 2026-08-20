export type MetricUnit = 'rial' | 'count' | 'ratio' | 'percent' | 'days';
export type MetricGrain = 'try' | 'session' | 'order' | 'customer' | 'merchant' | 'day';
export type CiMethod = 'wilson' | 'bootstrap' | 'none';

export interface MetricDefinition {
  id: string;
  version: string;
  titleFa: string;
  plainFa: string;
  technicalFa: string;
  unit: MetricUnit;
  grain: MetricGrain;
  numeratorFa: string;
  denominatorFa: string;
  minSample: number;
  conditionalOn: string;
  confounders: readonly string[];
  ciMethod: CiMethod;
  relativeOnly?: boolean;
}

export const METRICS = [
  {
    id: 'session_success_rate',
    version: '1.0.0',
    titleFa: 'نرخ پرداخت موفق',
    plainFa: 'از هر صد جلسه‌ای که مشتری برای پرداخت باز می‌کند، چند تا واقعاً تمام می‌شود.',
    technicalFa:
      'verified / sessions در دانه جلسه. بازه ویلسون ۹۵٪. جلسات NoAttempt در مخرج می‌مانند.',
    unit: 'ratio',
    grain: 'session',
    numeratorFa: 'جلسات با session_status = Verified',
    denominatorFa: 'همه جلسات یکتا',
    minSample: 100,
    conditionalOn: 'merchant sessions >= 100',
    confounders: ['category mix', 'amount band', 'PSP mix', 'low-coverage days'],
    ciMethod: 'wilson',
  },
  {
    id: 'no_attempt_rate',
    version: '1.0.0',
    titleFa: 'نرخ نرسیدن به بانک',
    plainFa: 'چند درصد مشتری‌ها اصلاً به صفحه بانک نمی‌رسند.',
    technicalFa: 'min_try_seq = 0 تقسیم بر تعداد جلسات. موفقیت تلاش با try_status سنجیده نمی‌شود.',
    unit: 'ratio',
    grain: 'session',
    numeratorFa: 'جلسات با min_try_seq = 0',
    denominatorFa: 'همه جلسات یکتا',
    minSample: 100,
    conditionalOn: 'merchant sessions >= 100',
    confounders: ['merchant configuration', 'test transactions in 1e3 band'],
    ciMethod: 'wilson',
  },
  {
    id: 'in_bank_abandon_rate',
    version: '1.0.0',
    titleFa: 'نرخ رهاکردن صفحه بانک',
    plainFa: 'چند درصد مشتری‌ها به بانک می‌روند ولی پرداخت را تمام نمی‌کنند.',
    technicalFa: 'وضعیت پایانی InBank تقسیم بر جلسات. جدا از Failed و NoAttempt.',
    unit: 'ratio',
    grain: 'session',
    numeratorFa: 'جلسات با terminal_state = InBank',
    denominatorFa: 'همه جلسات یکتا',
    minSample: 100,
    conditionalOn: 'merchant sessions >= 100',
    confounders: ['PSP mix', 'amount band', 'category'],
    ciMethod: 'wilson',
  },
  {
    id: 'technical_fail_rate',
    version: '1.0.0',
    titleFa: 'نرخ خطای فنی',
    plainFa: 'چند درصد پرداخت‌ها به‌خاطر خطای فنی می‌ایستند، نه به‌خاطر انصراف مشتری.',
    technicalFa: 'terminal_state = Failed. در کل پلتفرم حدود ۱٫۵٪ است.',
    unit: 'ratio',
    grain: 'session',
    numeratorFa: 'جلسات با terminal_state = Failed',
    denominatorFa: 'همه جلسات یکتا',
    minSample: 100,
    conditionalOn: 'merchant sessions >= 100',
    confounders: ['PSP', 'terminal configuration'],
    ciMethod: 'wilson',
  },
  {
    id: 'revenue_rial',
    version: '1.0.0',
    titleFa: 'درآمد ثبت‌شده',
    plainFa: 'جمع مبلغ سفارش‌هایی که پرداخت‌شان کامل شده.',
    technicalFa:
      'SUM(amount) روی جلسات Verified در دانه جلسه. جمع سطح ردیف ۳٫۷۷٪ بیش‌برآورد می‌سازد.',
    unit: 'rial',
    grain: 'order',
    numeratorFa: 'amount جلسات Verified',
    denominatorFa: '—',
    minSample: 1,
    conditionalOn: 'none',
    confounders: ['partial months', 'low-coverage days'],
    ciMethod: 'none',
  },
  {
    id: 'aov_rial',
    version: '1.0.0',
    titleFa: 'سبد خرید متوسط',
    plainFa: 'میانگین مبلغ یک سفارش موفق.',
    technicalFa: 'revenue_rial / verified_orders. اگر سفارشی نباشد به aov_basis برمی‌گردیم.',
    unit: 'rial',
    grain: 'order',
    numeratorFa: 'درآمد جلسات Verified',
    denominatorFa: 'تعداد جلسات Verified',
    minSample: 30,
    conditionalOn: 'verified_orders >= 30',
    confounders: ['price catalog', 'category'],
    ciMethod: 'bootstrap',
  },
  {
    id: 'paid_pending_rial',
    version: '1.0.0',
    titleFa: 'پول معلق',
    plainFa: 'پولی که از مشتری گرفته شده ولی هنوز تأیید ثبت نشده.',
    technicalFa: 'SUM(amount) روی terminal_state = Paid در دانه جلسه. ارز الف دفتر اثر.',
    unit: 'rial',
    grain: 'session',
    numeratorFa: 'amount جلسات Paid',
    denominatorFa: '—',
    minSample: 1,
    conditionalOn: 'none',
    confounders: ['verify callback health'],
    ciMethod: 'none',
  },
  {
    id: 'fee_effective_rate',
    version: '1.0.0',
    titleFa: 'نرخ مؤثر کارمزد',
    plainFa: 'چه سهمی از فروش موفق شما به‌عنوان کارمزد می‌نشیند. این عدد کارمزد واقعی زرین‌پال نیست.',
    technicalFa:
      'SUM(adjusted_fee)/SUM(amount) روی Verified. فقط مقایسه نسبی. relativeOnly=true.',
    unit: 'ratio',
    grain: 'order',
    numeratorFa: 'adjusted_fee جلسات Verified',
    denominatorFa: 'amount جلسات Verified',
    minSample: 50,
    conditionalOn: 'verified_orders >= 50',
    confounders: ['amount band floor', 'tariff', 'hidden coefficient'],
    ciMethod: 'bootstrap',
    relativeOnly: true,
  },
  {
    id: 'fee_tariff_effect',
    version: '1.0.0',
    titleFa: 'اثر تعرفه خالص',
    plainFa:
      'بعد از درنظرگرفتن اندازه سبد، کارمزد نسبی شما از انتظار هم‌مبلغ‌ها چقدر بیشتر یا کمتر است.',
    technicalFa:
      'actual_rate − Σ w(b)·r_ref(b) روی باندهای ثابت لگاریتمی. CI بوت‌استرپ بذردار.',
    unit: 'ratio',
    grain: 'order',
    numeratorFa: 'نرخ واقعی منهای نرخ انتظاری باند مبلغ',
    denominatorFa: '—',
    minSample: 200,
    conditionalOn: 'verified_orders >= 200',
    confounders: ['band occupancy', 'hidden coefficient'],
    ciMethod: 'bootstrap',
    relativeOnly: true,
  },
  {
    id: 'retry_hazard',
    version: '1.0.0',
    titleFa: 'شانس موفقیت در هر تلاش',
    plainFa: 'از کسانی که هنوز موفق نشده‌اند، در این شماره تلاش چند درصد موفق می‌شوند.',
    technicalFa:
      'h(k)=won(k)/at_risk(k). won فقط با try_status=Verified. verified_at برای برنده تلاش ممنوع است.',
    unit: 'ratio',
    grain: 'try',
    numeratorFa: 'تلاش‌های با try_status = Verified در شماره k',
    denominatorFa: 'تلاش‌های k جلساتی که تا k برنده نشده‌اند',
    minSample: 100,
    conditionalOn: 'at_risk >= 100',
    confounders: ['merchant retry policy'],
    ciMethod: 'wilson',
  },
  {
    id: 'peer_success_gap',
    version: '1.0.0',
    titleFa: 'شکاف با هم‌صنف‌ها',
    plainFa: 'نرخ موفق شما چقدر از سه‌چهارم هم‌صنف‌های هم‌سبد پایین‌تر است.',
    technicalFa:
      'p75(peer success) − own success. گروه همتا: همان صنف، دهک مبلغ میانه ±۲، حداقل ۵ همتا.',
    unit: 'ratio',
    grain: 'merchant',
    numeratorFa: 'اختلاف نرخ',
    denominatorFa: '—',
    minSample: 5,
    conditionalOn: 'peer_group_size >= 5 and sessions >= 100',
    confounders: ['volume (controlled via standardization, not matching)'],
    ciMethod: 'bootstrap',
  },
] as const satisfies readonly MetricDefinition[];

export type MetricId = (typeof METRICS)[number]['id'];

export function metricById(id: string): MetricDefinition | undefined {
  return METRICS.find((m) => m.id === id);
}

export function assertMetricId(id: string): MetricId {
  const found = METRICS.find((m) => m.id === id);
  if (!found) {
    throw new RangeError(`unknown metric id: ${id}`);
  }
  return found.id;
}
