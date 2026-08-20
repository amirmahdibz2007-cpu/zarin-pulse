# رجیستری متریک

تولیدشده از `packages/contracts/src/metrics/registry.ts`. دست‌کاری مستقیم نکنید.

## `session_success_rate` (v1.0.0)

- **عنوان:** نرخ پرداخت موفق
- **زبان ساده:** از هر صد جلسه‌ای که مشتری برای پرداخت باز می‌کند، چند تا واقعاً تمام می‌شود.
- **جزئیات فنی:** verified / sessions در دانه جلسه. بازه ویلسون ۹۵٪. جلسات NoAttempt در مخرج می‌مانند.
- **واحد:** ratio · **دانه:** session · **CI:** wilson
- **صورت:** جلسات با session_status = Verified
- **مخرج:** همه جلسات یکتا
- **حداقل نمونه:** 100
- **شرط:** merchant sessions >= 100
- **مخدوش‌کننده‌ها:** category mix؛ amount band؛ PSP mix؛ low-coverage days

## `no_attempt_rate` (v1.0.0)

- **عنوان:** نرخ نرسیدن به بانک
- **زبان ساده:** چند درصد مشتری‌ها اصلاً به صفحه بانک نمی‌رسند.
- **جزئیات فنی:** min_try_seq = 0 تقسیم بر تعداد جلسات. موفقیت تلاش با try_status سنجیده نمی‌شود.
- **واحد:** ratio · **دانه:** session · **CI:** wilson
- **صورت:** جلسات با min_try_seq = 0
- **مخرج:** همه جلسات یکتا
- **حداقل نمونه:** 100
- **شرط:** merchant sessions >= 100
- **مخدوش‌کننده‌ها:** merchant configuration؛ test transactions in 1e3 band

## `in_bank_abandon_rate` (v1.0.0)

- **عنوان:** نرخ رهاکردن صفحه بانک
- **زبان ساده:** چند درصد مشتری‌ها به بانک می‌روند ولی پرداخت را تمام نمی‌کنند.
- **جزئیات فنی:** وضعیت پایانی InBank تقسیم بر جلسات. جدا از Failed و NoAttempt.
- **واحد:** ratio · **دانه:** session · **CI:** wilson
- **صورت:** جلسات با terminal_state = InBank
- **مخرج:** همه جلسات یکتا
- **حداقل نمونه:** 100
- **شرط:** merchant sessions >= 100
- **مخدوش‌کننده‌ها:** PSP mix؛ amount band؛ category

## `technical_fail_rate` (v1.0.0)

- **عنوان:** نرخ خطای فنی
- **زبان ساده:** چند درصد پرداخت‌ها به‌خاطر خطای فنی می‌ایستند، نه به‌خاطر انصراف مشتری.
- **جزئیات فنی:** terminal_state = Failed. در کل پلتفرم حدود ۱٫۵٪ است.
- **واحد:** ratio · **دانه:** session · **CI:** wilson
- **صورت:** جلسات با terminal_state = Failed
- **مخرج:** همه جلسات یکتا
- **حداقل نمونه:** 100
- **شرط:** merchant sessions >= 100
- **مخدوش‌کننده‌ها:** PSP؛ terminal configuration

## `revenue_rial` (v1.0.0)

- **عنوان:** درآمد ثبت‌شده
- **زبان ساده:** جمع مبلغ سفارش‌هایی که پرداخت‌شان کامل شده.
- **جزئیات فنی:** SUM(amount) روی جلسات Verified در دانه جلسه. جمع سطح ردیف ۳٫۷۷٪ بیش‌برآورد می‌سازد.
- **واحد:** rial · **دانه:** order · **CI:** none
- **صورت:** amount جلسات Verified
- **مخرج:** —
- **حداقل نمونه:** 1
- **شرط:** none
- **مخدوش‌کننده‌ها:** partial months؛ low-coverage days

## `aov_rial` (v1.0.0)

- **عنوان:** سبد خرید متوسط
- **زبان ساده:** میانگین مبلغ یک سفارش موفق.
- **جزئیات فنی:** revenue_rial / verified_orders. اگر سفارشی نباشد به aov_basis برمی‌گردیم.
- **واحد:** rial · **دانه:** order · **CI:** bootstrap
- **صورت:** درآمد جلسات Verified
- **مخرج:** تعداد جلسات Verified
- **حداقل نمونه:** 30
- **شرط:** verified_orders >= 30
- **مخدوش‌کننده‌ها:** price catalog؛ category

