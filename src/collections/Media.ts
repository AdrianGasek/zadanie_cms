import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  upload: true,
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['alt', 'updatedAt'],
    group: { pl: 'Treść', en: 'Content', de: 'Inhalt' },
  },
  labels: {
    singular: { pl: 'Medium', en: 'Media', de: 'Medium' },
    plural: { pl: 'Media', en: 'Media', de: 'Media' },
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: { pl: 'Tekst alternatywny', en: 'Alt text', de: 'Alt-Text' },
    },
  ],
}
