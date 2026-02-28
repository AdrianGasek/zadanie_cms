# Zadanie CMS — Next.js 16 + Payload CMS

Projekt zawiera **część serwerową**: konfigurację Payload CMS, API Next.js, routing, funkcje do pobierania danych oraz komponenty serwerowe (bez stylów). 

## Stack
- Next.js 16
- Payload CMS 3
- TypeScript
- Postgres (adapter `@payloadcms/db-postgres`)
- Zod (walidacja)
- Tailwind / shadcn (do dodania po stronie frontendu)

## Wymagania

- Node.js 20.9+
- PostgreSQL
- **Bun** (zalecany) lub npm

## Konfiguracja

1. **Skopiuj zmienne środowiskowe**
   ```bash
   cp .env.example .env
   ```
2. **Uzupełnij `.env`**
   - `PAYLOAD_SECRET` — min. 32 znaki (np. wygeneruj: `openssl rand -base64 32`)
   - `DATABASE_URI` — connection string Postgres, np. `postgresql://user:password@localhost:5432/zadanie_cms`

3. **Instalacja zależności (Bun — zalecane)**
   ```bash
   # Zainstaluj Bun, jeśli nie masz: https://bun.sh/docs/installation
   bun install
   ```

   **Alternatywa (npm)** — wymaga `legacy-peer-deps` z powodu peer dependency Payload ↔ Next.js:
   ```bash
   npm install --legacy-peer-deps
   ```

4. **Uruchomienie**
   ```bash
   bun run dev
   ```
   (z npm: `npm run dev`)

   - Aplikacja: http://localhost:3000
   - Panel Payload (admin): http://localhost:3000/admin — tutaj utworzysz pierwszego użytkownika.

## Payload CMS — co jest skonfigurowane

### Collections

- **Media** — upload obrazów (alt).
- **Users** — auth (email/hasło), role: admin, editor.
- **Categories** — nazwa, slug (lokalizowane: pl, en, de).
- **Posts** — tytuł, slug, shortDescription, featuredImage, publishedAt, readTimeMinutes, categories, content (Lexical rich text). Pola tekstowe z lokalizacją.
- **Pages** — strony powiązane tylko z kolekcjami danych (np. wpis z Custom Collection Entries). Identyfikacja po slug (np. `news`, `faq`, `integrations`). Dane na stronie z pola Wpis danych (dataEntry).
- **CustomCollectionDefinitions** — definicje własnych kolekcji (schemat pól).
- **CustomCollectionEntries** — wpisy do kolekcji zdefiniowanych w CustomCollectionDefinitions.
- **FaqCategories** — kategorie FAQ.
- **Integrations** — integracje (np. lista integracji na stronie).

### Globals

- **Navigation** — zakładki menu (np. Platform, Integrations, Resources), każda z tablicą `menuItems` (label, url). Konfigurowalne, rozbudowywalne.
- **Footer** — contact (email, telefon) oraz kolumny linków (np. rejestracja, sign in, search, privacy policy, terms, FAQ).

### Internacjonalizacja

- Lokale: **pl** (domyślny), **en**, **de**.
- Pola z `localized: true` mają wersje językowe w panelu Payload.

## API Next.js (Route Handlers)

| Endpoint | Opis |
|----------|------|
| `GET /api/news` | Lista postów (query: `page`, `limit`, `category`, `locale`) |
| `GET /api/news/[slug]` | Pojedynczy post po slug (query: `locale`) |
| `GET /api/news-categories` | Lista kategorii (query: `locale`) |
| `GET /api/navigation` | Global Navigation (query: `locale`) |
| `GET /api/footer` | Global Footer (query: `locale`) |
| `GET /api/news-page-settings` | Ustawienia strony /news (query: `locale`) |
| `GET /api/integrations` | Lista integracji (query: `locale`) |
| `GET /api/integrations-page-settings` | Ustawienia strony integracji (query: `locale`) |
| `GET /api/faq` | FAQ (query: `locale`) |
| `GET /api/faq-page-settings` | Ustawienia strony FAQ (query: `locale`) |
| `GET /api/custom-collection-definitions/[id]/fields` | Pola definicji własnej kolekcji |

Payload REST (kolekcje, globals, auth) jest pod ścieżką `/api/*` obsługiwaną przez Payload (np. `/api/posts`, `/api/users`, `/api/globals/navigation`).

## Routing (strony)

- `/` — przekierowanie na `/news`
- `/news` — strona główna newsów: menu, tytuł + opis, kategorie, grid postów (frontend doda infinite scroll), stopka
- `/news-post/[slug]` — pojedynczy artykuł: data, czas czytania, tytuł, zdjęcie, rich text, sekcja „Read more”

## Struktura (skrót)

```
src/
  app/
    (payload)/          # Payload admin + REST
    (frontend)/         # Widoki: news, news-post/[slug]
    api/                # Custom API (news, news-categories, navigation, footer, news-page-settings, integrations, faq, custom-collection-definitions)
  collections/          # Payload: Media, Users, Categories, Posts, Pages, CustomCollectionDefinitions, CustomCollectionEntries, FaqCategories, Integrations
  globals/              # Payload: Navigation, Footer
  lib/
    payload.ts          # getPayload() — cache instancji
    api/
      news.ts           # Funkcje do pobierania newsów i kategorii (Local API)
      pages.ts          # Pobieranie stron
      integrations.ts   # Pobieranie integracji
      faq.ts            # Pobieranie FAQ
payload.config.ts       # Konfiguracja Payload (DB, collections, globals, i18n)
```

## Dodatkowe skrypty

- `bun run generate:importmap` — po dodaniu nowych komponentów do panelu Payload
- `bun run generate:types` — generowanie typów Payload
- `bun run migrate` — uruchomienie migracji Payload
- `bun run migrate:create [nazwa]` — utworzenie nowej migracji
- `bun run migrate:reset` — reset bazy i migracji (tylko dev)

(Użycie `npm run …` działa tak samo, przy npm pamiętaj o `--legacy-peer-deps` przy `npm install`.)

