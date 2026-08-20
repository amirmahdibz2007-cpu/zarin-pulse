# Vercel AI SDK + AI Elements — استاندارد لایه AI (هکاتون)

> **منبع:** درس استارکوچ (Vercel AI SDK) — تکمیل‌شده  
> **تاریخ ثبت در ریپو:** ۱۹ آگوست ۲۰۲۶  
> **وضعیت:** الزام لایه AI/Chat برای این پروژه مگر خلافش صریح نوشته شود  
> **وابستگی:** روی [`shadcn-ui.md`](./shadcn-ui.md) سوار می‌شود (AI Elements = shadcn-based)

---

## Vercel AI SDK چیست؟

Toolkit برای ساخت سریع Applicationهای مبتنی بر AI و LLM — مخصوصاً در React و Next.js.

ساده‌سازی می‌کند:

- ارتباط Frontend با مدل‌های AI
- Streaming پاسخ‌ها
- مدیریت Chat
- Tool Calling / قابلیت‌های Agentic
- کار با Providerها و Modelهای مختلف

- مستندات رسمی: https://sdk.vercel.ai

---

## AI Elements — UI آماده Chatbot

نقطه قوت برای هکاتون: Componentهای آماده AI UI روی پایه **shadcn/ui**؛ کد به codebase کپی می‌شود.

نمونه‌های Component:

| حوزه | مثال |
|------|------|
| Chat | Conversation, Message (User/AI) |
| Input | Prompt Input, Voice Input |
| Streaming | Streaming Response |
| Agentic | Tool Call, Reasoning |
| Context | Source / Citation |
| UX | File Attachment, Model Selector, Suggestion / Prompt |

→ در هکاتون: Chat UI تمیز سریع؛ زمان روی منطق محصول (مثلاً زرین‌پال) بماند.

- AI Elements: https://ai-sdk.dev/elements (و/یا docs رسمی مرتبط در ai-sdk)
- Components list: از مستندات AI Elements

---

## چرا استفاده کنیم؟

- اضافه کردن سریع قابلیت AI
- Chatbot با UI آماده
- Streaming بدون زیرساخت دستی سنگین
- Multi-provider / multi-model
- Tool Calling ساده‌تر
- UI یکپارچه با shadcn

---

## نصب AI Elements

پیش‌نیاز: shadcn/ui در پروژه.

```bash
npx ai-elements@latest add message
npx ai-elements@latest add conversation
npx ai-elements@latest add prompt-input
npx ai-elements@latest add sources
```

همچنین می‌توان از CLI خود shadcn استفاده کرد (طبق docs رسمی همان زمان).

---

## Skill برای Coding Agent (الزام هکاتون)

Skill رسمی دانش AI Elements، الگوها، Integration با AI SDK و هماهنگی با shadcn را به Agent می‌دهد.

```bash
npx skills add vercel/ai-elements
```

- Skill docs: صفحه رسمی AI Elements Skill در مستندات Vercel/AI

---

## گردش کار پیشنهادی این ریپو

```text
1. Scaffold Next.js (یا Vite React)
        ↓
2. shadcn/ui init + shadcn skill
        ↓
3. Vercel AI SDK + AI Elements + ai-elements skill
        ↓
4. تعریف UX چت / ابزارها (tools) مطابق محصول
        ↓
5. Agent: از Componentهای موجود Compose کن، از صفر نساز
        ↓
6. Customize theme + wire به API/route handlers
        ↓
7. Review streaming, errors, empty states
```

---

## قانون engineering این ریپو درباره AI UI

1. اگر محصول Chat / Agent / AI assistant دارد → **Vercel AI SDK + AI Elements**؛ Chat از صفر ممنوع مگر gap رسمی در Elements.
2. Backend/route برای مدل: از patternهای AI SDK (`streamText` / `useChat` و معادل‌های نسخه جاری docs) — نسخه را هنگام scaffold از docs قفل کن و اینجا بنویس.
3. Tool Calling برای منطق دامنه (مثلاً وضعیت پرداخت زرین‌پال، inquiry) از SDK؛ UI نمایش Tool Call از Elements.
4. Secrets مدل فقط در server env؛ هرگز در client.
5. Failure modes: قطع stream، timeout مدل، tool error — پیام کاربر + log؛ empty catch ممنوع (طبق ENGINEERING.md).

---

## منابع

| موضوع | URL |
|-------|------|
| Vercel AI SDK | https://sdk.vercel.ai |
| AI Elements (نصب/کامپوننت) | از docs رسمی AI Elements / `npx ai-elements@latest` |
| shadcn پایه | [`shadcn-ui.md`](./shadcn-ui.md) |
| Skill | `npx skills add vercel/ai-elements` |

> هنگام scaffold، URL دقیق نسخه نصب‌شده و package versions را در همین فایل در بخش «Pinned versions» بنویس.

---

## وضعیت در این ریپو

- [x] دانش ثبت شد
- [ ] پروژه scaffold نشده → AI SDK / Elements هنوز نصب نشده
- [ ] Skill هنوز نصب نشده (بعد از shadcn init)

### Pinned versions (پر شود بعد از install)

| Package | Version |
|---------|---------|
| `ai` | TBD |
| `@ai-sdk/*` providers | TBD |
| `ai-elements` / components | TBD |

*هم‌تراز با سند زرین‌پال: UI چت زیرساخت است؛ هسته محصول هنوز از [`zarinpal.md`](./zarinpal.md) می‌آید.*
