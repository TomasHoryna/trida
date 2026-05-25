# src/components/ — React komponenty

## Adresáře

- `ui/` — shadcn primitives (Button, Input, Card, Dialog). Generated z `pnpm dlx shadcn@latest add <component>`. Neupravuj přímo, místo toho extend nebo wrap.
- `learning/` — exercise UI, hint widgets, výklad views, modal varianty content
- `parent/` — parent dashboard widgets, reporting karty
- `layout/` — header, footer, navigation, app shell

## Conventions

- Server Components by default
- Client Components (`"use client"` na první řádce) jen pokud potřebuješ:
  - useState / useReducer
  - useEffect / useRef
  - Event handlery (`onClick`, `onChange`)
  - Browser-only API (window, document, localStorage)
- Props typované přes TypeScript interface (nikdy `any`, max `unknown` s type guards)
- File naming: PascalCase pro komponenty (`ExerciseCard.tsx`), kebab-case pro hooks/utils
- Default export pro hlavní komponentu, named exports pro pomocné
- Komponenta v jednom souboru per file (žádné mega-soubory s 10 komponentami)

## Styling

- Tailwind utilities only
- Žádné inline `style={{}}` až na dynamic values (např. animation duration z props)
- Variant patterns přes `class-variance-authority` (shadcn pattern)
- `cn()` helper z `src/lib/utils.ts` pro conditional class merging

## Accessibility

- Vždy `aria-label` na ikony bez textu
- Sémantické HTML (`<button>` ne `<div onClick>`)
- Focus states viditelné (nesmazat default outline bez náhrady)
- Kontrast WCAG AA minimum (4.5:1 pro normální text)

## Pojmenování

- Komponenta dělá jednu věc, jméno popisuje co je: `ExerciseCard`, `HintButton`, `ProgressBar`
- Vyhýbej se generickým názvům: `Wrapper`, `Container`, `Component`
