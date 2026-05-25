# src/app/api/ — API Routes

REST API endpoints. JSON only. Konzumují web client (Next.js frontend), budoucí mobilní appka, a interní webhooks.

## Conventions

- `route.ts` exportuje HTTP method handlery (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`)
- Vždy validate input přes zod schema (žádný unsafe `body.something`)
- Vždy typed response (TypeScript interface, ideálně sdílená v `src/types/`)
- Error handling: try/catch + structured response `{ error: string, code: string }`
- HTTP status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error

## Naming

- REST style, nested resources: `/api/students/[id]/exercises`
- AI endpoints v `/api/ai/` namespace: `/api/ai/explain`, `/api/ai/hint`
- Webhooks v `/api/webhooks/` namespace: `/api/webhooks/stripe`, `/api/webhooks/resend`

## Auth check

Každý endpoint musí na začátku ověřit session (helper TBD ve Fáze 1). Public endpoints (např. homepage data) označit explicit komentářem `// PUBLIC ENDPOINT — no auth check`.

## Supabase client choice

- **User context client** (default): respektuje RLS policies, používá session JWT
- **Service-role client**: bypass RLS, jen pro admin operations nebo system tasks (data ingestion, background jobs)

## AI endpointy

Volání Anthropic API jdou výhradně přes `src/lib/ai/client.ts`. Nikdy přímý `fetch` ani `new Anthropic()` v API route.

## Rate limiting

Public endpoints + AI endpoints mají rate limit (TBD Fáze 3, pravděpodobně Upstash Redis nebo Vercel KV). Default: 60 req/min per IP, 20 req/min per user pro AI.
