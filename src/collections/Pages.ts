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
      'Strony są powiązane z wpisami danych przez typ strony (pole Typ strony) lub przez konkretny Wpis danych. Dane wyświetlane na stronie to entries z wybranej definicji / wbudowanej kolekcji albo jeden wybrany Data Entry – konfiguracja w Content → Typ stron.',
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
  ],
}
