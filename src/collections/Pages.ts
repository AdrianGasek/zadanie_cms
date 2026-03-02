import type { CollectionConfig } from 'payload'

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
    group: 'Content',
    description:
      'Strony są powiązane z danymi przez konkretny Wpis danych (Data Entry). Dane wyświetlane na stronie to entries z wybranej definicji / wbudowanej kolekcji albo jeden wybrany Data Entry.',
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
      label: 'Wpis danych',
      admin: {
        description:
          'Opcjonalnie: powiąż tę stronę z konkretnym Wpisem danych (Data Entry). Gdy ustawione, na stronie wyświetlany będzie ten jeden wpis zamiast listy entries z Typu strony.',
      },
    },
    {
      name: 'dataSources',
      type: 'blocks',
      required: false,
      label: 'Źródła danych',
      admin: {
        description:
          'Konfiguracja źródeł danych dla strony (wiele sekcji). Jeśli ustawione, zastępuje pojedyncze pole "Wpis danych".',
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
              validate: (val: string | null | undefined) => {
                if (!val) return 'Wymagane'
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
              validate: (val: string | null | undefined) => {
                if (!val) return 'Wymagane'
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
              validate: (val: string | null | undefined) => {
                if (!val) return 'Wymagane'
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
              validate: (val: string | null | undefined) => {
                if (!val) return 'Wymagane'
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
      label: 'Page title',
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      required: true,
      localized: true,
      label: 'Short description',
    },
    {
      name: 'layout',
      type: 'blocks',
      label: 'Page content',
      localized: true,
      admin: {
        description: 'Content blocks for this page (e.g. hero, text, CTA). Used for custom pages like /pricing, /about.',
      },
      blocks: [
        {
          slug: 'hero',
          labels: { singular: 'Hero', plural: 'Hero blocks' },
          fields: [
            { name: 'heading', type: 'text', required: true, label: 'Heading' },
            { name: 'subheading', type: 'textarea', label: 'Subheading' },
          ],
        },
        {
          slug: 'content',
          labels: { singular: 'Content', plural: 'Content blocks' },
          fields: [
            { name: 'body', type: 'textarea', required: true, label: 'Body text' },
          ],
        },
        {
          slug: 'cta',
          labels: { singular: 'Call to action', plural: 'CTA blocks' },
          fields: [
            { name: 'title', type: 'text', required: true, label: 'Title' },
            { name: 'buttonLabel', type: 'text', required: true, label: 'Button label' },
            { name: 'buttonUrl', type: 'text', required: true, label: 'Button URL' },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'SEO',
      admin: { description: 'Meta tagi i ustawienia wyszukiwarek (Open Graph, Twitter, indeksowanie).' },
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          required: false,
          localized: true,
          label: 'Meta tytuł',
          admin: { description: 'Tytuł w wynikach wyszukiwania i w social (np. Facebook). Jeśli pusty, używany jest tytuł strony.' },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          required: false,
          localized: true,
          label: 'Meta opis',
          admin: { description: 'Opis w wynikach wyszukiwania i podglądach linków (OG). Zalecane 150–160 znaków.' },
        },
        {
          name: 'openGraphImage',
          type: 'upload',
          relationTo: 'media',
          required: false,
          label: 'Obraz OG / social',
          admin: { description: 'Obraz wyświetlany przy udostępnianiu linku (Facebook, LinkedIn itd.). Zalecane 1200×630 px.' },
        },
        {
          name: 'canonicalUrl',
          type: 'text',
          required: false,
          label: 'Canonical URL',
          admin: { description: 'Opcjonalny kanoniczny adres strony (np. przy duplikatach treści).' },
        },
        {
          name: 'noIndex',
          type: 'checkbox',
          defaultValue: false,
          label: 'No index',
          admin: { description: 'Zaznacz, aby wykluczyć stronę z indeksu wyszukiwarek (noindex).' },
        },
      ],
    },
  ],
}
