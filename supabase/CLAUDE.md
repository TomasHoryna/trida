# supabase/ — Database migrations + seed data

## Struktura

- `migrations/` — versioned SQL migrace, jméno `YYYYMMDDHHMMSS_description.sql`
- `seed.sql` — dev seed data (test users, sample exercises) — TBD Fáze 2

## Workflow

- **Local development:** Supabase CLI (`supabase db push --linked` aplikuje migrace na linked `trida-dev` DB)
- **Production deploy:** migrace přes GitHub Action s manual approval gate (TBD Fáze 4)

## Pravidla — NESMĚJÍ se porušit

### 1. Backwards-compatible migrace only

Žádné:
- `DROP COLUMN` (dvouškolková: nullable → backfill → drop v dalším release)
- `RENAME COLUMN` (add new → migrate data → drop old)
- `NOT NULL` na existující sloupec bez `DEFAULT`
- `ALTER COLUMN TYPE` které mění data (extra step needed)

Důvod: zero-downtime deploys. Pokud porušíš, application starý kód crashne na production během deploy window.

### 2. RLS (Row-Level Security) policies na všech tabulkách s user daty

Bez RLS by uživatel A mohl číst data uživatele B. Default deny, explicit allow podle session user ID.

Příklad:
```sql
alter table exercises enable row level security;

create policy "Users see own exercise attempts"
  on exercise_attempts for select
  using (auth.uid() = student_id);
```

### 3. NIKDY nesahej na production DB ručně

Vše přes migrace. SQL Editor v Supabase dashboardu používej **jen pro read-only debugging**. Pokud změníš schema ručně, migrace nebudou konzistentní mezi dev a prod.

### 4. Indexy pro foreign keys + frequently-queried columns

PostgreSQL je nenastaví automaticky. Bez indexu na FK budou JOINy pomalé.

Pojmenování indexů: `idx_<table>_<column>` nebo `idx_<table>_<col1>_<col2>` pro composite.

### 5. Sensitive columns označit komentářem

```sql
comment on column users.email is 'PII — email address, GDPR sensitive';
```

## Pojmenování

- Tabulky: plural snake_case (`users`, `exercises`, `exercise_attempts`, `learning_sessions`)
- Sloupce: snake_case (`created_at`, `student_id`, `is_completed`)
- Foreign keys: `<referenced_table_singular>_id` (`student_id` referencuje `students.id`)
- Boolean: `is_<adjective>` (`is_completed`, `is_active`)
- Timestamps: `created_at`, `updated_at`, `deleted_at` (UTC, `timestamp with time zone`)

## Migration tooling

```bash
# Vytvořit novou migraci
supabase migration new add_students_table

# Aplikovat na dev DB
supabase db push --linked

# Reset dev DB (CAREFUL!)
supabase db reset --linked
```
