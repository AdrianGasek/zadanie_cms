import type { CollectionConfig } from 'payload'

const FIELD_TYPES = [
  { label: 'Text', value: 'text' },
  { label: 'Long text (textarea)', value: 'textarea' },
  { label: 'Rich text', value: 'richText' },
  { label: 'Number', value: 'number' },
  { label: 'Date', value: 'date' },
  { label: 'Checkbox', value: 'checkbox' },
  { label: 'Select (dropdown)', value: 'select' },
  { label: 'Obraz (Media)', value: 'image' },
  { label: 'Grupa (zagnieżdżenie)', value: 'group' },
] as const

const FIELD_TYPES_NO_GROUP = FIELD_TYPES.filter((o) => o.value !== 'group')

/** Pola dla poziomu 3 (bez typu group). */
const level3Fields: CollectionConfig['fields'] = [
  { name: 'key', type: 'text', required: true, label: 'Klucz pola', validate: (val: string | null | undefined) => (val && !/\s/.test(val) ? true : 'Bez spacji') },
  { name: 'label', type: 'text', required: true, label: 'Etykieta' },
  { name: 'type', type: 'select', required: true, label: 'Typ', options: [...FIELD_TYPES_NO_GROUP], defaultValue: 'text' },
  { name: 'required', type: 'checkbox', label: 'Wymagane', defaultValue: false },
  { name: 'options', type: 'textarea', label: 'Opcje (dla Select)', admin: { condition: (_: unknown, s: { type?: string }) => s?.type === 'select' } },
]

/** Pola dla poziomu 2 (z grupą → level 3). Tablica poziomu 3 ma inną nazwę (level3Fields), żeby uniknąć duplikatu relacji "nestedFields" w Drizzle. */
const level2Fields: CollectionConfig['fields'] = [
  { name: 'key', type: 'text', required: true, label: 'Klucz pola', validate: (val: string | null | undefined) => (val && !/\s/.test(val) ? true : 'Bez spacji') },
  { name: 'label', type: 'text', required: true, label: 'Etykieta' },
  { name: 'type', type: 'select', required: true, label: 'Typ', options: [...FIELD_TYPES], defaultValue: 'text' },
  { name: 'required', type: 'checkbox', label: 'Wymagane', defaultValue: false },
  { name: 'options', type: 'textarea', label: 'Opcje (dla Select)', admin: { condition: (_: unknown, s: { type?: string }) => s?.type === 'select' } },
  { name: 'level3Fields', type: 'array', dbName: 'ccd_f_nf_l3', label: 'Pola zagnieżdżone (poziom 3)', admin: { condition: (_: unknown, s: { type?: string }) => s?.type === 'group', description: 'Ostatni poziom (max 3).' }, fields: level3Fields },
]

/** Pola dla poziomu 1 (główne + grupa → level 2). */
const level1Fields: CollectionConfig['fields'] = [
  {
    name: 'key',
    type: 'text',
    required: true,
    label: 'Klucz pola',
    admin: { description: 'Nazwa techniczna bez spacji (np. price, productName).' },
    validate: (val: string | null | undefined) => {
      if (val === undefined || val === null || val === '') return 'Wymagane'
      if (/\s/.test(val)) return 'Bez spacji (użyj np. productName)'
      return true
    },
  },
  { name: 'label', type: 'text', required: true, label: 'Etykieta', admin: { description: 'Czytelna nazwa w formularzu (np. "Cena", "Nazwa produktu").' } },
  { name: 'type', type: 'select', required: true, label: 'Typ', options: [...FIELD_TYPES], defaultValue: 'text' },
  { name: 'required', type: 'checkbox', label: 'Wymagane', defaultValue: false },
  { name: 'options', type: 'textarea', label: 'Opcje (dla Select)', admin: { description: 'Jedna opcja w każdej linii (tylko dla typu Select).', condition: (_: unknown, s: { type?: string }) => s?.type === 'select' } },
  { name: 'nestedFields', type: 'array', dbName: 'ccd_f_nf_l2', label: 'Pola zagnieżdżone (poziom 2)', admin: { condition: (_: unknown, s: { type?: string }) => s?.type === 'group', description: 'Maks. 3 poziomy. W grupie możesz dodać kolejną grupę (poziom 3).' }, fields: level2Fields },
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
    group: 'Content',
    description:
      'Struktura danych: nazwy pól, typy (tekst, liczba, data, select…), kolejność. Definicję używasz w Typ stron jako źródło danych oraz w Wpisach danych – tam wypełniasz formularz i zapisujesz produkcyjne wpisy (np. listę cenników).',
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
      label: 'Nazwa kolekcji',
      admin: {
        description: 'Czytelna nazwa, np. "Cennik", "PricesList" (używana w panelu).',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Klucz (slug)',
      admin: {
        description:
          'Unikalny klucz kolekcji (np. cennik, prices). Powiązanie między definicją danych a wpisami w Data Entries – ten sam klucz wpisuj w Typ stron jako "Klucz typu", żeby strona ładowała entries z tej definicji.',
      },
      validate: (val: string | null | undefined) => {
        if (val === undefined || val === null || val === '') return 'Wymagane'
        const normalized = val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        if (normalized !== val.toLowerCase()) return 'Tylko małe litery, cyfry i myślniki'
        return true
      },
    },
    {
      name: 'useAsTitle',
      type: 'text',
      required: false,
      label: 'Pole jako tytuł wpisu',
      admin: {
        description: 'Klucz pola (z listy poniżej), które ma być wyświetlane jako tytuł w liście wpisów. Zostaw puste, jeśli nie dotyczy.',
      },
    },
    {
      name: 'fields',
      type: 'array',
      dbName: 'ccd_fields',
      label: 'Pola danych',
      labels: { singular: 'Pole', plural: 'Pola' },
      required: true,
      minRows: 1,
      admin: {
        description: 'Zdefiniuj pola wpisów: klucz, etykieta, typ (tekst, rich text, obraz z Media, grupa zagnieżdżona do 3 poziomów itd.), kolejność.',
      },
      fields: level1Fields,
    },
  ],
}
