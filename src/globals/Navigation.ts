import type { GlobalConfig } from 'payload'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  access: {
    read: () => true,
  },
  label: 'Navigation',
  fields: [
    {
      name: 'tabs',
      type: 'array',
      label: { pl: 'Zakładki menu', en: 'Menu tabs', de: 'Menü-Register' },
      labels: { singular: { pl: 'Zakładka', en: 'Tab', de: 'Register' }, plural: { pl: 'Zakładki', en: 'Tabs', de: 'Register' } },
      admin: {
        description: { pl: 'Zakładki najwyższego poziomu (np. Platforma, Integracje, Zasoby). Kolejność określa wyświetlanie.', en: 'Top-level tabs (e.g. Platform, Integrations, Resources). Order determines display order.', de: 'Hauptregister (z. B. Plattform, Integrationen, Ressourcen). Reihenfolge bestimmt die Anzeige.' },
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
          label: { pl: 'Etykieta zakładki', en: 'Tab label', de: 'Register-Label' },
        },
        {
          name: 'menuItems',
          type: 'array',
          label: { pl: 'Pozycje menu', en: 'Menu items', de: 'Menüpunkte' },
          labels: { singular: { pl: 'Pozycja', en: 'Item', de: 'Eintrag' }, plural: { pl: 'Pozycje', en: 'Items', de: 'Einträge' } },
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
              label: { pl: 'URL', en: 'URL', de: 'URL' },
              admin: { description: { pl: 'Cel linku (np. /strona lub https://...)', en: 'Link target (e.g. /page or https://...)', de: 'Link-Ziel (z. B. /seite oder https://...)' } },
            },
          ],
        },
      ],
    },
  ],
}
