import type { GlobalConfig } from 'payload'

export const Footer: GlobalConfig = {
  slug: 'footer',
  access: {
    read: () => true,
  },
  label: 'Footer',
  fields: [
    {
      name: 'contactEmail',
      type: 'text',
      required: true,
      label: { pl: 'E-mail kontaktowy', en: 'Contact email', de: 'Kontakt-E-Mail' },
    },
    {
      name: 'contactPhone',
      type: 'text',
      required: true,
      label: { pl: 'Telefon kontaktowy', en: 'Contact phone', de: 'Kontakttelefon' },
    },
    {
      name: 'linkColumns',
      type: 'array',
      label: { pl: 'Kolumny linków', en: 'Link columns', de: 'Link-Spalten' },
      labels: { singular: { pl: 'Kolumna', en: 'Column', de: 'Spalte' }, plural: { pl: 'Kolumny', en: 'Columns', de: 'Spalten' } },
      admin: {
        description: { pl: 'Kolumny linków w stopce (np. Rejestracja, Zaloguj, Szukaj, Polityka prywatności, Regulamin, FAQ).', en: 'Footer link columns (e.g. Registration, Sign in, Search, Privacy policy, Terms, FAQ).', de: 'Fußzeilen-Linkspalten (z. B. Registrierung, Anmelden, Suche, Datenschutz, AGB, FAQ).' },
      },
      fields: [
        {
          name: 'links',
          type: 'array',
          label: { pl: 'Linki', en: 'Links', de: 'Links' },
          labels: { singular: { pl: 'Link', en: 'Link', de: 'Link' }, plural: { pl: 'Linki', en: 'Links', de: 'Links' } },
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              localized: true,
              label: { pl: 'Etykieta', en: 'Label', de: 'Bezeichnung' },
            },
            {
              name: 'url',
              type: 'text',
              required: true,
              label: { pl: 'URL', en: 'URL', de: 'URL' },
            },
          ],
        },
      ],
    },
  ],
}
