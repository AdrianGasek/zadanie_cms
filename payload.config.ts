import sharp from 'sharp'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig } from 'payload'
import { en } from '@payloadcms/translations/languages/en'
import { de } from '@payloadcms/translations/languages/de'
import { pl } from '@payloadcms/translations/languages/pl'

import { Media } from './src/collections/Media'
import { Users } from './src/collections/Users'
import { Categories } from './src/collections/Categories'
import { Posts } from './src/collections/Posts'
import { Pages } from './src/collections/Pages'
import { FaqCategories } from './src/collections/FaqCategories'
import { Integrations } from './src/collections/Integrations'
import { CustomCollectionDefinitions } from './src/collections/CustomCollectionDefinitions'
import { CustomCollectionEntries } from './src/collections/CustomCollectionEntries'
import { Navigation } from './src/globals/Navigation'
import { Footer } from './src/globals/Footer'

export default buildConfig({
  editor: lexicalEditor(),
  collections: [
    Media,
    Users,
    Categories,
    Posts,
    Pages,
    CustomCollectionDefinitions,
    CustomCollectionEntries,
    FaqCategories,
    Integrations,
  ],
  globals: [Navigation, Footer],
  i18n: {
    fallbackLanguage: 'pl',
    supportedLanguages: { pl, en, de },
    translations: {
      pl: {
        general: {
          locale: 'Wersja językowa',
          locales: 'Wersje językowe',
          fallbackToDefaultLocale: 'Domyślna wersja językowa',
        },
      },
      en: {
        general: {
          locale: 'Language version',
          locales: 'Language versions',
          fallbackToDefaultLocale: 'Default language version',
        },
      },
      de: {
        general: {
          locale: 'Sprachversion',
          locales: 'Sprachversionen',
          fallbackToDefaultLocale: 'Standardsprachversion',
        },
      },
    },
  },
  secret: process.env.PAYLOAD_SECRET || '',
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  localization: {
    locales: [
      { label: 'Polish', code: 'pl' },
      { label: 'English', code: 'en' },
      { label: 'German', code: 'de' },
    ],
    defaultLocale: 'pl',
    fallback: true,
  },
} as Parameters<typeof buildConfig>[0])
