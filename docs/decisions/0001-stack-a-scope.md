# ADR 0001: Stack, scope, dev workflow

**Datum:** 2026-05-25
**Status:** accepted
**Reviewers:** Tom (solo dev, single approver), Claude (architectural advisor)

---

## Context

Spouštíme EdTech projekt — přípravka přijímaček do 5. třídy ZŠ. Solo dev (Tom), 14-týdenní MVP deadline (srpen 2026), Sam (Tomův syn) jako primary tester od září 2026.

Před prvním řádkem produktového kódu commitujeme stack, scope a workflow, aby pozdější rozhodnutí mohly stavět na sjednocené bázi.

## Decision

### 1. Codename projektu

**`trida`** jako working title pro repo, Vercel project, Supabase projekty, a všechny interní reference. Doménová strategie parkována (kandidáti `.online`, `.eu`, případně alternativní název na `.cz`).

### 2. Tech stack

| Vrstva | Volba |
|---|---|
| Frontend | Next.js 16 (App Router, TypeScript) + Tailwind v4 + shadcn/ui (Nova preset, Radix backend) |
| Backend | Next.js API routes + Supabase (PostgreSQL + Auth + Storage + pgvector) |
| AI | Anthropic Claude API (Sonnet + Haiku) + Vercel AI SDK pro streaming |
| Payments | Stripe (CZK + EUR, test mode dev) |
| Email | Resend (transakční) |
| Hosting | Vercel (Frankfurt region) |
| Supabase region | Frankfurt (eu-central-1) |

### 3. Multiplatform strategie

API-first backend, web first (responsivní). Native mobile (React Native nebo Flutter) až po validaci v Fázi 5+. **Compose Multiplatform odmítnuto** (Kotlin learning curve, slabá Claude Code podpora, nedospělý web target přes WebAssembly/Canvas).

### 4. Cesta dev

A = AI-assisted dev s Claude Code + Cursor jako primary editor.

### 5. MVP scope (varianta C)

Zlomky pro 4. třídu + zlomky pro 5. třídu **paralelně**. Datový model ročník-agnostic od dne 1 (subject + topic + grade). Žádné jiné téma ani předmět ve Fázi 0-3.

### 6. Validation strategy

- Sam (od září 2026 ve 4. třídě) = 4. třída content validation + UX/engagement
- Cílový uživatel = 5. třída přípravka na přijímačky, 2-3 děti přes Tomovy kontakty
- Adélin feedback (rozhovor 26.5.2026) integrovat do parent-interview-guide.md

### 7. AI safety jako pracovní balík od day-one

Strict system prompty, input/output guardrails, rate limit, token budget per session, logování konverzací, GDPR pro dětská data. Viz `src/lib/ai/CLAUDE.md`.

### 8. Buy / build pravidlo

**Buy/integrate:** Supabase Auth, Stripe, Resend, Supabase Storage, Anthropic API.
**Build:** UI/UX, content, adaptive engine, student model, AI prompty + guardrails, reporting.

### 9. Adresářová struktura

Optimalizováno pro navigability + scaling. Detail v `CLAUDE.md` (root) a subdirectory CLAUDE.md files.

Klíčové: `src/lib/ai/` jako vlastní adresář pro proprietary AI vrstvu. `content/` mimo `src/` (data, ne kód). `docs/decisions/` pro ADRs.

CLAUDE.md hierarchie: root (lean) + 6 subdirectory placeholders.

### 10. Git workflow

- `main` = production-deployable, branch protection, PR-only
- `feature/<name>` branches, krátké (1-3 dny max)
- PR → CI green → squash merge
- Conventional Commits style (`feat:`, `fix:`, `chore:`, `refactor:`)
- Semver tagy pro releases (v0.1.0, v0.2.0)
- **Gitflow odmítnuto** (overkill pro solo)

### 11. MCP / tooly napojení

Fáze 0: GitHub MCP + Supabase MCP.
Fáze 2-3: Vercel MCP + Stripe MCP.
Skip: Slack/email integrace, custom MCP servery.

### 12. Validation vrstvy + sequencing

| Fáze | Validation layer |
|---|---|
| Fáze 0 | Static analysis (TS strict + ESLint + Prettier) + pre-commit hook + GitHub Actions skeleton |
| Fáze 1 | Vitest setup + unit testy auth + `/review` Claude Code slash command |
| Fáze 2 | Integration testy (Vitest + Supabase test DB) + Supabase migrace přes CLI |
| Fáze 3 | Playwright 2-3 E2E happy paths + AI eval suite |
| Fáze 4 | Smoke testy po prod deploy + email alert |
| Fáze 5 | E2E expanse + Sentry + AI eval expanse |

**Pravidlo:** Claude Code nesmí commitovat přímo do main. Vždy feature branch → PR → CI → squash merge.

### 13. Environments

Tři, žádný explicit staging (preview = staging):
- Local: notebook + `pnpm dev`, connected na shared dev Supabase
- Preview: Vercel auto-creates pro každý PR, connected na shared dev Supabase
- Production: main branch → production URL, connected na production Supabase + Stripe live + production Anthropic klíče

### 14. Database environments

Dva Supabase projekty od dne 1: `trida-dev` + `trida-prod`. NIKDY nesdílet production DB s dev/preview. Migrace vždy backwards-compatible.

### 15. Secrets + rollback

- `.env.local.example` v repo (template). `.env.local` lokálně (gitignored).
- Vercel env vars per environment.
- Bitwarden master copy.
- Anthropic dva klíče (dev $50/měs cap, prod $200+/měs cap).
- Rollback: revert PR → Vercel auto-deployne starou verzi.
- DB rollback: Supabase daily backup (free tier 7 dnů) + backwards-compatible migrace.

## Consequences

**Pros:**
- Konzistentní base pro celý projekt
- Claude Code v Next.js / TypeScript / Supabase nejproduktivnější
- Žádný vendor lock (PostgreSQL standard, Stripe standard, React standard)
- Multiplatform-ready přes API-first design
- AI safety enforced od day 1, ne přilepené pozdě

**Cons:**
- Tom musí naučit Next.js + git CLI workflow (Fáze 0-1 učení)
- Tři environments mírně víc setup než single-environment MVP
- AI guardrails přidávají 1-2 týdny vývoje navíc

**Mitigations:**
- Phase 0 plán zahrnuje git CLI orientation (Den 1, volitelně)
- Vercel + Supabase auto-create environments, manual config minimal
- AI guardrails jsou design priorita od dne 1, ne refactor later

## Open questions (parkováno)

- Vlastní doména (týden 4-6)
- Branding, logo, vizuál (default shadcn pokryje měsíce)
- Stripe live mode (Fáze 5+)
- Resend custom doména (zatím `*.resend.dev`)
- Skills v Claude Code (Fáze 4+)
- Observability (Sentry, Fáze 5+)

## Souvisí

- `P:\EdTech\_Master\EdTech_Project.md` — master strategy (mimo repo)
- `P:\EdTech\_Master\Phase_0_Plan.md` — akční plán prvních 5 dnů (mimo repo)
- `CLAUDE.md` (root) — orientace v repu
- `docs/architecture.md` — high-level architecture
