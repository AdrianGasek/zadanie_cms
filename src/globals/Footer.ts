import type { GlobalConfig } from 'payload'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  label: { singular: 'Footer', plural: 'Footer' },
  fields: [
    {
      name: 'contactEmail',
      type: 'text',
      required: true,
      label: 'Contact email',
    },
    {
      name: 'contactPhone',
      type: 'text',
      required: true,
      label: 'Contact phone',
    },
    {
      name: 'linkColumns',
      type: 'array',
      label: 'Link columns',
      labels: { singular: 'Column', plural: 'Columns' },
      admin: {
        description: 'Footer link columns (e.g. Registration, Sign in, Search, Privacy policy, Terms, FAQ).',
      },
      fields: [
        {
          name: 'links',
          type: 'array',
          label: 'Links',
          labels: { singular: 'Link', plural: 'Links' },
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              localized: true,
            },
            {
              name: 'url',
              type: 'text',
              required: true,
              label: 'URL',
            },
          ],
        },
      ],
    },
  ],
}
