# Design Systems & UI Libraries — مرجع ایده و الگو (هکاتون)

> **منبع:** درس استارکوچ (Design Systems & UI Libraries) — تکمیل‌شده  
> **تاریخ ثبت در ریپو:** ۱۹ آگوست ۲۰۲۶  
> **نقش در این ریپو:** مرجع **الگو / UX / ایده** — نه جایگزین استک پیاده‌سازی  
> **استک پیاده‌سازی قفل‌شده:** shadcn/ui + Tailwind (+ AI Elements) — ببین [`shadcn-ui.md`](./shadcn-ui.md) و [`vercel-ai-sdk.md`](./vercel-ai-sdk.md)

---

## اصل

لازم نیست همیشه UI از صفر طراحی شود. Design System = اصول طراحی + Componentها + الگوهای UI + استانداردها → سرعت طراحی و توسعه بالاتر.

در هکاتون از این منابع برای:

- ایده گرفتن
- بررسی الگوهای حرفه‌ای UI/UX
- ساخت رابط تمیزتر

استفاده کن — سپس الگو را با **shadcn** پیاده کن، نه اینکه کل Ant/Carbon را وسط پروژه بکشی مگر تصمیم صریح مهندسی.

---

## ۱. Material Design (Google)

- سایت: https://m3.material.io/
- تمرکز: Typography, Color, Layout, Spacing, Components, Motion, Accessibility
- کاربرد: اصول پایه UI برای Web و پلتفرم‌های مختلف؛ یکی از شناخته‌شده‌ترین سیستم‌ها

**برای این پروژه:** مرجع اصول فاصله/سلسله‌مراتب/حرکت؛ نه الزام به Material Components React.

---

## ۲. Ant Design

- سایت: https://ant.design/
- تمرکز: Application سازمانی، Dashboard، UI داده‌محور و پیچیده
- مناسب ایده برای: Admin Dashboard، پنل مدیریتی، Table پیچیده، Form، Data-heavy app، سیستم سازمانی

**برای این پروژه (زرین‌پال):** الگوی Table/Filter/Form پنل تراکنش و تسویه را از اینجا ایده بگیر؛ پیاده با shadcn Table/Form/Dialog.

---

## ۳. IBM Carbon Design System

- سایت: https://carbondesignsystem.com/
- متن‌باز IBM برای محصولات و تجربه‌های دیجیتال Enterprise
- مفاهیم: Components, Design Tokens, Typography, Color, Grid, Accessibility, Patterns, Data Visualization
- تمرکز قوی روی Accessibility و Consistency

**برای این پروژه:** الگوی Data Viz گزارش مالی، توکن رنگ/spacing، و a11y پنل.

---

## ۴. Microsoft Fluent 2

- سایت: https://fluent2.microsoft.design/
- تجربه‌های دیجیتال مدرن و یکپارچه
- موضوعات: Components, Typography, Color, Layout, Icons, Design Tokens, Accessibility, Motion, Interaction

**برای این پروژه:** ایده Interaction و Iconography؛ اگر ویندوز/مایکروسافت حس برند نباشد، فقط الگو بردار نه ظاهر کامل Fluent.

---

## ۵. Bootstrap 5 Design System (Figma UI Kit)

- Figma Community: https://www.figma.com/community/file/1044316192441037087/bootstrap-5-design-system-ui-kit
- UI Kit مبتنی بر Bootstrap 5: Colors, Typography, Buttons, Forms, Cards, Tables, Navigation, Modal, Alerts, Pagination, Variants
- کاربرد: طراحی سریع صفحه در Figma و دیدن ساختار یک UI یکپارچه

**برای این پروژه:** فقط برای wireframe/idea در Figma اگر لازم شد؛ Bootstrap را به عنوان runtime library وارد ریپو نکن (با Tailwind/shadcn تداخل مفهومی دارد).

---

## قانون engineering این ریپو

| کار | بله | نه |
|-----|-----|-----|
| ایده Layout / Dashboard / Table از Ant/Carbon/Fluent/Material | ✓ | |
| کپی الگوی Spacing / Typography / a11y | ✓ | |
| نصب همزمان Ant Design + shadcn به‌عنوان دو سیستم موازی | | ✗ مگر دلیل مکتوب |
| Chat UI از Fluent به‌جای AI Elements | | ✗ |
| Bootstrap CSS در runtime کنار Tailwind | | ✗ |

**جریان پیشنهادی:**

```text
الگو از Design System مرجع
        ↓
ترجمه به shadcn components + theme tokens
        ↓
Chat/AI از AI Elements
        ↓
منطق دامنه (زرین‌پال) جدا از ظاهر
```

---

## وضعیت

- [x] دانش ثبت شد
- [ ] Design tokens اختصاصی محصول هنوز تعریف نشده (بعد از قفل برند/چالش)
- [ ] Moodboard / Figma اختیاری — فقط اگر برای دمو داوری لازم شد

*این سند «الهام» است؛ منبع حقیقت پیاده‌سازی UI همچنان shadcn + AI Elements است.*
