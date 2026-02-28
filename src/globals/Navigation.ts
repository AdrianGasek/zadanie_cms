import type { GlobalConfig } from 'payload'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  access: {
    read: () => true,
  },
  label: { singular: 'Navigation', plural: 'Navigation' },
  fields: [
    {
      name: 'tabs',
      type: 'array',
      label: 'Menu tabs',
      labels: { singular: 'Tab', plural: 'Tabs' },
      admin: {
        description: 'Top-level tabs (e.g. Platform, Integrations, Resources). Order determines display order.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
          label: 'Tab label',
        },
        {
          name: 'menuItems',
          type: 'array',
          label: 'Menu items',
          labels: { singular: 'Item', plural: 'Items' },
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
              admin: { description: 'Link target (e.g. /page or https://...)' },
            },
          ],
        },
      ],
    },
  ],
}
