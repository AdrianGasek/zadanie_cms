import type { CollectionConfig } from 'payload'

type LocaleCode = 'pl' | 'en' | 'de'

function getReqLocale(req: { i18n?: { language?: string } } | undefined): LocaleCode {
  const code = req?.i18n?.language
  if (code === 'pl' || code === 'en' || code === 'de') return code
  return 'en'
}

const VALIDATION = {
  required: { pl: 'Wymagane', en: 'Required', de: 'Erforderlich' },
  noSpaces: { pl: 'Bez spacji', en: 'No spaces', de: 'Keine Leerzeichen' },
  noSpacesExample: { pl: 'Bez spacji (użyj np. productName)', en: 'No spaces (e.g. productName)', de: 'Keine Leerzeichen (z. B. productName)' },
  slugFormat: { pl: 'Tylko małe litery, cyfry i myślniki', en: 'Only lowercase letters, numbers and hyphens', de: 'Nur Kleinbuchstaben, Ziffern und Bindestriche' },
} as const

const FIELD_TYPES = [
  { label: 'Text', value: 'text' },
  { label: 'Long text (textarea)', value: 'textarea' },
  { label: 'Rich text', value: 'richText' },
  { label: 'Number', value: 'number' },
  { label: 'Date', value: 'date' },
  { label: 'Checkbox', value: 'checkbox' },
  { label: 'Select (dropdown)', value: 'select' },
  { label: 'Image (Media)', value: 'image' },
  { label: 'Group (nested)', value: 'group' },
] as const

const FIELD_TYPES_NO_GROUP = FIELD_TYPES.filter((o) => o.value !== 'group')

/** Pola dla poziomu 3 (bez typu group). */
const level3Fields: CollectionConfig['fields'] = [
  { name: 'key', type: 'text', required: true, label: { pl: 'Klucz pola', en: 'Field key', de: 'Feldschlüssel' }, validate: (val: string | null | undefined, opts: { req?: { i18n?: { language?: string } } }) => (val && !/\s/.test(val) ? true : VALIDATION.noSpaces[getReqLocale(opts?.req)]) },
  { name: 'label', type: 'text', required: true, label: { pl: 'Etykieta', en: 'Label', de: 'Bezeichnung' } },
  { name: 'type', type: 'select', required: true, label: { pl: 'Typ', en: 'Type', de: 'Typ' }, options: [...FIELD_TYPES_NO_GROUP], defaultValue: 'text' },
  { name: 'required', type: 'checkbox', label: { pl: 'Wymagane', en: 'Required', de: 'Erforderlich' }, defaultValue: false },
  { name: 'options', type: 'textarea', label: { pl: 'Opcje (dla Select)', en: 'Options (for Select)', de: 'Optionen (für Select)' }, admin: { condition: (_: unknown, s: { type?: string }) => s?.type === 'select' } },
]

/** Pola dla poziomu 2 (z grupą → level 3). */
const level2Fields: CollectionConfig['fields'] = [
  { name: 'key', type: 'text', required: true, label: { pl: 'Klucz pola', en: 'Field key', de: 'Feldschlüssel' }, validate: (val: string | null | undefined, opts: { req?: { i18n?: { language?: string } } }) => (val && !/\s/.test(val) ? true : VALIDATION.noSpaces[getReqLocale(opts?.req)]) },
  { name: 'label', type: 'text', required: true, label: { pl: 'Etykieta', en: 'Label', de: 'Bezeichnung' } },
  { name: 'type', type: 'select', required: true, label: { pl: 'Typ', en: 'Type', de: 'Typ' }, options: [...FIELD_TYPES], defaultValue: 'text' },
  { name: 'required', type: 'checkbox', label: { pl: 'Wymagane', en: 'Required', de: 'Erforderlich' }, defaultValue: false },
  { name: 'options', type: 'textarea', label: { pl: 'Opcje (dla Select)', en: 'Options (for Select)', de: 'Optionen (für Select)' }, admin: { condition: (_: unknown, s: { type?: string }) => s?.type === 'select' } },
  { name: 'level3Fields', type: 'array', dbName: 'ccd_f_nf_l3', label: { pl: 'Pola zagnieżdżone (poziom 3)', en: 'Nested fields (level 3)', de: 'Verschachtelte Felder (Ebene 3)' }, admin: { condition: (_: unknown, s: { type?: string }) => s?.type === 'group', description: { pl: 'Ostatni poziom (max 3).', en: 'Last level (max 3).', de: 'Letzte Ebene (max. 3).' } }, fields: level3Fields },
]

