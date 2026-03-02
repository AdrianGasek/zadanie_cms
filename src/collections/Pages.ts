import type { CollectionConfig } from 'payload'

const VALIDATION_REQUIRED = { pl: 'Wymagane', en: 'Required', de: 'Erforderlich' } as const
function getReqLocale(req: { i18n?: { language?: string } } | undefined): 'pl' | 'en' | 'de' {
  const code = req?.i18n?.language
  if (code === 'pl' || code === 'en' || code === 'de') return code
  return 'en'
}

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'dataEntry', 'slug', 'updatedAt'],
    group: { pl: 'Treść', en: 'Content', de: 'Inhalt' },
    description: {
      pl: 'Strony są powiązane z danymi przez konkretny Wpis danych (Data Entry). Dane wyświetlane na stronie to entries z wybranej definicji / wbudowanej kolekcji albo jeden wybrany Data Entry.',
      en: 'Pages are linked to data via a specific Data Entry. Page content comes from entries of the chosen definition / built-in collection or a single selected Data Entry.',
      de: 'Seiten sind über einen konkreten Dateneintrag mit Daten verknüpft. Die angezeigten Daten stammen aus Einträgen der gewählten Definition / eingebauten Sammlung oder einem ausgewählten Dateneintrag.',
    },
  },
  labels: {
    singular: { pl: 'Strona', en: 'Page', de: 'Seite' },
    plural: { pl: 'Strony', en: 'Pages', de: 'Pages' },
  },
  fields: [
    {
      name: 'dataEntry',
      type: 'relationship',
      relationTo: 'custom-collection-entries',
      required: false,
      label: { pl: 'Wpis danych', en: 'Data Entry', de: 'Dateneintrag' },
      admin: {
        description: {
          pl: 'Opcjonalnie: powiąż tę stronę z konkretnym Wpisem danych. Gdy ustawione, na stronie wyświetlany będzie ten jeden wpis zamiast listy.',
          en: 'Optional: link this page to a specific Data Entry. When set, only this entry is shown instead of a list.',
          de: 'Optional: Diese Seite mit einem konkreten Dateneintrag verknüpfen. Wenn gesetzt, wird nur dieser Eintrag statt einer Liste angezeigt.',
        },
      },
    },
    {
      name: 'dataSources',
      type: 'blocks',
      required: false,
      label: { pl: 'Źródła danych', en: 'Data sources', de: 'Datenquellen' },
      admin: {
        description: {
          pl: 'Konfiguracja źródeł danych dla strony (wiele sekcji). Jeśli ustawione, zastępuje pojedyncze pole "Wpis danych".',
          en: 'Data source configuration for the page (multiple sections). When set, replaces the single "Data Entry" field.',
          de: 'Datenquellen-Konfiguration für die Seite (mehrere Abschnitte). Ersetzt bei Angabe das einzelne Feld "Dateneintrag".',
        },
      },
      blocks: [
        {
          slug: 'customDataset',
          labels: { singular: 'Custom dataset (Data Entry)', plural: 'Custom datasets (Data Entries)' },
          fields: [
            {
              name: 'key',
              type: 'text',
              required: true,
              label: 'Klucz sekcji',
              admin: { description: 'Klucz w `data[...]`, np. "pricing" albo "entries". Musi być unikalny w obrębie strony.' },
              validate: (val: string | null | undefined, opts: { req?: { i18n?: { language?: string } } }) => {
                if (!val) return VALIDATION_REQUIRED[getReqLocale(opts?.req)]
                const normalized = val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                if (normalized !== val.toLowerCase()) return 'Use only lowercase letters, numbers and hyphens (e.g. "posts-list")'
                return true
              },
            },
            {
              name: 'entry',
              type: 'relationship',
              relationTo: 'custom-collection-entries',
              required: true,
              label: 'Wpis danych (Data Entry)',
            },
          ],
        },
        {
          slug: 'posts',
          labels: { singular: 'Posts (all)', plural: 'Posts (all)' },
          fields: [
            {
              name: 'key',
              type: 'text',
              required: true,
              defaultValue: 'posts',
              label: 'Klucz sekcji',
              admin: { description: 'Klucz w `data[...]`, np. "posts". Musi być unikalny w obrębie strony.' },
              validate: (val: string | null | undefined, opts: { req?: { i18n?: { language?: string } } }) => {
                if (!val) return VALIDATION_REQUIRED[getReqLocale(opts?.req)]
                const normalized = val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                if (normalized !== val.toLowerCase()) return 'Use only lowercase letters, numbers and hyphens (e.g. "posts")'
                return true
              },
            },
            {
              name: 'limit',
              type: 'number',
              required: false,
              defaultValue: 12,
              label: 'Limit',
              admin: { description: 'Ile postów pobrać.' },
            },
          ],
        },
        {
          slug: 'integrations',
          labels: { singular: 'Integrations (all)', plural: 'Integrations (all)' },
          fields: [
            {
              name: 'key',
              type: 'text',
              required: true,
              defaultValue: 'integrations',
              label: 'Klucz sekcji',
              admin: { description: 'Klucz w `data[...]`, np. "integrations". Musi być unikalny w obrębie strony.' },
              validate: (val: string | null | undefined, opts: { req?: { i18n?: { language?: string } } }) => {
                if (!val) return VALIDATION_REQUIRED[getReqLocale(opts?.req)]
                const normalized = val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                if (normalized !== val.toLowerCase()) return 'Use only lowercase letters, numbers and hyphens (e.g. "integrations")'
                return true
              },
            },
            {
              name: 'limit',
              type: 'number',
              required: false,
              defaultValue: 200,
              label: 'Limit',
              admin: { description: 'Ile integracji pobrać.' },
            },
          ],
        },
        {
          slug: 'faqCategories',
          labels: { singular: 'FAQ categories (all)', plural: 'FAQ categories (all)' },
          fields: [
            {
              name: 'key',
              type: 'text',
              required: true,
              defaultValue: 'faq',
              label: 'Klucz sekcji',
              admin: { description: 'Klucz w `data[...]`, np. "faq". Musi być unikalny w obrębie strony.' },
              validate: (val: string | null | undefined, opts: { req?: { i18n?: { language?: string } } }) => {
                if (!val) return VALIDATION_REQUIRED[getReqLocale(opts?.req)]
                const normalized = val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                if (normalized !== val.toLowerCase()) return 'Use only lowercase letters, numbers and hyphens (e.g. "faq")'
                return true
              },
            },
            {
              name: 'limit',
              type: 'number',
              required: false,
              defaultValue: 100,
              label: 'Limit',
              admin: { description: 'Ile kategorii FAQ pobrać.' },
            },
          ],
        },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      required: false,
      unique: true,
      admin: {
        description: 'Custom URL path (e.g. "pricing", "about"). If empty, path is determined by page type (faq, integrations, news).',
      },
      validate: (val: string | null | undefined | string) => {
        if (val === undefined || val === null || val === '') return true
        const normalized = val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        if (normalized !== val.toLowerCase()) return 'Use only lowercase letters, numbers and hyphens (e.g. "about-us")'
        return true
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: { pl: 'Tytuł strony', en: 'Page title', de: 'Seitentitel' },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      required: true,
      localized: true,
      label: { pl: 'Krótki opis', en: 'Short description', de: 'Kurzbeschreibung' },
    },
    {
      name: 'layout',
      type: 'blocks',
      label: { pl: 'Treść strony', en: 'Page content', de: 'Seiteninhalt' },
      localized: true,
      admin: {
        description: {
          pl: 'Bloki treści (np. hero, tekst, CTA). Używane na stronach typu /pricing, /about.',
          en: 'Content blocks for this page (e.g. hero, text, CTA). Used for custom pages like /pricing, /about.',
          de: 'Inhaltsblöcke für diese Seite (z. B. Hero, Text, CTA). Für eigene Seiten wie /pricing, /about.',
        },
      },
      blocks: [
        {
          slug: 'hero',
          labels: { singular: { pl: 'Hero', en: 'Hero', de: 'Hero' }, plural: { pl: 'Bloki hero', en: 'Hero blocks', de: 'Hero-Blöcke' } },
          fields: [
            { name: 'heading', type: 'text', required: true, label: { pl: 'Nagłówek', en: 'Heading', de: 'Überschrift' } },
            { name: 'subheading', type: 'textarea', label: { pl: 'Podtytuł', en: 'Subheading', de: 'Untertitel' } },
          ],
        },
        {
          slug: 'content',
          labels: { singular: { pl: 'Treść', en: 'Content', de: 'Inhalt' }, plural: { pl: 'Bloki treści', en: 'Content blocks', de: 'Inhaltsblöcke' } },
          fields: [
            { name: 'body', type: 'textarea', required: true, label: { pl: 'Tekst', en: 'Body text', de: 'Fließtext' } },
          ],
        },
        {
          slug: 'cta',
          labels: { singular: { pl: 'Wezwanie do działania', en: 'Call to action', de: 'Call-to-Action' }, plural: { pl: 'Bloki CTA', en: 'CTA blocks', de: 'CTA-Blöcke' } },
          fields: [
            { name: 'title', type: 'text', required: true, label: { pl: 'Tytuł', en: 'Title', de: 'Titel' } },
            { name: 'buttonLabel', type: 'text', required: true, label: { pl: 'Etykieta przycisku', en: 'Button label', de: 'Button-Beschriftung' } },
            { name: 'buttonUrl', type: 'text', required: true, label: { pl: 'URL przycisku', en: 'Button URL', de: 'Button-URL' } },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: { pl: 'SEO', en: 'SEO', de: 'SEO' },
      admin: { description: { pl: 'Meta tagi i ustawienia wyszukiwarek (Open Graph, Twitter, indeksowanie).', en: 'Meta tags and search engine settings (Open Graph, Twitter, indexing).', de: 'Meta-Tags und Suchmaschineneinstellungen (Open Graph, Twitter, Indexierung).' } },
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          required: false,
          localized: true,
          label: { pl: 'Meta tytuł', en: 'Meta title', de: 'Meta-Titel' },
          admin: { description: { pl: 'Tytuł w wynikach wyszukiwania i w social. Jeśli pusty, używany jest tytuł strony.', en: 'Title in search results and social. If empty, page title is used.', de: 'Titel in Suchergebnissen und Social. Wenn leer, wird der Seitentitel verwendet.' } },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          required: false,
          localized: true,
          label: { pl: 'Meta opis', en: 'Meta description', de: 'Meta-Beschreibung' },
          admin: { description: { pl: 'Opis w wynikach wyszukiwania i podglądach linków (OG). Zalecane 150–160 znaków.', en: 'Description in search results and link previews (OG). Recommended 150–160 characters.', de: 'Beschreibung in Suchergebnissen und Linkvorschau (OG). Empfohlen 150–160 Zeichen.' } },
        },
        {
          name: 'openGraphImage',
          type: 'upload',
          relationTo: 'media',
          required: false,
          label: { pl: 'Obraz OG / social', en: 'OG / social image', de: 'OG- / Social-Bild' },
          admin: { description: { pl: 'Obraz przy udostępnianiu linku (Facebook, LinkedIn). Zalecane 1200×630 px.', en: 'Image when sharing the link (Facebook, LinkedIn). Recommended 1200×630 px.', de: 'Bild beim Teilen des Links (Facebook, LinkedIn). Empfohlen 1200×630 px.' } },
        },
        {
          name: 'canonicalUrl',
          type: 'text',
          required: false,
          label: { pl: 'Canonical URL', en: 'Canonical URL', de: 'Canonical URL' },
          admin: { description: { pl: 'Opcjonalny kanoniczny adres strony (np. przy duplikatach treści).', en: 'Optional canonical page URL (e.g. for duplicate content).', de: 'Optionale kanonische Seiten-URL (z. B. bei Duplicate Content).' } },
        },
        {
          name: 'noIndex',
          type: 'checkbox',
          defaultValue: false,
          label: { pl: 'No index', en: 'No index', de: 'No index' },
          admin: { description: { pl: 'Zaznacz, aby wykluczyć stronę z indeksu wyszukiwarek (noindex).', en: 'Check to exclude page from search engine index (noindex).', de: 'Anklicken, um die Seite vom Suchmaschinen-Index auszuschließen (noindex).' } },
        },
      ],
    },
  ],
}
