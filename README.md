# زرین‌پالس (ZarinPulse)

محصول تحلیلی برای پذیرنده زرین‌پال: کجا پرداخت رها می‌شود، چقدر فروش قابل بازیابی است، و کارمزد نسبی از کجا می‌آید. اعداد از دیتاست چالش مشتق می‌شوند و هر عدد یک گذرنامه شواهد دارد.

واحد پول تمام مبالغ **ریال** است. ستون `adjusted_fee` کارمزد واقعی زرین‌پال نیست.

## اجرای داور

### مسیر ۱ — بدون نصب

لینک زنده روی این ماشین: [http://localhost:3000](http://localhost:3000)

میان‌بر داور: [http://localhost:3000/judge](http://localhost:3000/judge)

تم پیش‌فرض کرم است. خانه: [http://localhost:3000](http://localhost:3000)

آزمایشگاه حرکت/نمودار (محصول اصلی دست‌نخورده): [http://localhost:3000/lab/charts](http://localhost:3000/lab/charts)

نسخهٔ قفل‌شدهٔ پسندیده‌شده: **زرین پالس ۱** (`git tag zarinpulse-1`). برگشت:

```bash
npm run restore:v1
```

تونل‌های loca.lt در این محیط بعد از یکی دو دقیقه `408` می‌دهند و قابل اتکا نیستند. برای دامنه عمومی پایدار از `Dockerfile` / `vercel.json` / `liara.json` با توکن میزبان استفاده کنید.

روی گوشی (وقتی دامنه عمومی وصل شد): منوی مرورگر → افزودن به صفحه اصلی.

### مسیر ۲ — اجرای محلی (حدود دو دقیقه)

نیاز: Node.js 22 یا جدیدتر (`.nvmrc`). Python، Docker و پایگاه‌داده لازم نیست.

```bash
git clone <repo>
cd zarinpulse
npm install
npm run dev
```

باز کنید: `http://localhost:3000`

نسخه تولیدی:

```bash
npm run build
npm start
```

بدون `OPENAI_API_KEY` همه چیز به‌جز چت زنده کار می‌کند؛ چت وارد حالت دمو با برچسب می‌شود.

### مسیر ۳ — بازتولید داده از CSV خام (اختیاری)

```bash
npm run data:build
npm run data:verify
```

این مسیر به `@duckdb/node-api` نیاز دارد. اپ از artifact کامیت‌شده بدون DuckDB اجرا می‌شود.

## راستی‌آزمایی

```bash
npm run verify
```

شامل: ممنوعیت دستور پوسته‌ای در `scripts`، ممنوعیت مسیر فایل هاردکد، ممنوعیت نشت فارسی در UI، PWA، typecheck، ESLint، Vitest.

CI روی `ubuntu-latest` و `windows-latest`.

## دیپلوی

- Vercel: ریشه مونوریپو، `npm run build`
- لیارا / ابرآروان: `Dockerfile` یا `liara.json` با `npm ci && npm run build` سپس `npm start`
- متغیر محیطی اجباری نیست

## ماتریس امتیاز (چالش زرین‌پال)

| معیار | امتیاز | کجا دیده می‌شود |
| --- | --- | --- |
| اقدام‌پذیری و بدیع‌بودن بینش | ۹۰ | `/health`، `/m/M91`، `/m/M282`، `/m/M31`، `/fees` |
| صحت و ردیابی‌پذیری | ۷۵ | Passport، `/reconciliation`، `docs/data-constitution.md` |
| عمق تحلیلی | ۶۰ | `/methodology`، فرضیه‌های ردشده، سیمپسون `/psp`، تجزیه کارمزد |
| UX غیرتکنیکال | ۴۵ | زبان دولایه، موبایل‌اول، کارت به‌جای جدول خام |
| کیفیت فنی و اجراپذیری | ۳۰ | همین README، `npm run verify`، CI ویندوز+لینوکس، PWA |

نقشه داوری: [`docs/judging-map.md`](docs/judging-map.md) · پوشش محورها: [`docs/axes-coverage.md`](docs/axes-coverage.md) · متن ویدئو: [`docs/demo-script.md`](docs/demo-script.md)

## محدودیت‌ها

[`docs/limits.md`](docs/limits.md)
