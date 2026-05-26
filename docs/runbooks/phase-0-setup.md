# Phase 0 Setup Runbook

**Period:** 2026-05-25 (Days 1-4) + 2026-05-26 (Day 5)
**Outcome:** Funkční dev workflow + production deploy + 4 cloud services + 8 mergedu PRů
**Time spent:** ~10 hodin solo dev s Claude Code podporou

Referenční dokument pro budoucí setup (Phase 1+, případně další solo projekt). Chronologický průchod + gotchas + decisions.

---

## Overview

Phase 0 cílem bylo postavit kompletní dev infrastrukturu pro EdTech projekt (codename `trida`) před prvním řádkem produktového kódu. Zahrnuje:

- Local dev environment (Node, pnpm, git, Cursor)
- Private GitHub repo s branch protection
- Next.js 16 + TypeScript + Tailwind + shadcn/ui scaffolding
- Vercel deploy v Frankfurt regionu
- Supabase (dev + prod), Anthropic (2 klíče), Stripe (test mode), Resend
- Pre-commit hooks + GitHub Actions CI + branch protection s required check
- Claude Code MCP servers (GitHub + Supabase) pro AI-assisted dev
- Decisions log v repo (ADR pattern)

---

## Chronological log

### Day 1 — Local setup + GitHub

**Co se udělalo:**

Instalace Node.js LTS (v24), pnpm (11.3), git CLI, Cursor (3.5). Git global config (jméno + email). Private GitHub repo `trida` vytvořen, lokálně klonován do `C:\Users\TomasHoryna\Documents\Claude Cowork\trida`. Branch protection na `main` (PR-only, linear history, no force pushes, conversation resolution).

**Trvání:** ~1.5 h

### Day 2 — Next.js skeleton + adresářová struktura + Vercel

**Co se udělalo:**

`pnpm create next-app@latest` s customize prompty (TypeScript, ESLint, Tailwind, src/ directory, App Router, **bez** Turbopack, **bez** React Compiler, default `@/*` alias). shadcn/ui init s Nova preset + Radix backend.

Vytvořena kompletní adresářová struktura per `docs/decisions/0001-stack-a-scope.md`: route groups v `src/app/((auth)|(parent)|(student))/`, API v `src/app/api/`, AI vrstva v `src/lib/ai/` (vlastní CLAUDE.md s safety conventions, placeholder client.ts + guardrails.ts), curriculum content mimo src/ v `content/math/grade-{4,5}/fractions/`, supabase/, docs/decisions/, docs/runbooks/, .claude/, .github/workflows/.

CLAUDE.md hierarchie: root (lean pointers) + 6 subdirectory placeholders.

Vercel účet připojen na GitHub, projekt `trida` importovaný, deploy z `main` proběhl (production URL `trida-fawn.vercel.app`). Pak `vercel.json` s `regions: ["fra1"]` (Frankfurt) přidaný v samostatném PR.

**Trvání:** ~2.5 h

### Day 3 — Supabase + Anthropic + env vars

**Co se udělalo:**

Dva Supabase projekty (`trida-dev` + `trida-prod`), oba region Frankfurt (eu-central-1). Security defaults aktualizované: Enable Data API ✓, Automatically expose new tables ☐ (off), Enable automatic RLS ✓ (on). DB passwords vygenerované Supabase, uložené do Bitwarden.

Anthropic účet, billing setup (pre-paid $50), dva API klíče (`trida-dev` $50/měs cap, `trida-prod` $200/měs cap), uložené do Bitwarden.

`.env.local` lokálně s dev klíči. Vercel env vars per environment (Preview + Production), 8 entries celkem, všechny Sensitive.

Smoke test script `scripts/test-env.mjs` napsaný, `pnpm test:env` alias v package.json. Test ověřuje Supabase REST endpoint + Anthropic API call (přes Haiku model).

**Trvání:** ~2 h

### Day 4 — Pre-commit + CI + Stripe + Resend + auto-merge

**Co se udělalo:**

Husky 9 + lint-staged + Prettier setup. `.husky/pre-commit` spouští `pnpm exec lint-staged` + `pnpm exec tsc --noEmit`. `.prettierrc` s LF line endings, 100 col print width. `lint-staged` config v package.json.

