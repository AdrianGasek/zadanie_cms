import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
    group: { pl: 'Treść', en: 'Content', de: 'Inhalt' },
  },
  labels: {
    singular: { pl: 'Kategoria', en: 'Category', de: 'Kategorie' },
    plural: { pl: 'Kategorie', en: 'Categories', de: 'Kategorien' },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      label: { pl: 'Nazwa', en: 'Name', de: 'Name' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: { pl: 'Slug', en: 'Slug', de: 'Slug' },
      admin: {
        description: { pl: 'Identyfikator przyjazny w URL', en: 'URL-friendly identifier', de: 'URL-freundliche Kennung' },
      },
    },
  ],
}
