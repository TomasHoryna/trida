# content/ — Curriculum content (data, ne kód)

Úlohy, výklad, hint texts, modal varianty. Data jsou typed (JSON schemas v `_schema/`).

## Struktura

- `math/grade-4/fractions/` — zlomky 4. třída
- `math/grade-5/fractions/` — zlomky 5. třída (přípravka na přijímačky)
- `_schema/` — JSON schemas (exercise.schema.json, lesson.schema.json, atd.)

## Conventions

- Jeden soubor per úlohu, jméno `<slug>.json` (např. `zlomky-zakladni-pojmy-01.json`)
- Každá úloha má unikátní ID (human-readable slug, ne UUID — pro debug visibility)
- Modal varianty (text/image/audio/video) v jednom souboru pro úlohu
- Vždy validate proti JSON schema před commitem (CI check ve Fáze 2)

## Schema (TBD Fáze 2)

Příklad exercise:

```json
{
  "id": "zlomky-zakladni-pojmy-01",
  "grade": 5,
  "subject": "math",
  "topic": "fractions",
  "subtopic": "basic-concepts",
  "difficulty": 1,
  "type": "multiple-choice",
  "modals": {
    "text": { ... },
    "image": { "url": "..." },
    "audio": { "url": "..." },
    "video": null
  },
  "question": "...",
  "answers": [...],
  "correctAnswer": "...",
  "explanation": "..."
}
```

## Copyright

Úlohy musí být **originální**, ne kopie z učebnic Fraus, SPN, Cermat, Nová škola, Prodos, Didaktis. Použít je jako referenci pro design (témata, obtížnost, RVP coverage), ne pro text/obrázky.

## Jazyk

- Čeština (cílový trh CZ)
- Věk-přiměřený jazyk (4. třída = 9-10 let, 5. třída = 10-11 let)
- Kratší věty, jednoduché konstrukce, žádné cizí slova bez vysvětlení
- Pozitivní tón ve výkladu i hints (žádné "to je špatně", místo toho "zkus to ještě jednou, podívej se na...")

## RVP alignment

Každá úloha má `rvpRef` (TBD schema) odkazující na specifický bod RVP MŠMT (např. `M-5-1-02` = matematika 1. stupeň, výstup č. 2). Pro audit + filtering podle curriculum coverage.
