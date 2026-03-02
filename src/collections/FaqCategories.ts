import type { CollectionConfig } from 'payload'

export const FaqCategories: CollectionConfig = {
  slug: 'faq-categories',
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'shortDescription', 'updatedAt'],
    group: { pl: 'Treść', en: 'Content', de: 'Inhalt' },
    description: { pl: 'Kategorie FAQ. Każda ma nazwę, krótki opis i wiele pytań i odpowiedzi.', en: 'FAQ categories. Each category has a name, short description and many Q&A items.', de: 'FAQ-Kategorien. Jede Kategorie hat einen Namen, Kurzbeschreibung und viele Q&A-Einträge.' },
  },
  labels: {
    singular: { pl: 'Kategoria FAQ', en: 'FAQ Category', de: 'FAQ-Kategorie' },
    plural: { pl: 'Kategorie FAQ', en: 'FAQ Categories', de: 'FAQ-Kategorien' },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      label: { pl: 'Nazwa kategorii', en: 'Category name', de: 'Kategoriename' },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      localized: true,
      label: { pl: 'Krótki opis', en: 'Short description', de: 'Kurzbeschreibung' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      label: { pl: 'Kolejność', en: 'Sort order', de: 'Sortierung' },
      admin: { description: { pl: 'Kolejność wyświetlania (mniejsza = pierwsza)', en: 'Display order (lower = first)', de: 'Anzeigereihenfolge (kleiner = zuerst)' } },
    },
    {
      name: 'items',
      type: 'array',
      label: { pl: 'Pytania i odpowiedzi', en: 'Questions & answers', de: 'Fragen & Antworten' },
      labels: { singular: { pl: 'P&O', en: 'Q&A', de: 'F&A' }, plural: { pl: 'P&O', en: 'Q&A', de: 'F&A' } },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
          localized: true,
          label: { pl: 'Pytanie', en: 'Question', de: 'Frage' },
        },
        {
          name: 'answer',
          type: 'textarea',
          required: true,
          localized: true,
          label: { pl: 'Odpowiedź', en: 'Answer', de: 'Antwort' },
        },
      ],
    },
  ],
}
