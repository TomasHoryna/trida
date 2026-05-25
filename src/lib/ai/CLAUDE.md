# src/lib/ai/ — AI vrstva (Anthropic Claude)

**KRITICKÝ ADRESÁŘ. Read this BEFORE any AI-related change.**

Core proprietary value projektu. Tady se rozhoduje, jak se AI chová k dětem.

## Soubory

- `client.ts` — Anthropic SDK wrapper, retry logic, token tracking, logování
- `guardrails.ts` — input/output filtering (off-topic detection, jailbreak prevention, PII scrubbing)
- `prompts/` — system prompty jako TypeScript moduly (versioned, testovatelné)

## Bezpečnost — pravidla, která se NESMĚJÍ porušit

### 1. Strict system prompty

Každé volání Claude API má system prompt, který:

- Definuje, že jde o edukační asistent pro děti ZŠ
- Zakazuje téma mimo školní učivo (matematika ve Fáze 0-3)
- Zakazuje sdílet osobní data nebo se jich ptát
- Zakazuje hodnotit dítě negativně, ironicky, sarkasticky
- Definuje úroveň jazyka (věk-přiměřená, srozumitelná, krátké věty)

### 2. Input filtering

Před voláním Claude:

- Detekce jailbreak pokusů (známé patterny: "ignore previous", "pretend you are", atd.)
- Detekce off-topic dotazů (mimo matematiku / RVP)
- Detekce osobních dat v inputu (email, telefon, jméno cizí osoby)

### 3. Output guardrails

Po odpovědi Claude:

- Verifikace, že odpověď neobsahuje URL na externí weby
- Verifikace, že odpověď neobsahuje email/telefon
- Verifikace, že odpověď neopustila edu kontext
- Sanitizace markdown (žádné HTML, žádné `<script>`)

### 4. Rate limit + token budget

- Per session limit (TBD počty, Fáze 3)
- Per user denní limit (cost control + abuse prevention)
- Per request max_tokens cap

### 5. Logování

Každé volání Claude se loguje do audit DB tabulky:

- Timestamp
- User ID (hashed pro GDPR)
- Input (zkrácený / sanitized)
- Output (zkrácený)
- Model + tokens used + latency
- Verdict guardrails (allowed / blocked + reason)

**Nikdy `console.log` v production.** Vždy strukturovaný logger.

### 6. Žádný secret v promptu

API klíče, DB credentials, internal IDs nikdy do system promptu nebo user message.

## Modely

- **Claude Sonnet 4.6** (`claude-sonnet-4-6`) — výklad, tutoring, hint generation (kvalita > rychlost > cena)
- **Claude Haiku 4.5** (`claude-haiku-4-5-20251001`) — klasifikace odpovědí, generování distraktorů, lightweight tasks (rychlost + cena > kvalita)

## Testing

AI behavior eval suite v `tests/ai-evals/` (Fáze 3). Každý prompt má eval set:

- Jailbreak attempts (10+ známých patternů)
- Off-topic dotazy (5+ kategorií: gaming, drogy, sex, politika, osobní)
- Edge cases (prázdný input, extrémně dlouhý input, non-CZ jazyk)
- Faktickost (známé úlohy s ground truth odpovědí)

## GDPR

- Dětská data (input, output, mastery state) — minimální retention (TBD)
- Rodič může requestnout export + delete (GDPR čl. 15, 17)
- Audit log retained 90 dnů pro abuse detection, pak anonymizován
