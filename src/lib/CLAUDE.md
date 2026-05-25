# src/lib/ — Shared utilities + service wrappers

## Adresáře

- `supabase/` — Supabase client + queries + DB types
- `stripe/` — Stripe client + checkout helpers + webhook handlers
- `resend/` — Email sending wrappers + templates
- `ai/` — Anthropic Claude wrapper + prompty + guardrails (**core proprietary value**)
- `utils.ts` — obecné helpery (`cn()`, formátování dat, atd.)

## Conventions

- Každý service má vlastní `index.ts` re-export
- Server-only kód má `import 'server-only'` na začátku (build-time check)
- Žádný secret keys v code, vše přes env vars (`process.env.XYZ`)
- Pure functions kdykoli to jde (snáz testovatelné)
- Side effects (DB queries, API calls) jsou explicit async functions

## Imports

- Service from a feature: `import { supabase } from '@/lib/supabase'`
- Single helper: `import { cn } from '@/lib/utils'`

## Testing

Unit testy ve Fáze 1 (Vitest). Test soubory `*.test.ts` vedle source filu.

## Důležité

- AI vrstva (`src/lib/ai/`) má vlastní CLAUDE.md s safety pravidly. Read it BEFORE any AI-related change.
