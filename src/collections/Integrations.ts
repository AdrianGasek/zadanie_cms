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
    group: { pl: 'Treść', en: 'Content', de: 'Inhalt' },
    description: { pl: 'Wpisy integracji dla strony /integrations. Każdy ma mini logo, nazwę firmy, krótki opis.', en: 'Integration entries for /integrations page. Each has mini logo, company name, short description.', de: 'Integrations-Einträge für die Seite /integrations. Jeder hat Mini-Logo, Firmenname, Kurzbeschreibung.' },
  },
  labels: {
    singular: { pl: 'Integracja', en: 'Integration', de: 'Integration' },
    plural: { pl: 'Integracje', en: 'Integrations', de: 'Integrationen' },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
      label: { pl: 'Nazwa firmy / integracji', en: 'Company / integration name', de: 'Firmen- / Integrationsname' },
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      required: true,
      localized: true,
      label: { pl: 'Krótki opis', en: 'Short description', de: 'Kurzbeschreibung' },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: { pl: 'Mini logo / grafika', en: 'Mini logo / graphic', de: 'Mini-Logo / Grafik' },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      label: { pl: 'Kolejność', en: 'Sort order', de: 'Sortierung' },
      admin: { description: { pl: 'Kolejność wyświetlania (mniejsza = pierwsza)', en: 'Display order (lower = first)', de: 'Anzeigereihenfolge (kleiner = zuerst)' } },
    },
  ],
}
