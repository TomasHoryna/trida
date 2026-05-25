# src/app/ — Next.js App Router

Routes pro celou aplikaci. Server Components by default. Client Components (`"use client"`) jen tam, kde je potřeba (state, browser API, event handlery).

## Route groups

- `(auth)/` — login, signup, password reset
- `(parent)/` — parent dashboard, profil dítěte, reporting
- `(student)/` — student learning interface, řešení úloh, výklad
- `api/` — API routes (REST endpoints)

Závorky kolem názvu route group **neovlivňují URL path**, jen organizují soubory.

## File conventions (Next.js App Router)

- `page.tsx` = route entry point (renders the URL)
- `layout.tsx` = shared layout pro children routes (persists across navigations)
- `loading.tsx` = loading UI (React Suspense fallback)
- `error.tsx` = error boundary
- `not-found.tsx` = 404 handler
- `route.ts` v `api/` = HTTP method handlery (GET, POST, ...)

## Gotchy

- Supabase server-side: použij `@supabase/ssr` v Server Components a Server Actions. Nikdy ne `@supabase/supabase-js` přímo z Server Component, RLS by se neaplikovaly.
- Server Actions místo API routes pro form submissions kdykoli to jde (jednodušší typing, méně boilerplate, automatic CSRF).
- Žádný `useEffect` v Server Component (compile error). Pokud potřebuješ side effect, je to znak že komponenta má být Client.
