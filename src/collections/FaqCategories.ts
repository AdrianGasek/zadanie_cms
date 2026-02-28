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
    group: 'Content',
    description: 'FAQ categories. Each category has a name, short description and many Q&A items.',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      label: 'Category name',
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      localized: true,
      label: 'Short description',
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Display order (lower = first)' },
      label: 'Sort order',
    },
    {
      name: 'items',
      type: 'array',
      label: 'Questions & answers',
      labels: { singular: 'Q&A', plural: 'Q&A' },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
          localized: true,
          label: 'Question',
        },
        {
          name: 'answer',
          type: 'textarea',
          required: true,
          localized: true,
          label: 'Answer',
        },
      ],
    },
  ],
}
