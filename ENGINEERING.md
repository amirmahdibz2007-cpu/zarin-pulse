# Engineering Red Line — Hackathon Session

This workspace is under a **non-negotiable engineering bar** for the Starcoach vibe-coding hackathon.

Enforced by: [`.cursor/rules/hackathon-engineering-redline.mdc`](.cursor/rules/hackathon-engineering-redline.mdc) (`alwaysApply: true`).

## Contract

| Principle | Meaning |
|-----------|---------|
| Extreme detail | Schemas, contracts, acceptance criteria, failure modes — not vibes |
| One vertical slice | Complete path > many stubs |
| Demo-ready | Every slice must be showable in ≤3 minutes |
| Deploy-aware | Liara / Arvan / env / secrets treated as first-class |
| Honest limits | Known gaps written down, never sold as done |
| UI standard | React frontend → shadcn/ui + Tailwind; see [`docs/research/shadcn-ui.md`](docs/research/shadcn-ui.md) |
| AI / Chat | Vercel AI SDK + AI Elements on top of shadcn; see [`docs/research/vercel-ai-sdk.md`](docs/research/vercel-ai-sdk.md) |
| Design inspiration | Material / Ant / Carbon / Fluent / Bootstrap Figma as **pattern refs only**; implement via shadcn — [`docs/research/design-systems.md`](docs/research/design-systems.md) |

## Before any feature

1. Problem (one sentence)
2. Acceptance criteria (Given / When / Then)
3. Non-goals
4. Data + API sketch
5. Demo script

## Definition of Done

Happy path E2E · one failure handled · run/test docs · demo path · known limits listed.

If a change violates this file, it does not ship in this session.
