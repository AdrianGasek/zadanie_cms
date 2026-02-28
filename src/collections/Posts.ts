import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'publishedAt', 'readTimeMinutes', 'updatedAt'],
    group: 'Content',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL slug for /news-post/[slug]',
      },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      required: true,
      localized: true,
      label: 'Short description',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Featured image',
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'readTimeMinutes',
      type: 'number',
      required: true,
      min: 1,
      label: 'Read time (minutes)',
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: 'Categories',
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      localized: true,
      editor: lexicalEditor(),
      label: 'Article content',
    },
  ],
}