GitHub Actions CI workflow (`.github/workflows/ci.yml`): lint + typecheck na PR a push do main. Branch protection rozšířené o required check `Lint + Typecheck` + branches must be up to date.

ESLint config aktualizovaný — `argsIgnorePattern: "^_"` pro underscore placeholder parametry (`_input` v guardrails.ts neproduces warnings).

Stripe účet (test mode) + 2 API klíče (publishable + secret) v Bitwarden. Resend účet + API klíč v Bitwarden. Vercel env vars rozšířené o Stripe + Resend (Preview + Production). Smoke test rozšířený o Stripe + Resend checks.

GitHub CLI 2.92 nainstalovaný + authenticated. Repo settings: `allow_auto_merge=true`, `delete_branch_on_merge=true`. **End-to-end auto-merge cyklus přes Claude Code validován** (PR #8: 3 min od start tasku po merged a branch deleted).

**Trvání:** ~3 h

### Day 5 — MCP servers + Phase 0 closure

**Co se udělalo:**

GitHub Personal Access Token (90-day expiration, scopes: repo + workflow). Supabase Personal Access Token. GitHub MCP server přidaný do `~/.claude.json` přes `claude mcp add` CLI (úspěch). Supabase MCP server přidaný manuálně do `~/.claude.json` (CLI parser pohlcoval `--read-only` a `--project-ref` flags i přes `--` separator).

MCP servery scoped: GitHub má repo + workflow, Supabase má read-only + project-ref `trida-dev` (production úmyslně mimo dosah).

Phase 0 runbook (tento dokument) napsaný. End-of-phase review checklist (viz konec).

**Trvání:** ~1.5 h

---

## Decisions made

| Rozhodnutí                      | Důvod                                                          | Alternativa zamítnuta                                                |
| ------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------- |
| Codename `trida`                | Krátké, české, polysem, brand-friendly                         | `cermat-prep` (úzké), `edtech-mvp` (nudné)                           |
| Next.js 16 + App Router         | AI-friendly, největší Claude Code dataset, fast deploy         | Vue/Nuxt, .NET (Tom má background ale ekosystém slabší)              |
| Tailwind v4 + shadcn/ui (Nova)  | Hotová UI bez designerského pekla, Radix accessibility         | Material UI, custom CSS                                              |
| Supabase pro auth + DB          | Auth + Postgres + Storage + pgvector v jednom                  | Auth0 + RDS, Firebase (vendor lock)                                  |
| Anthropic Claude                | Sonnet pro výklad, Haiku pro klasifikace                       | OpenAI GPT (méně Claude Code synergy)                                |
| Stripe (test mode pro Phase 0)  | Industry standard SaaS billing, Claude Code support            | GoPay (CZ-only, slabší DX)                                           |
| Resend                          | Transakční email API-first                                     | M365 SMTP (rate limits, bad deliverability), SendGrid (víc overhead) |
| Vercel                          | Next.js native, free tier dostačující                          | Cloudflare Pages (full-stack komplikovanější), AWS Amplify           |
| Frankfurt region                | GDPR + nejnižší latence pro CZ uživatele                       | Ireland (eu-west), USA (špatná latence)                              |
| Squash merge default            | Čistá main history bez commit-spamu z feature branch           | Merge commit (clutter), rebase merge (rewrites locally)              |
| Gitflow NE                      | Overkill pro solo, branch protection postačuje                 | develop/release/hotfix branches                                      |
| `--read-only` na Supabase MCP   | Bezpečnost, Claude Code nemůže destructive queries v Phase 0-2 | Full access (riziko omylem-DROP TABLE)                               |
| MCP server scope na `trida-dev` | Claude Code nemá přístup k production data                     | Multi-project scope (širší blast radius)                             |
| Bitwarden master copy secrets   | Existující Tom workflow, nevyžaduje nový tool                  | 1Password, GitHub Secrets only (těžší rotace)                        |

---

## Gotchas + resolutions

### pnpm 11 ignored builds

**Problém:** `pnpm install` selhal s `[ERR_PNPM_IGNORED_BUILDS]` pro `sharp` (image processing), `msw` (testing), `unrs-resolver` (ESLint).

**Důvod:** pnpm 11+ defaultně blokuje postinstall scripts kvůli supply chain attack prevention.

**Řešení:** `pnpm approve-builds` → vybrat balíčky (Space toggle, Enter confirm) → retry `pnpm install`. Approval se uloží do projekt configu.

### Supabase API key format change (2025)

**Problém:** Supabase dashboard ukazoval klíče s prefixem `sb_publishable_*` a `sb_secret_*`, ale dokumentace a Vercel UI naváděly na `eyJ*` (JWT) format.

**Důvod:** Supabase v 2025 migrovala API keys ze starého JWT formátu na nový human-readable. Oba formáty fungují, ale nový je preferovaný.

**Mapping:**

- `sb_publishable_*` = bývalý `anon` key (public, frontend OK)
- `sb_secret_*` = bývalý `service_role` (secret, backend only)

**Řešení:** Nový formát použít přímo. Aktualizovaný `.env.local.example` template aby reflektoval nový naming.

### GitHub Secret Scanning false positive

**Problém:** Po commitu `.env.local.example` s placeholder hodnotami typu `whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` GitHub odpálil alert "Stripe Webhook Signing Secret detected".

**Důvod:** GitHub Secret Scanning matchuje regex prefix patterns (`whsec_`, `sk_test_`, `sk-ant-`, `re_`). I fake placeholder s prefixem triggernul alert.

**Řešení:** Použít angle-bracket placeholdery v templatu (`<your_stripe_webhook_signing_secret>` místo `whsec_xxx`). Dismiss alerta v GitHub Security panelu jako "False positive".

**Lesson:** Pro env templates používat `<...>` formát od začátku, ne fake hodnoty s real prefixem.

### Brackets v `.env.local` hodnotách

**Problém:** Smoke test `pnpm test:env` selhal s `Failed to parse URL from <https://glmaopclcacubsblpota.supabase.co>/rest/v1/`.

**Důvod:** Tom při kopírování hodnot z template do `.env.local` nechal angle brackets `<` a `>` okolo skutečných hodnot.

**Řešení:** Odstranit brackets. Templates mají `<placeholder>`, skutečné hodnoty bez brackets.

### PowerShell auto-execute na newline

**Problém:** Když Tom paste command obsahující newline do PowerShellu (z Cowork chatu), PS to ihned spustí. Nemůže command editovat před execute (např. nahradit placeholder skutečným tokenem).

**Řešení:** `Read-Host` pattern pro secrets:

```powershell
$token = Read-Host -Prompt "Paste token"
claude mcp add -e "GITHUB_TOKEN=$token" -- ...
```

PowerShell pauznuje, Tom paste token + Enter, proměnná je v session bez execute issue.

### PowerShell + `<paste-placeholder>` syntax

**Problém:** Když Tom nechal `<paste-github-pat>` literal v command, PowerShell parser interpretoval `<` jako input redirection (`<file`), pak fallthrough na ambiguous flag matching → cryptic Get-Process error.

**Řešení:** Vždy nahradit placeholder skutečnou hodnotou před execute. Nikdy nepoužívat angle brackets v PowerShell commands literally.

### Claude Code CLI `--` separator nefunguje plně

**Problém:** `claude mcp add ... -- npx ... --some-flag` — Claude Code pohlcoval `--some-flag` jako vlastní option i přes `--` separator.

**Konkrétně:** `-y`, `--read-only`, `--project-ref=...` všechno spadlo do "unknown option" error.

**Pokusy:** Quoting (PowerShell ho odstranil), array splat (stejný issue), bez `--` (PowerShell parser konzumoval `--`), různé pořadí flagů.

**Řešení:** Editovat `~/.claude.json` manuálně pro complex MCP server configs. `claude mcp add` CLI funguje pro jednoduché cases (žádné flags v server args), pro složitější přidat ručně.

**Lesson:** Pro budoucí MCP servery jít rovnou přes config edit, ne CLI.

### gh auth login je interactive

**Problém:** `gh auth login` vyžaduje browser OAuth flow. Claude Code session subprocess to nezvládne.

**Řešení:** Tom musí spustit `gh auth login` manuálně v PowerShellu před prvním Claude Code task který používá gh. Po jedné autentizaci trvale v `~/.config/gh/hosts.yml`.

### Squash merge "is not fully merged" warning

**Problém:** Po PR squash merge je commit hash na main jiný než na feature branche. `git branch -d feature/xyz` říká "is not fully merged" a refuses delete.

**Důvod:** Z git's pohledu lokální feature branch a main mají rozdílné commit hashes (squash merge vytváří nový commit).

**Řešení:** Použít `git branch -D` (capital D, force delete). Pro squash merge workflow je to standard cleanup, žádné risk dat (vše už je v main jako squash commit).

### Vercel build region vs runtime region

**Problém:** Vercel build log ukazoval `Washington D.C. (iad1)` jako region. Cítil jsem se zmatený — chtěli jsme Frankfurt.

**Důvod:** Vercel build infrastruktura (kde se kompiluje) je centralizovaná (iad1), oddělená od runtime region (kde běží funkce po deployi).

**Řešení:** Pro runtime Frankfurt přidat `vercel.json` s `"regions": ["fra1"]`. Build region nelze na Hobby plánu měnit, ale runtime je co skutečně ovlivňuje latence.

### Cowork session nemůže psát do `.claude/`

**Problém:** Při psaní `.claude/settings.json` přes Cowork Write tool → error "outside this session's connected folders".

**Důvod:** Cowork session má protected location pro `.claude/` adresář (možná kvůli session integrity s Claude Code config conflict).

**Řešení:** Tom vytvořil `.claude/settings.json` + `.claude/{commands,hooks}/.gitkeep` ručně přes PowerShell `Out-File` heredoc syntax.

### Cowork session nemůže vytvořit nové top-level adresáře v P:\EdTech

**Problém:** Pokus o Write `P:\EdTech\_Bridge\claude-code-task.md` → error "outside this session's connected folders".

**Důvod:** Write tool vyžaduje existující parent directory. `_Bridge` adresář ještě nebyl vytvořen.

**Řešení:** Použít existující `P:\EdTech\_Master\` pro Claude Code bridge files. Není to nejčistší (mixes strategy docs s bridge files), ale funguje.

---

## Lessons learned

**1. Krok-za-krokem workflow je nutný pro AI-assisted dev s beginner.** Tom má ops/PM background, ne dev. Detailní instrukce s exact commands + verify steps po každém substepu eliminuje copy-paste errors. Bez toho by tempo bylo 3x pomalejší.

**2. Cowork mode + Claude Code bridge je legit produktivní pattern.** Cowork pro strategy + UI clicks + reviews, Claude Code pro CLI/git/build grunt work. Dnes 4 cykly proběhly za <15 min total (vs. ~45 min při čistě Cowork-driven flow).

**3. Pre-commit hooks od day 1 šetří hodně grief.** Linter + formatter + typecheck na commit time chytá ~70 % nesmyslů, které by jinak prošly do CI. Setup 20 min, ROI okamžitý.

**4. Branch protection s required CI od dne 2.** Bez toho by Claude Code (nebo já) mohlo cokoli mergnout do main. CI check + PR-only workflow eliminuje "ups, rozbil jsem main" scenarios.

**5. Buy/build princip dodržovat striktně.** Každé "ale stavím to sám" rozhodnutí o auth/payments/email by projekt zpomalilo o měsíce. Supabase Auth, Stripe, Resend, Vercel deploy = nakoupit a integrovat, ne reinventing.

**6. Environment separation od dne 1.** Dva Supabase projekty (`trida-dev` + `trida-prod`) od počátku, Vercel env vars per environment, Anthropic 2 klíče. Bez toho by riziko zničení production data bylo permanentní.

**7. Secret hygiene matters.** Bitwarden master copy, `.env.local` gitignored, Vercel env vars Sensitive, secret scanning false positive vyřešen. Žádný klíč v repo, žádný v chat history, žádný v commit messages.

**8. ADR (Architecture Decision Records) v repo jsou worth it.** `docs/decisions/0001-stack-a-scope.md` má ~300 řádků formálního rationale pro každé rozhodnutí. Trvalo to ~30 min napsat, ale stane se trvalou referencí pro budoucí debaty "proč jsme to udělali takhle".

**9. MCP přes manual config edit > CLI.** `claude mcp add` CLI parser je křehký na complex server args. Direct edit `~/.claude.json` je rychlejší a spolehlivější pro production setups.

**10. Read-only MCP scope = default.** Supabase MCP scoped na `trida-dev` (NE prod) + `--read-only` flag = Claude Code nemůže destructive operations. Trade-off bezpečnost > flexibility, hlavně v Phase 0-2 kdy se učíme.

---

## Reference

### Services + Accounts

| Service   | URL                                              | Účel                             |
| --------- | ------------------------------------------------ | -------------------------------- |
| GitHub    | https://github.com/TomasHoryna/trida             | Source control, CI               |
| Vercel    | https://vercel.com/tomas-horyna-s-projects/trida | Hosting, edge, preview deploys   |
| Supabase  | https://supabase.com/dashboard                   | DB + Auth + Storage (dev + prod) |
| Anthropic | https://console.anthropic.com                    | Claude API (dev + prod klíče)    |
| Stripe    | https://dashboard.stripe.com                     | Payments (test mode)             |
| Resend    | https://resend.com                               | Transakční email                 |
| Bitwarden | (local app)                                      | Secret store (master copy)       |

### Production URL

https://trida-fawn.vercel.app

### Local repo

`C:\Users\TomasHoryna\Documents\Claude Cowork\trida`

### Bridge files (Cowork ↔ Claude Code)

`P:\EdTech\_Master\claude-code-task.md` + `claude-code-result.md`

### CLAUDE.md hierarchie

- Root: `CLAUDE.md`
- `src/app/CLAUDE.md`, `src/app/api/CLAUDE.md`
- `src/components/CLAUDE.md`
- `src/lib/CLAUDE.md`, `src/lib/ai/CLAUDE.md`
- `content/CLAUDE.md`
- `supabase/CLAUDE.md`

### Tooling versions (k 2026-05-26)

- Node.js LTS v24
- pnpm 11.3
- git 2.54 (Windows)
- Cursor 3.5
- GitHub CLI 2.92
- Next.js 16.2.6
- TypeScript 5.9
- Tailwind 4.3
- shadcn/ui (latest, Nova preset, Radix backend)
- Husky 9.1.7, lint-staged 17.0.5, Prettier 3.8.3
- Supabase MCP (latest), GitHub MCP (latest)

---

## Definition of Done (Phase 0)

Z `P:\EdTech\_Master\Phase_0_Plan.md`:

- [x] Tom umí udělat: branch → edit → commit → push → PR → merge → prod deploy bez tahání za rukáv
- [x] CI běží automaticky na každý PR
- [x] Pre-commit hook chytá lint/type errors
- [x] Dva Supabase projekty existují, jsou propojené přes env vars
- [x] Anthropic API klíče fungují (smoke test `pnpm test:env`)
- [x] CLAUDE.md hierarchie je hotová
- [x] Decisions log a Phase 0 runbook jsou v repo

Bonus deliverables (nad rámec původního plánu):

- [x] Stripe + Resend setup (původně parkováno do Fáze 4)
- [x] GitHub CLI 2.92 + auto-merge cyklus přes Claude Code
- [x] MCP servery (GitHub + Supabase) pro Claude Code
- [x] Smoke test rozšířený o všechny 4 cloud services

**Phase 0 = HOTOVO.** Připraveno na Phase 1 (project skeleton + auth + DB schema).

---

## Phase 1 prep notes

Před začátkem Phase 1 (pravděpodobně 27.5.2026):

- Adélin rozhovor summary (5 otázek z 25.5.) → integrovat do `parent-interview-guide.md`
- Self-reflection Q3-Q5 (pauznuté z 17.5.) → offline summary
- Phase 1 plán: project skeleton + Supabase Auth + první DB schema (users, parents, students, parent↔student relationship) + Hello-world authenticated page
- Odhad: 7-10 dnů full-time

Phase 1 půjde primárně přes Claude Code (CLI work — DB migrations, auth flows, components). Cowork pro strategic decisions, Adélin feedback integration, code reviews.
