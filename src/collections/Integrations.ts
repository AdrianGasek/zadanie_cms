import type { CollectionConfig } from 'payload'

export const Integrations: CollectionConfig = {
  slug: 'integrations',
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'shortDescription', 'updatedAt'],
    group: 'Content',
    description: 'Integration entries for /integrations page. Each has mini logo, company name, short description.',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      label: 'Company / integration name',
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      required: true,
      localized: true,
      label: 'Short description',
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Mini logo / graphic',
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Display order (lower = first)' },
      label: 'Sort order',
    },
  ],
}