## `paid_pending_rial` (v1.0.0)

- **عنوان:** پول معلق
- **زبان ساده:** پولی که از مشتری گرفته شده ولی هنوز تأیید ثبت نشده.
- **جزئیات فنی:** SUM(amount) روی terminal_state = Paid در دانه جلسه. ارز الف دفتر اثر.
- **واحد:** rial · **دانه:** session · **CI:** none
- **صورت:** amount جلسات Paid
- **مخرج:** —
- **حداقل نمونه:** 1
- **شرط:** none
- **مخدوش‌کننده‌ها:** verify callback health

## `fee_effective_rate` (v1.0.0)

- **عنوان:** نرخ مؤثر کارمزد
- **زبان ساده:** چه سهمی از فروش موفق شما به‌عنوان کارمزد می‌نشیند. این عدد کارمزد واقعی زرین‌پال نیست.
- **جزئیات فنی:** SUM(adjusted_fee)/SUM(amount) روی Verified. فقط مقایسه نسبی. relativeOnly=true.
- **واحد:** ratio · **دانه:** order · **CI:** bootstrap
- **صورت:** adjusted_fee جلسات Verified
- **مخرج:** amount جلسات Verified
- **حداقل نمونه:** 50
- **شرط:** verified_orders >= 50
- **مخدوش‌کننده‌ها:** amount band floor؛ tariff؛ hidden coefficient
- **فقط نسبی:** بله — `adjusted_fee` کارمزد واقعی نیست.

## `fee_tariff_effect` (v1.0.0)

- **عنوان:** اثر تعرفه خالص
- **زبان ساده:** بعد از درنظرگرفتن اندازه سبد، کارمزد نسبی شما از انتظار هم‌مبلغ‌ها چقدر بیشتر یا کمتر است.
- **جزئیات فنی:** actual_rate − Σ w(b)·r_ref(b) روی باندهای ثابت لگاریتمی. CI بوت‌استرپ بذردار.
- **واحد:** ratio · **دانه:** order · **CI:** bootstrap
- **صورت:** نرخ واقعی منهای نرخ انتظاری باند مبلغ
- **مخرج:** —
- **حداقل نمونه:** 200
- **شرط:** verified_orders >= 200
- **مخدوش‌کننده‌ها:** band occupancy؛ hidden coefficient
- **فقط نسبی:** بله — `adjusted_fee` کارمزد واقعی نیست.

## `retry_hazard` (v1.0.0)

- **عنوان:** شانس موفقیت در هر تلاش
- **زبان ساده:** از کسانی که هنوز موفق نشده‌اند، در این شماره تلاش چند درصد موفق می‌شوند.
- **جزئیات فنی:** h(k)=won(k)/at_risk(k). won فقط با try_status=Verified. verified_at برای برنده تلاش ممنوع است.
- **واحد:** ratio · **دانه:** try · **CI:** wilson
- **صورت:** تلاش‌های با try_status = Verified در شماره k
- **مخرج:** تلاش‌های k جلساتی که تا k برنده نشده‌اند
- **حداقل نمونه:** 100
- **شرط:** at_risk >= 100
- **مخدوش‌کننده‌ها:** merchant retry policy

## `peer_success_gap` (v1.0.0)

- **عنوان:** شکاف با هم‌صنف‌ها
- **زبان ساده:** نرخ موفق شما چقدر از سه‌چهارم هم‌صنف‌های هم‌سبد پایین‌تر است.
- **جزئیات فنی:** p75(peer success) − own success. گروه همتا: همان صنف، دهک مبلغ میانه ±۲، حداقل ۵ همتا.
- **واحد:** ratio · **دانه:** merchant · **CI:** bootstrap
- **صورت:** اختلاف نرخ
- **مخرج:** —
- **حداقل نمونه:** 5
- **شرط:** peer_group_size >= 5 and sessions >= 100
- **مخدوش‌کننده‌ها:** volume (controlled via standardization, not matching)

