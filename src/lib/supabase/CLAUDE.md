# src/lib/supabase/ — Supabase client utilities

## Soubory

- `client.ts` — browser client (pro Client Components, používá `"use client"`)
- `server.ts` — server client (pro Server Components, Server Actions, Route Handlers)
- `middleware.ts` — middleware helper (volaný z `src/proxy.ts` — Next.js 16.2 přejmenoval entrypoint, helper si zachoval název)

## Pravidla

- **NIKDY nepoužívat `@supabase/supabase-js` přímo.** Vždy přes `@supabase/ssr` (cookie-based session, SSR-friendly).
- **Server Components / Server Actions / Route Handlers:** import z `./server`
- **Client Components:** import z `./client`
- **Middleware:** automaticky volá `updateSession` z `./middleware`

## Auth flow (Phase 1)

- Rodič: Supabase Auth (email + password), session přes cookies, refresh token 90 dnů
- Dítě: NEMÁ Supabase Auth account. Místo toho PIN-based "kid mode" v aplikaci (Phase 1 Day 4)

## Bezpečnostní pravidla

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` je veřejný (frontend OK, RLS chrání data)
- `SUPABASE_SERVICE_ROLE_KEY` je secret (jen server-side, bypassuje RLS, admin operations)
- Nikdy nelogovat session tokeny nebo user IDs do console.log v production
