# trida — EdTech příprava přijímaček 5. třída ZŠ

Next.js 16 + Supabase + Anthropic API + Stripe + Resend. Hosted on Vercel.
MVP deadline: srpen 2026.

## Architecture
See `docs/architecture.md` and `docs/decisions/`.

## Critical gotchas
- AI vrstva má vlastní safety conventions. Read `src/lib/ai/CLAUDE.md` BEFORE
  changing any AI-related code.
- DB schema má RLS policies. Read `supabase/CLAUDE.md` before any migration.
- Never log AI conversations to console in production. Use logger from
  `src/lib/utils.ts` (TBD Fáze 1).
- Secrets jen v env vars (Vercel + .env.local). Nikdy v CLAUDE.md, commit
  messages, nebo zdrojovém kódu.

## Where to look
- Routes: `src/app/`
- Components: `src/components/`
- AI vrstva: `src/lib/ai/`
- DB migrations: `supabase/migrations/`
- Content (úlohy): `content/`
- Decisions log: `docs/decisions/`
- Architecture: `docs/architecture.md`

## Conventions
- TypeScript strict mode, no `any` without explanatory comment
- Tailwind utilities, no custom CSS unless necessary
- Server Components by default, `"use client"` only when needed
- Conventional Commits for messages (`feat:`, `fix:`, `chore:`, `refactor:`)
- File names: PascalCase for components, kebab-case pro non-component soubory

## Running locally
- `pnpm install` — install deps
- `pnpm dev` — dev server on http://localhost:3000
- `pnpm lint` — ESLint
- `pnpm tsc --noEmit` — TypeScript typecheck
- `pnpm build` — production build (smoke test before merge)

## Git workflow
- `main` = production-deployable, branch protection. PR-only.
- `feature/<name>` branches, short-lived (1-3 dnů max)
- PR → CI → squash merge
- Conventional Commits style

## Target users
- **Student:** dítě ZŠ, 4.-5. třída, řeší úlohy z matematiky (zlomky)
- **Parent:** rodič, vidí pokrok dítěte, dostává tipy

## MVP scope
Zlomky pro 4. třídu + zlomky pro 5. třídu paralelně. Datový model ročník-agnostic.

## Stack details
- Frontend: Next.js 16 (App Router, TypeScript) + Tailwind v4 + shadcn/ui (Nova preset)
- Backend: Next.js API routes + Supabase (PostgreSQL + Auth + Storage + pgvector)
- AI: Anthropic Claude (Sonnet + Haiku) + Vercel AI SDK
- Payments: Stripe (test mode dev, live mode později)
- Email: Resend (transakční)
- Hosting: Vercel (Frankfurt region)
- Supabase region: Frankfurt (eu-central-1)
