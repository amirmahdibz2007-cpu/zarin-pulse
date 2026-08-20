# دفتر راستی‌آزمایی

هر ردیف یک واحد کوچک است. حکم بدون خروجی فرمان معتبر نیست.

| زمان (UTC) | واحد | بند اسپک | فرمان | انتظار | واقعی | حکم |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-08-20 | windows script guard | ۲۰ | `node scripts/check-scripts.mjs` | صفر توکن پوسته‌ای | `check-scripts: ok` | pass |
| 2026-08-20 | path join guard | ۲۰ | `node scripts/check-paths.mjs` | صفر مسیر هاردکد | `check-paths: ok` | pass |
| 2026-08-20 | persian leak guard | ۱۶ | `node scripts/check-persian.mjs` | صفر نشت در apps/web | `check-persian: ok` | pass |
| 2026-08-20 | PWA assets | ۱۸ | `node scripts/check-pwa.mjs` | چهار آیکون + sw + offline | `check-pwa: ok` | pass |
| 2026-08-20 | contracts + analytics tests | ۸–۱۰ | `npm exec -- vitest run` | همه تست‌ها سبز | `21 files / 76 tests passed` | pass |
| 2026-08-20 | typecheck + lint | ۰-الف لایه ۲ | `npm run verify` | خروج ۰ | خروج ۰، metrics.md نوشته شد | pass |
| 2026-08-20 | ETL golden | ۳ و ۹ | `npm run data:build` | ثابت‌ها و وضعیت پایانی | `etl: artifacts written`؛ Verified 1025627، InBank 733620، Failed 30939، gap 28، low 19 | pass |
| 2026-08-20 | data:verify | ۹ | `npm run data:verify` | sha256 یکسان | `data:verify ok (360 files)` | pass |
| 2026-08-20 | next build | ۲۴ فاز ۴ و ۸ | `npm run build` | همه مسیرها | ۳۶۴ صفحه از جمله ۳۴۳ پذیرنده | pass |
| 2026-08-20 | M91 AOV fallback | ۱۱ | artifact `merchants/M91.json` | غیرصفر، median_attempted | expected 13_708_325_893، basis median_attempted | pass |
| 2026-08-20 | M282 pattern 2 | ۱۲ | artifact `merchants/M282.json` | pattern_2، paid 1475 | `pattern_2_verify_broken`، paid_pending 1475 | pass |
| 2026-08-20 | recon identities | ۱۳ | `reconciliation.json` | اتحادها | sessions/attempted/terminal/revenue/impact همه برابر | pass |
| 2026-08-20 | live URL | ۲۴ فاز ۰ و ۱۰ | `curl -H bypass-tunnel-reminder:1 https://brave-eagles-yawn.loca.lt/` | ۲۰۰ و HTML فارسی | home 200 | pass |
