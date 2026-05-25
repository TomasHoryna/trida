# Architecture

High-level architecture pro trida (EdTech přípravka přijímaček 5. třída ZŠ).

Tento dokument vyplníme do detailu ve Fáze 1-2, jakmile bude reálný kód. Pro teď: stack overview a key principles.

## Stack overview

| Vrstva | Technologie | Důvod |
|---|---|---|
| Frontend | Next.js 16 (App Router, TypeScript) | React-based, AI-friendly, SSR |
| Styling | Tailwind v4 + shadcn/ui (Nova preset) | Rychlý design, Radix accessibility |
| Backend | Next.js API routes + Server Actions | Co-located s frontend, deploy-on-Vercel friendly |
| Database | Supabase (managed PostgreSQL) | Auth + Storage + Realtime + pgvector v jednom |
| Auth | Supabase Auth | Email + magic link + OAuth, RLS integration |
| AI | Anthropic Claude API (Sonnet + Haiku) | Tutoring, výklad, hint generation |
| AI streaming | Vercel AI SDK | Stream Claude responses do UI |
| Payments | Stripe (Subscription, Checkout, Billing Portal) | Industry standard, CZK + EUR |
| Email | Resend | Transakční (welcome, reset, faktury) |
| Hosting | Vercel | Next.js native, free tier dostatečný na MVP |
| Region | Frankfurt (eu-central-1) | GDPR + nejnižší latence pro CZ uživatele |

## Key principles

- **API-first.** Backend je REST + Server Actions, klient-agnostic. Mobilní appka v budoucnu (React Native nebo Flutter) konzumuje stejné API.
- **Buy commodity, build proprietary.** Auth, payments, email, LLM, storage = nakoupit. UI, content, adaptive engine, student model, AI prompty + guardrails = stavět.
- **AI safety from day one.** Strict prompts, input/output guardrails, rate limit, logging, GDPR. Viz `src/lib/ai/CLAUDE.md`.
- **Server Components default.** Client jen kde nutné (state, browser API, event handlery).

## Diagram

(TBD Fáze 1, mermaid diagram s data flow.)

## Související

- `docs/decisions/0001-stack-a-scope.md` — formální rationale pro každé technologické rozhodnutí
- `CLAUDE.md` (root) — orientace v repu
- `src/lib/ai/CLAUDE.md` — AI safety pravidla
- `supabase/CLAUDE.md` — DB pravidla
