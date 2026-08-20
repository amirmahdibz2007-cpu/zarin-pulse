# shadcn/ui — استاندارد UI پروژه (هکاتون)

> **منبع:** درس استارکوچ (شادcn ui) — تکمیل‌شده  
> **تاریخ ثبت در ریپو:** ۱۹ آگوست ۲۰۲۶  
> **وضعیت:** الزام frontend برای این پروژه مگر خلافش صریح نوشته شود

---

## shadcn/ui چیست؟

مجموعه‌ای از Componentهای آماده و قابل شخصی‌سازی برای ساخت UI مدرن.

به‌جای ساخت از صفر، Componentهایی مثل Button، Input، Card، Dialog، Dropdown و … را به پروژه اضافه می‌کنید.

- مستندات رسمی: https://ui.shadcn.com

---

## چرا برای این هکاتون؟

زمان محدود است؛ ساخت Component پایه از صفر اتلاف است. shadcn کمک می‌کند UI تمیز، یکپارچه و حرفه‌ای باشد و زمان روی قابلیت اصلی (زرین‌پال / منطق کسب‌وکار) بماند.

### مزایای مهم

- تعداد زیاد Component آماده
- طراحی مدرن و تمیز
- شخصی‌سازی بالا
- مناسب Dashboard و Application پیچیده
- مناسب Chat UI و AI Application
- هماهنگی با Tailwind CSS
- Theme و ظاهر قابل تغییر
- استفاده مستقل در پروژه

**تفاوت کلیدی با libraryهای بسته:** Componentها به خود پروژه کپی می‌شوند؛ کدشان را مستقیم می‌توان تغییر داد.

---

## نصب

روش نصب به Framework بستگی دارد. راهنمای رسمی: https://ui.shadcn.com/docs/installation

Frameworkهای دارای راهنما: Next.js، Vite، React Router، TanStack Start، Astro، Laravel.

### Next.js (ترجیح پیش‌فرض این ریپو اگر استک React باشد)

```bash
pnpm dlx shadcn@latest init
# یا
npx shadcn@latest init
```

- https://ui.shadcn.com/docs/installation/next

### Vite

```bash
pnpm dlx shadcn@latest init -t vite
# یا
npx shadcn@latest init -t vite
```

- https://ui.shadcn.com/docs/installation/vite

---

## اضافه کردن Component

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add button card dialog
```

مثال استفاده:

```tsx
import { Button } from "@/components/ui/button"

export default function App() {
  return <Button>Click me</Button>
}
```

- CLI: https://ui.shadcn.com/docs/cli

---

## شخصی‌سازی

قابل تغییر: رنگ‌ها، Border Radius، Typography، Spacing، Dark Mode، Variants، Theme.

هدف: Building Block آماده + ظاهر مطابق محصول — نه کپی عین دموی پیش‌فرض.

- Theming: https://ui.shadcn.com/docs/theming

---

## shadcn Skill برای Coding Agent (الزام هکاتون)

Skill رسمی کمک می‌کند Agent:

- Component مناسب را پیدا کند
- Component لازم را نصب کند
- درست Compose کند
- API درست را استفاده کند
- Theme/Customization پروژه را بفهمد
- با `components.json` هماهنگ باشد (Framework، Tailwind، Alias، Icon Library، Base Library)

### نصب Skill

```bash
pnpm dlx skills add shadcn/ui
```

- Skills docs: https://ui.shadcn.com/docs/skills

### گردش کار پیشنهادی استارکوچ (برای این پروژه هم)

```text
1. Install shadcn/ui
        ↓
2. Install shadcn Skill
        ↓
3. Define UI requirements
        ↓
4. Ask Coding Agent to search/use existing components
        ↓
5. Customize the components
        ↓
6. Review the final UI
```

**قانون جلسه:** قبل از ساخت Component از صفر، اول چک کن در shadcn/ui هست یا نه.

نتیجه: سرعت بیشتر، UI یکپارچه، Component تکراری کمتر، زمان بیشتر برای هسته محصول.

---

## قانون engineering این ریپو درباره UI

1. Frontend React → حتماً shadcn + Tailwind.
2. قبل از UI custom، `npx shadcn@latest add …` برای قطعه موجود.
3. بعد از scaffold پروژه، Skill رسمی shadcn نصب شود تا Agent با `components.json` کار کند.
4. Theme با CSS variables پروژه؛ از purple-on-white پیش‌فرض AI اجتناب (طبق قوانین طراحی کاربر) — شخصی‌سازی صریح.
5. Dashboard / filters / tables / dialogs از primitives shadcn؛ منطق پرداخت/زرین‌پال جدا از UI بماند.

---

## منابع

| موضوع | URL |
|-------|-----|
| Home | https://ui.shadcn.com |
| Installation | https://ui.shadcn.com/docs/installation |
| Next.js | https://ui.shadcn.com/docs/installation/next |
| Vite | https://ui.shadcn.com/docs/installation/vite |
| Components | https://ui.shadcn.com/docs/components |
| CLI | https://ui.shadcn.com/docs/cli |
| Theming | https://ui.shadcn.com/docs/theming |
| Skills | https://ui.shadcn.com/docs/skills |

---

## وضعیت در این ریپو

- [x] دانش ثبت شد
- [ ] پروژه Next/Vite scaffold نشده → init shadcn هنوز اجرا نشده
- [ ] Skill هنوز نصب نشده (بعد از scaffold اجرا شود)

*وقتی استک frontend قفل شد، همین سند را با مسیر واقعی `components.json` و لیست Componentهای نصب‌شده به‌روز کن.*

**لایه بعدی:** برای Chat/AI UI از [`vercel-ai-sdk.md`](./vercel-ai-sdk.md) (AI Elements روی همین shadcn).
