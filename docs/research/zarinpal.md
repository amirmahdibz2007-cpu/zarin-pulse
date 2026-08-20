# تحقیق زرین‌پال (ZarinPal) — Data Collection

> **وضعیت:** مرحله جمع‌آوری داده برای چالش هکاتون  
> **تاریخ جمع‌آوری:** ۱۹ مرداد ۱۴۰۵ / ۱۹ آگوست ۲۰۲۶  
> **منبع اصلی:** مستندات رسمی `zarinpal.com` و `next.zarinpal.com`  
> **هدف این فایل:** مرجع ماندگار برای طراحی محصول نهایی؛ قبل از کدنویسی به‌روز نگه داشته شود.

---

## 1. هویت شرکت

| فیلد | مقدار | منبع |
|------|--------|------|
| نام تجاری | زرین‌پال | [aboutus](https://www.zarinpal.com/aboutus) |
| شرکت حقوقی | شرکت همراه پرداز زرین | [terms](https://www.zarinpal.com/terms) (ویرایش ۸ تیر ۱۴۰۴) |
| نقش قانونی | پرداخت‌یار (Payment Facilitator) تحت الزامات شاپرک / بانک مرکزی | terms §۱ |
| مأموریت اعلام‌شده | افزایش سهم تجارت الکترونیکی در GDP | aboutus |
| ادعای سابقه | بیش از ۱۴ سال؛ «اولین پرداخت‌یار کشور» | aboutus / homepage |
| ادعای مقیاس | «خانواده یک میلیونی» پذیرنده | homepage |
| آدرس | تهران، خیابان احمد قصیر (بخارست)، کوچه نوری (ششم شرقی)، پلاک ۱۳ | [contact](https://www.zarinpal.com/contact) |
| کد پستی | ۱۵۱۴۷۱۸۳۲۱ | contact |
| تلفن پشتیبانی | ۰۲۱-۴۵۶۲۸۰۰۰ (پذیرنده و خریدار) | contact |
| فکس | ۰۲۱-۴۵۶۲۸۸۸۸ | contact |
| ساعات کاری دفتر | شنبه–چهارشنبه ۹–۱۷ | contact |
| پشتیبانی اعلامی محصول | ۲۴/۷ | payment-gateway page |

### نکات حقوقی حیاتی برای محصول

- تسویه وجوه پذیرنده توسط **شاپرک** انجام می‌شود؛ زرین‌پال حق برداشت از حساب مقصد را به شاپرک تفویض کرده (terms §۴-۵).
- استفاده از ربات/اسکریپت برای احراز هویت، تکمیل اطلاعات، یا دسترسی خودکار به پنل **ممنوع** است و منجر به غیرفعال‌سازی می‌شود (terms §۳-۴).
- Merchant IPG فقط روی دامنه متعلق به همان پذیرنده مجاز است (terms §۴-۴) — خطای API مرتبط: `-14`, `-18`.
- حداقل سن حقیقی: ۱۸ سال؛ اهلیت قانونی کامل الزامی است.
- موارد ممنوع: فروش غیرقانونی، رمزارز غیرمجاز/مبادله ارز، باکس تبلیغاتی، فیلم/سریال بدون ساماندهی ارشاد، حراج آنلاین، اسپم، و غیره (terms §۴-۱).

---

## 2. نقشه محصول (Product Surface)

### 2.1 درگاه پرداخت اینترنتی (IPG) — محصول اصلی

- مسیردهی هوشمند به ۶ PSP: ملت، پاسارگاد، سپهر، ایران‌کیش، آسان‌پرداخت، سامان.
- اگر یک درگاه قطع/ضعیف باشد، ترافیک به درگاه دیگر هدایت می‌شود.
- تسویه: یک روز پس از تراکنش، حداکثر تا ساعت ۱۷ (ادعای صفحه محصول).
- بازه تسویه قابل تنظیم: روزانه / هفتگی / ماهانه / روز مشخص.
- افزونه‌ها و نمونه کد برای کاهش اصطکاک اتصال.

**کارمزد اعلامی صفحه درگاه (باید قبل از دمو تأیید شود):**

| پلن | مبلغ |
|-----|------|
| ماه اول عضویت | رایگان خدمات زرین‌پال + فقط کارمزد شاپرکی |
| استاندارد | ۰٫۵٪ تا سقف ۱۶٬۰۰۰ تومان + ۵۰۰ تومان ثابت |
| کسب‌وکار بزرگ (>۱۰۰ تراکنش/روز) | مذاکره‌ای |

> **هشدار داده:** در بلاگ قدیمی‌تر و منابع ثالث، اعداد کارمزد متفاوت گزارش شده (مثلاً ۱٪ + مبلغ ثابت، یا اعداد زرین‌لینک). برای محصول/داوری فقط عدد صفحه رسمی فعلی را استناد کن و در صورت ابهام از پنل/پشتیبانی تأیید بگیر.

### 2.2 زرین‌لینک

- لینک پرداخت بدون نیاز به وب‌سایت (شبکه‌های اجتماعی، فریلنسر، رویداد، حمایت مالی، فروش محصول).
- انواع: پرداخت سریع، دریافت وجه، فروش محصول، ثبت‌نام رویداد، حمایت مالی.
- سقف اعلامی: تا ۱۰۰ میلیون تومان در هر تراکنش.
- کارمزد اعلامی صفحه زرین‌لینک: ۰٫۰۲٪ تا سقف ۱۰٬۰۰۰ تومان + ۲۰۰ تومان ثابت.
- قابلیت‌ها: فرم سفارش، کد تخفیف، موجودی/ظرفیت، شخصی‌سازی برند صفحه، پیام پس از پرداخت.

> **وضعیت بحرانی (۱۹ آگوست ۲۰۲۶):** در صفحه رسمی نوشته شده:  
> **«این سرویس حسب دستور بانک مرکزی، موقتاً غیرفعال است.»**  
> برای چالش هکاتون: روی زرین‌لینک به‌عنوان هسته محصول حساب نکن مگر وضعیت فعال بودن دوباره تأیید شود.

### 2.3 عیان (Ayan) — احراز هویت پرداخت‌کننده

- تطبیق کد ملی صاحب کارت بانکی با کد ملی صاحب سیم‌کارت (بر اساس موبایل ارسالی در request).
- فعال‌سازی: تیکت از پنل برای هر ترمینال.
- پیش‌نیاز فنی: ارسال `metadata.mobile` در Payment Request.
- خروجی GraphQL روی `session_tries.is_card_mobile_verified`: `true` | `false` | `null`.
- تعرفه اعلامی صفحه عیان:
  - استعلام نام خریدار: ۲۵۰ تومان / استعلام
  - تطبیق نام صاحب کارت و شماره همراه: ۱٬۰۰۰ تومان / استعلام
- ارزش برای پذیرنده: کاهش سوءاستفاده از کارت دیگران، اعتماد در خریدهای گران (طلا، تجهیزات، …)، سند برای فتا.

### 2.4 تسهیم / تسویه اشتراکی (Wages)

- تقسیم خودکار مبلغ تراکنش بین چند شبا در لحظه request.
- پارامتر `wages[]`: `{ iban, amount, description }`.
- سقف: حداکثر ۵ بخش؛ تا ۹۹٪ مبلغ تراکنش.
- حداقل مبلغ تسهیم شناور: ۱۰٬۰۰۰ ریال (خطای `-36`).
- نیاز به حساب بانکی معتبر در پنل و دسترسی ترمینال به سرویس.
- خطاهای اختصاصی: `-30` تا `-39`.

### 2.5 سایر محصولات/برندهای مرتبط (نیاز به تأیید بیشتر)

| محصول | خلاصه | وضعیت در این تحقیق |
|-------|--------|---------------------|
| زرین‌کارت | کارت بانکی فیزیکی برای پذیرندگان؛ برخی منابع به تخفیف کارمزد/سه‌شنبه‌ها اشاره کرده‌اند | صفحه رسمی عمیق در این دور کامل واکشی نشد — TODO |
| زرین‌پلاس | کش‌بک در فروشگاه‌های طرف قرارداد (منابع ثالث) | TODO تأیید رسمی |
| اتاق گفتگو اختلاف | حل اختلاف پذیرنده–خریدار تحت نظارت زرین‌پال (terms §۵) | تأیید از terms |

---

## 3. معماری فنی — دو لایه API

زرین‌پال دو سطح API دارد. اشتباه گرفتن این دو لایه باگ کلاسیک یکپارچه‌سازی است.

```text
┌─────────────────────────────────────────────────────────────┐
│  A) Payment Gateway REST v4  (تراکنش پرداخت)               │
│     Hostها: api.zarinpal.com | payment.zarinpal.com           │
│     Auth: merchant_id (UUID 36 char)                        │
│     Flow: request → StartPay → callback → verify            │
│     Extras: inquiry, unVerified, reverse, wages            │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│  B) Account GraphQL + OAuth 2.0  (مدیریت حساب/ترمینال)     │
│     Host: next.zarinpal.com                                 │
│     Auth: Bearer access_token (JWT)                        │
│     Endpoint: POST /api/v4/graphql                          │
│     Capabilities: Terminal, Session, Refund, Reconciliation, │
│                   Ticket, Ayan fields, …                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Payment Gateway REST v4 — قرارداد دقیق

### 4.1 Endpoints (Production)

| عمل | Method | URL |
|-----|--------|-----|
| Request | POST | `https://api.zarinpal.com/pg/v4/payment/request.json` |
| StartPay (redirect) | GET | `https://www.zarinpal.com/pg/StartPay/{authority}` |
| Verify | POST | `https://api.zarinpal.com/pg/v4/payment/verify.json` |
| Inquiry | POST | `https://payment.zarinpal.com/pg/v4/payment/inquiry.json` |
| unVerified | POST | `https://payment.zarinpal.com/pg/v4/payment/unVerified.json` _(نسخه alternate در next docs: `api.zarinpal.com`)_ |
| Reverse | POST | `https://payment.zarinpal.com/pg/v4/payment/reverse.json` |

> **نکته مهندسی:** در مستندات رسمی هم `api.zarinpal.com` و هم `payment.zarinpal.com` دیده می‌شود. برای پیاده‌سازی یک base URL واحد انتخاب کن، در config متمرکز کن، و در sandbox همه را با هم عوض کن.

### 4.2 Sandbox

| Production | Sandbox |
|------------|---------|
| `https://api.zarinpal.com/pg/v4/payment/request.json` | `https://sandbox.zarinpal.com/pg/v4/payment/request.json` |
| `https://api.zarinpal.com/pg/v4/payment/verify.json` | `https://sandbox.zarinpal.com/pg/v4/payment/verify.json` |
| `https://www.zarinpal.com/pg/StartPay/` | `https://sandbox.zarinpal.com/pg/StartPay/` |

- در sandbox، `merchant_id` می‌تواند **هر رشته ۳۶ کاراکتری دلخواه** باشد (ولی خالی نباشد).
- اگر فقط بخشی از URLها sandbox شود → خطای غیرمنتظره.

### 4.3 Payment Request

**اجباری:**

| فیلد | نوع | شرح |
|------|-----|------|
| `merchant_id` | string(36) | کد پذیرنده |
| `amount` | integer | مبلغ به **ریال** |
| `description` | string | توضیحات (حداکثر ~۵۰۰ کاراکتر؛ نقض → `-9`) |
| `callback_url` | string | صفحه بازگشت پذیرنده |

**اختیاری / پیشرفته:**

| فیلد | شرح |
|------|------|
| `metadata.mobile` | موبایل خریدار (لازم برای عیان) |
| `metadata.email` | ایمیل خریدار |
| `metadata.order_id` | شناسه سفارش (در docs تسهیم ذکر شده) |
| `metadata.card_pan` | محدود کردن پرداخت به کارت خاص (قبلاً احرازشده) |
| `wages[]` | تسهیم `{iban, amount, description}` |
| `referrer_id` | کد معرف |
| `currency` | در SDKها: `IRR` یا `IRT` (پیش‌فرض IRR) — در guide اصلی صفحه next همیشه ریال فرض شده |
| `expire_in` | محدودیت زمانی درخواست (خطای `-40` اگر نامعتبر) |

**نمونه پاسخ موفق request:**

```json
{
  "data": {
    "code": 100,
    "message": "Success",
    "authority": "A00000000000000000000000000217885159",
    "fee_type": "Merchant",
    "fee": 100
  },
  "errors": []
}
```

### 4.4 Callback

Query string به `callback_url`:

- `Authority=...`
- `Status=OK` یا `Status=NOK`

**Invariant:** فقط وقتی `Status=OK` است باید `verify` صدا زده شود. `NOK` = ناموفق یا لغو کاربر.

### 4.5 Verify

**ورودی:** `merchant_id`, `amount`, `authority`  
**مهم:** `amount` باید دقیقاً همان مبلغ request باشد؛ وگرنه `-50`.

**پاسخ موفق نمونه:**

```json
{
  "data": {
    "code": 100,
    "message": "Verified",
    "card_hash": "...",
    "card_pan": "502229******5995",
    "ref_id": 201,
    "fee_type": "Merchant",
    "fee": 0
  },
  "errors": []
}
```

**Idempotency حیاتی:**

| code | معنی |
|------|------|
| `100` | اولین verify موفق |
| `101` | تراکنش قبلاً verify شده (هنوز موفق است) |

→ در سیستم خودت: اولین `100` را سفارش را paid کن؛ `101` را duplicate-safe در نظر بگیر (نه خطا برای کاربر).

### 4.6 Inquiry (وضعیت، نه تأیید)

**ورودی:** `merchant_id`, `authority`  
**وضعیت‌های `status`:**

| مقدار | معنی |
|-------|------|
| `VERIFIED` | وریفای شده |
| `PAID` | پرداخت شده ولی هنوز verify نشده |
| `IN_BANK` | در حال پرداخت |
| `FAILED` | ناموفق / تکمیل‌نشده |
| `REVERSED` | ریورس شده |

**Invariant رسمی:** Inquiry را هرگز جایگزین verify نکن.

### 4.7 unVerified

- لیست پرداخت‌های موفق که هنوز verify نشده‌اند.
- ورودی: فقط `merchant_id`.
- سقف: **۱۰۰ تراکنش آخر**.
- کاربرد مهندسی: job بازیابی پس از crash سرور پذیرنده / از دست رفتن callback.

### 4.8 Reverse (استرداد سریع ≤۳۰ دقیقه)

- فقط تراکنش‌های موفق ظرف **۳۰ دقیقه** از پرداخت.
- بدون کارمزد به خریدار برمی‌گردد (ادعای docs).
- **پیش‌نیاز:** IP سرور روی ترمینال ست شده باشد؛ وگرنه `-62`.
- خطاها: `-60` (بانک اجازه نمی‌دهد), `-61` (موفق نیست/قبلاً reverse), `-62` (IP), `-63` (timeout ۳۰ دقیقه).

> تفاوت با Refund GraphQL: Reverse = REST سریع کوتاه‌مدت؛ AddRefund = استرداد عادی/آنی از لایه حساب (PAYA/CARD) روی `session_id`.

### 4.9 جریان Happy Path (Sequence)

```text
Merchant Backend                ZarinPal                    Buyer
     |                             |                          |
     |-- POST /request.json ------>|                          |
     |<-- authority, code=100 -----|                          |
     |-- 302 StartPay/{authority} --------------------------->|
     |                             |<-- bank UI / pay --------|
     |<-- GET callback?Authority&Status=OK -------------------|
     |-- POST /verify.json ------->|                          |
     |<-- code=100, ref_id --------|                          |
     |-- mark order PAID ------------------------------------>|
```

### 4.10 Failure / Recovery Modes (برای طراحی محصول)

1. **Buyer cancels** → `Status=NOK` → سفارش unpaid؛ verify نزن.
2. **Verify network fail بعد از پرداخت موفق** → سفارش در حالت `PAID` در inquiry؛ با `unVerified` یا retry verify با idempotency `100/101` بازیابی کن.
3. **Amount mismatch** → `-50`؛ هرگز amount را از client نگیر؛ از DB سفارش بخوان.
4. **Double callback** → با unique constraint روی `authority` / `ref_id` در DB خودت.
5. **Domain mismatch callback** → `-14`؛ دامنه ترمینال باید با callback یکی باشد.
6. **Merchant suspended / low KYC level** → `-15`, `-16`, `-17`.

---

## 5. کدهای خطا (Error Catalog)

منبع: [errorList](https://www.zarinpal.com/docs/paymentGateway/errorList)

### عمومی / ترمینال

| code | EN (docs) | معنی عملی |
|------|-----------|-----------|
| -9 | Validation error | merchant/callback/description/amount/referrer نامعتبر |
| -10 | Terminal not valid | merchant_id یا IP غلط |
| -11 | Terminal not active | ترمینال غیرفعال |
| -12 | Too many attempts | rate limit |
| -13 | Terminal limit reached | محدودیت تراکنش / مدارک |
| -14 | Callback domain mismatch | دامنه callback ≠ دامنه ترمینال |
| -15 | Terminal suspended | تعلیق |
| -16 | Level below silver | سطح تأیید ناکافی |
| -17 | Blue level limit | محدودیت سطح آبی |
| -18 | Referrer domain mismatch | استفاده merchant روی سایت غیرمجاز |
| -19 | Transactions banned | ایجاد تراکنش ممنوع |
| 100 | Success | موفق |
| 101 | Verified | قبلاً verify شده |

### Wages (Request)

| code | معنی |
|------|-------|
| -30 | دسترسی floating wages ندارد |
| -31 | حساب بانکی/مقادیر تسهیم نامعتبر |
| -32 | مجموع wages شناور > مبلغ |
| -33 | درصد شناور نامعتبر |
| -34 | مجموع wages ثابت > مبلغ |
| -35 | تعداد دریافت‌کنندگان بیش از حد |
| -36 | حداقل مبلغ تسهیم ۱۰٬۰۰۰ ریال |
| -37 | شبا(ها) از سمت بانک غیرفعال |
| -38 | شبا در شاپرک درست تعریف نشده |
| -39 | خطای عمومی wages |
| -40 | `expire_in` نامعتبر |
| -41 | حداکثر مبلغ ۱۰۰ میلیون تومان |

### Verify

| code | معنی |
|------|-------|
| -50 | مبلغ verify ≠ مبلغ پرداخت |
| -51 | پرداخت ناموفق |
| -52 | خطای غیرمنتظره |
| -53 | تراکنش مال این merchant نیست |
| -54 | authority نامعتبر |
| -55 | تراکنش یافت نشد |

### Reverse

| code | معنی |
|------|-------|
| -60 | بانک reverse را نمی‌پذیرد |
| -61 | موفق نیست یا قبلاً reverse شده |
| -62 | IP ترمینال ست نشده |
| -63 | بیش از ۳۰ دقیقه گذشته |

---

## 6. OAuth + GraphQL (لایه حساب)

### 6.1 OAuth endpoints

| مرحله | URL | نکات |
|-------|-----|------|
| Register | `POST https://next.zarinpal.com/api/oauth/register` | `first_name`, `last_name`, `cell_number` → `user_id` |
| Initialize OTP | `POST https://next.zarinpal.com/api/oauth/initialize` | `username`, `channel`: `ussd`\|`sms` |
| Token (password) | `POST https://next.zarinpal.com/api/oauth/token` | نیاز به `client_id` + `client_secret` از پشتیبانی |
| Refresh | همان token endpoint با `grant_type=refresh_token` | |

**پاسخ token نمونه:**

```json
{
  "token_type": "Bearer",
  "expires_in": 1296000,
  "access_token": "{ACCESS_TOKEN}",
  "refresh_token": "{REFRESH_TOKEN}"
}
```

`expires_in` نمونه docs ≈ ۱۵ روز (۱٬۲۹۶٬۰۰۰ ثانیه).

### 6.2 GraphQL

- Endpoint: `POST https://next.zarinpal.com/api/v4/graphql/`
- Header: `Authorization: Bearer {ACCESS_TOKEN}`
- Content-Type: `application/json`
- بدنه: `{ "query": "...", "variables": {...} }`

### 6.3 عملیات GraphQL تأییدشده در این تحقیق

| حوزه | عملیات | کاربرد |
|------|--------|--------|
| Application | `query { Application { application, platform } }` | smoke test |
| Terminal | لیست ترمینال‌ها؛ `TerminalAdd` mutation | ساخت درگاه (`mcc_id`, `domain`, `support_phone`, `name`, `bank_account_id`) → `key` = merchant_id، `status: PENDING` |
| Session | `Session` / `SessionById` | جزئیات تراکنش، timeline ریفاند، عیان |
| Refund | `AddRefund` mutation | استرداد `PAYA` یا `CARD`؛ `reason`: CUSTOMER_REQUEST / DUPLICATE_TRANSACTION / SUSPICIOUS_TRANSACTION / OTHER؛ حداقل مبلغ در docs: ۲۰٬۰۰۰ ریال |
| Reconciliation | `Reconciliation` query | تسویه‌ها با فیلتر `ALL|PAID|IN_PROGRESS|REVERSED` + بازه تاریخ |
| Ayan | `Session.session_tries.is_card_mobile_verified` | نتیجه تطبیق کارت–موبایل |

> GraphQL برای تیکت، حساب بانکی، InstantPayout و … در ناوبری docs وجود دارد ولی در این دور همه صفحات واکشی کامل نشدند → بخش TODO.

---

## 7. SDKهای رسمی اعلام‌شده

از [sdkDocs](https://www.zarinpal.com/docs/sdkDocs/):

- PHP
- Node.js
- Python
- Android

قابلیت‌های اعلامی SDK: پرداخت، تأیید، استعلام، استرداد، تسهیم، مدیریت unverified.

برای هکاتون: اگر استک وب است، REST خام + typed client خودمان اغلب کنترل‌پذیرتر از SDK قدیمی است؛ ولی SDK می‌تواند زمان را کم کند.

---

## 8. قیود کسب‌وکاری و سقف‌ها (برای مدل داده محصول)

| قید | مقدار | منبع |
|------|--------|------|
| واحد پول پیش‌فرض IPG | ریال | guide |
| سقف مبلغ تراکنش (خطای -41) | ۱۰۰٬۰۰۰٬۰۰۰ تومان | errorList |
| سقف description | ~۵۰۰ کاراکتر | errorList -9 |
| سقف unVerified | ۱۰۰ تراکنش | unVerified docs |
| سقف wages parts | ۵ | setshare |
| سقف wages مبلغ | تا ۹۹٪ تراکنش | setshare |
| حداقل wages amount | ۱۰٬۰۰۰ ریال | -36 |
| Reverse window | ۳۰ دقیقه + IP whitelist | reverse docs |
| حداقل Refund (GraphQL) | ۲۰٬۰۰۰ ریال | refund docs |
| KYC حقیقی | ۱۸+، کدملی، موبایل، ایمیل، آدرس، کدپستی | terms |
| KYC حقوقی | اساسنامه، آگهی، صاحبان امضا، معرفی‌نامه نماینده | terms |

---

## 9. پرسونای پذیرنده و نقاط درد واقعی (برای چالش)

این‌ها از ترکیب docs + terms + UX محصول استخراج شده‌اند؛ هنوز «بیانیه رسمی چالش» نیستند — فرض‌های مهندسی قابل دفاع:

1. **Recoverability:** پرداخت موفق شده ولی callback/verify از دست رفته → پول گرفته شده، سفارش نه. نیاز به `unVerified` + inquiry + reconcile job.
2. **Idempotency:** verify دوبار (`100` سپس `101`) و callback تکراری.
3. **Domain/IP binding:** اشتباه دامنه یا IP → `-14`/`-62`؛ دردسر ops برای تیم‌های کوچک.
4. **KYC / سطح ترمینال:** `-16`/`-17`/`-13` مسیر فعال‌سازی را طولانی می‌کند.
5. **Split payments:** مارکت‌پلیس/شراکت نیاز به wages دارد ولی خطای شبا/سقف زیاد است.
6. **Fraud:** پرداخت با کارت دیگران → عیان؛ ولی هزینه استعلام و نیاز به mobile در request.
7. **زرین‌لینک down:** کسب‌وکارهای بدون سایت فعلاً مسیر اصلی‌شان قطع است (دستور بانک مرکزی).
8. **کارمزد چندلایه:** کارمزد شاپرکی + کارمزد پرداخت‌یار + عیان؛ شفافیت برای پذیرنده سخت است.
9. **استرداد دو مسیره:** Reverse (۳۰ دقیقه) vs Refund GraphQL (PAYA/CARD) — گیج‌کننده برای پشتیبانی.
10. **ممنوعیت اتوماسیون پنل:** ساخت tooling که شبیه bot روی پنل باشد ریسک حقوقی دارد؛ باید روی API رسمی بماند.

---

## 10. منابع رسمی استفاده‌شده

| موضوع | URL |
|-------|-----|
| صفحه اصلی | https://www.zarinpal.com/ |
| درباره ما | https://www.zarinpal.com/aboutus |
| تماس | https://www.zarinpal.com/contact |
| قوانین | https://www.zarinpal.com/terms |
| درگاه پرداخت (محصول) | https://www.zarinpal.com/payment-gateway |
| زرین‌لینک | https://www.zarinpal.com/zarinlink |
| عیان | https://www.zarinpal.com/features/ayan/ |
| Guide IPG | https://next.zarinpal.com/paymentGateway/guide/ |
| Sandbox | https://next.zarinpal.com/paymentGateway/sandbox.html |
| Error list | https://www.zarinpal.com/docs/paymentGateway/errorList |
| Inquiry | https://www.zarinpal.com/docs/paymentGateway/otherMethods/Inquiry |
| unVerified | https://www.zarinpal.com/docs/paymentGateway/otherMethods/unVerified |
| Reverse | https://www.zarinpal.com/docs/paymentGateway/moreFeatures/reverse |
| Wages / setshare | https://www.zarinpal.com/docs/paymentGateway/moreFeatures/setshare.html |
| API intro (GraphQL) | https://www.zarinpal.com/docs/apiDocs/ |
| OAuth | https://www.zarinpal.com/docs/apiDocs/auth |
| Terminal GraphQL | https://www.zarinpal.com/docs/apiDocs/query/terminal |
| Refund GraphQL | https://www.zarinpal.com/docs/apiDocs/query/refund |
| Reconciliation | https://www.zarinpal.com/docs/apiDocs/query/reconciles |
| Ayan API | https://www.zarinpal.com/docs/apiDocs/query/card-mobile-verified |
| SDK index | https://www.zarinpal.com/docs/sdkDocs/ |

---

## 11. Unknowns / TODO تحقیق بعدی

- [ ] متن دقیق **چالش زرین‌پال در هکاتون** (هنوز به این ریپو اضافه نشده) — این فایل generic company research است
- [ ] صفحه رسمی زرین‌کارت / زرین‌پلاس و تعرفه قطعی فعلی
- [ ] تمام schema GraphQL (Ticket, BankAccount, InstantPayout, …)
- [ ] حداقل/حداکثر amount استاندارد IPG (غیر از -41 و wages min)
- [ ] تأیید اینکه `payment.zarinpal.com` و `api.zarinpal.com` alias رسمی یکسان‌اند
- [ ] وضعیت فعلی زرین‌لینک (هنوز غیرفعال؟)
- [ ] Postman collection رسمی (در صفحه refund لینک شده)
- [ ] مقایسه رقبا فقط در حد لازم برای positioning چالش (آیدی‌پی، نکست‌پی، …) — عمداً خارج از این سند مگر لازم شود

---

## 12. Implications برای پروژه هکاتون (پیش‌نویس، نه تعهد محصول)

تا وقتی صورت‌مسئله چالش نرسیده، فقط قیود طراحی که از این تحقیق **اجباری** به نظر می‌رسند:

1. مبلغ همیشه از سرور/DB؛ هرگز از querystring کاربر برای verify.
2. State machine سفارش حداقل: `created → pending_payment → paid_unverified → paid | failed | reversed | refunded`.
3. ذخیره `authority`, `ref_id`, `card_pan` masked, `fee`, raw response برای audit.
4. Job دوره‌ای روی `unVerified` / `inquiry` برای بازیابی.
5. تفکیک config: `ZARINPAL_MERCHANT_ID`, `ZARINPAL_BASE_URL` (prod/sandbox), اختیاری OAuth client برای لایه GraphQL.
6. اگر فیچر اعتماد می‌سازیم → عیان + mobile اجباری.
7. اگر مارکت‌پلیس → wages با validation شبا/سقف قبل از request.
8. دمو باید روی sandbox E2E باشد؛ داستان production-ready بدون verify واقعی کافی نیست.

---

*پایان سند جمع‌آوری داده زرین‌پال — نسخه ۱.*