/** Pola dla poziomu 1 (główne + grupa → level 2). */
const level1Fields: CollectionConfig['fields'] = [
  {
    name: 'key',
    type: 'text',
    required: true,
    label: { pl: 'Klucz pola', en: 'Field key', de: 'Feldschlüssel' },
    admin: { description: { pl: 'Nazwa techniczna bez spacji (np. price, productName).', en: 'Technical name without spaces (e.g. price, productName).', de: 'Technischer Name ohne Leerzeichen (z. B. price, productName).' } },
    validate: (val: string | null | undefined, opts: { req?: { i18n?: { language?: string } } }) => {
      const loc = getReqLocale(opts?.req)
      if (val === undefined || val === null || val === '') return VALIDATION.required[loc]
      if (/\s/.test(val)) return VALIDATION.noSpacesExample[loc]
      return true
    },
  },
  { name: 'label', type: 'text', required: true, label: { pl: 'Etykieta', en: 'Label', de: 'Bezeichnung' }, admin: { description: { pl: 'Czytelna nazwa w formularzu (np. "Cena", "Nazwa produktu").', en: 'Display name in the form (e.g. "Price", "Product name").', de: 'Anzeigename im Formular (z. B. "Preis", "Produktname").' } } },
  { name: 'type', type: 'select', required: true, label: { pl: 'Typ', en: 'Type', de: 'Typ' }, options: [...FIELD_TYPES], defaultValue: 'text' },
  { name: 'required', type: 'checkbox', label: { pl: 'Wymagane', en: 'Required', de: 'Erforderlich' }, defaultValue: false },
  { name: 'options', type: 'textarea', label: { pl: 'Opcje (dla Select)', en: 'Options (for Select)', de: 'Optionen (für Select)' }, admin: { description: { pl: 'Jedna opcja w każdej linii (tylko dla typu Select).', en: 'One option per line (Select type only).', de: 'Eine Option pro Zeile (nur für Typ Select).' }, condition: (_: unknown, s: { type?: string }) => s?.type === 'select' } },
  { name: 'nestedFields', type: 'array', dbName: 'ccd_f_nf_l2', label: { pl: 'Pola zagnieżdżone (poziom 2)', en: 'Nested fields (level 2)', de: 'Verschachtelte Felder (Ebene 2)' }, admin: { condition: (_: unknown, s: { type?: string }) => s?.type === 'group', description: { pl: 'Maks. 3 poziomy. W grupie możesz dodać kolejną grupę (poziom 3).', en: 'Max. 3 levels. In a group you can add another group (level 3).', de: 'Max. 3 Ebenen. In einer Gruppe können Sie eine weitere Gruppe (Ebene 3) hinzufügen.' } }, fields: level2Fields },
]

export const CustomCollectionDefinitions: CollectionConfig = {
  slug: 'custom-collection-definitions',
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'updatedAt'],
    group: { pl: 'Treść', en: 'Content', de: 'Inhalt' },
    description: {
      pl: 'Struktura danych: nazwy pól, typy (tekst, liczba, data, select…), kolejność. Definicję używasz we Wpisach danych – tam wypełniasz formularz i zapisujesz wpisy (np. listę cenników).',
      en: 'Data structure: field names, types (text, number, date, select…), order. Use the definition in Data Entries – fill the form and save entries (e.g. price lists).',
      de: 'Datenstruktur: Feldnamen, Typen (Text, Zahl, Datum, Select…), Reihenfolge. Die Definition wird in Dateneinträgen verwendet – Formular ausfüllen und Einträge speichern (z. B. Preislisten).',
    },
  },
  labels: {
    singular: { pl: 'Definicja danych', en: 'Data Definition', de: 'Datendefinition' },
    plural: { pl: 'Definicje danych', en: 'Data Definitions', de: 'Datendefinitionen' },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: { pl: 'Nazwa kolekcji', en: 'Collection name', de: 'Sammlungsname' },
      admin: {
        description: { pl: 'Czytelna nazwa, np. "Cennik" (używana w panelu).', en: 'Display name, e.g. "Pricing" (used in the panel).', de: 'Anzeigename, z. B. "Preisliste" (im Panel verwendet).' },
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: { pl: 'Klucz (slug)', en: 'Key (slug)', de: 'Schlüssel (Slug)' },
      admin: {
        description: {
          pl: 'Unikalny klucz kolekcji (np. cennik, prices). Ten sam klucz łączy definicję z wpisami w Data Entries.',
          en: 'Unique collection key (e.g. pricing, prices). The same key links the definition to entries in Data Entries.',
          de: 'Eindeutiger Sammlungsschlüssel (z. B. preise, prices). Derselbe Schlüssel verknüpft die Definition mit Einträgen in Dateneinträgen.',
        },
      },
      validate: (val: string | null | undefined, opts: { req?: { i18n?: { language?: string } } }) => {
        const loc = getReqLocale(opts?.req)
        if (val === undefined || val === null || val === '') return VALIDATION.required[loc]
        const normalized = val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        if (normalized !== val.toLowerCase()) return VALIDATION.slugFormat[loc]
        return true
      },
    },
    {
      name: 'useAsTitle',
      type: 'text',
      required: false,
      label: { pl: 'Pole jako tytuł wpisu', en: 'Field as entry title', de: 'Feld als Eintragstitel' },
      admin: {
        description: { pl: 'Klucz pola (z listy poniżej) wyświetlany jako tytuł w liście wpisów. Zostaw puste, jeśli nie dotyczy.', en: 'Field key (from list below) displayed as title in the entries list. Leave empty if not applicable.', de: 'Feldschlüssel (aus der Liste unten), der als Titel in der Eintragsliste angezeigt wird. Leer lassen, falls nicht zutreffend.' },
      },
    },
    {
      name: 'fields',
      type: 'array',
      dbName: 'ccd_fields',
      label: { pl: 'Pola danych', en: 'Data fields', de: 'Datenfelder' },
      labels: { singular: { pl: 'Pole', en: 'Field', de: 'Feld' }, plural: { pl: 'Pola', en: 'Fields', de: 'Felder' } },
      required: true,
      minRows: 1,
      admin: {
        description: { pl: 'Zdefiniuj pola wpisów: klucz, etykieta, typ (tekst, rich text, obraz, grupa do 3 poziomów), kolejność.', en: 'Define entry fields: key, label, type (text, rich text, image, group up to 3 levels), order.', de: 'Eintragsfelder definieren: Schlüssel, Bezeichnung, Typ (Text, Rich Text, Bild, Gruppe bis 3 Ebenen), Reihenfolge.' },
      },
      fields: level1Fields,
    },
  ],
}
