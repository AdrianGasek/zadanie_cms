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
    group: 'Content',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt text',
    },
  ],
}
