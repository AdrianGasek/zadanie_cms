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
    group: { pl: 'Treść', en: 'Content', de: 'Inhalt' },
  },
  labels: {
    singular: { pl: 'Post', en: 'Post', de: 'Beitrag' },
    plural: { pl: 'Posty', en: 'Posts', de: 'Beiträge' },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: { pl: 'Tytuł', en: 'Title', de: 'Titel' },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: { pl: 'Slug', en: 'Slug', de: 'Slug' },
      admin: {
        description: { pl: 'URL slug dla /news-post/[slug]', en: 'URL slug for /news-post/[slug]', de: 'URL-Slug für /news-post/[slug]' },
      },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      required: true,
      localized: true,
      label: { pl: 'Krótki opis', en: 'Short description', de: 'Kurzbeschreibung' },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: { pl: 'Zdjęcie główne', en: 'Featured image', de: 'Beitragsbild' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      label: { pl: 'Data publikacji', en: 'Published at', de: 'Veröffentlicht am' },
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'readTimeMinutes',
      type: 'number',
      required: true,
      min: 1,
      label: { pl: 'Czas czytania (min)', en: 'Read time (minutes)', de: 'Lesezeit (Min.)' },
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      label: { pl: 'Kategorie', en: 'Categories', de: 'Kategorien' },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      localized: true,
      editor: lexicalEditor(),
      label: { pl: 'Treść artykułu', en: 'Article content', de: 'Artikelinhalt' },
    },
  ],
}
