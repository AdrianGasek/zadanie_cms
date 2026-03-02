import type { CollectionConfig } from 'payload'
import { CustomCollectionDataFieldComponent } from '@/components/admin/CustomCollectionDataField'

export const CustomCollectionEntries: CollectionConfig = {
  slug: 'custom-collection-entries',
  access: {
    read: () => true,
    create: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    afterRead: [
      async ({ doc, req }) => {
        const rel = doc.customCollection
        const id =
          rel == null
            ? null
            : typeof rel === 'number'
              ? rel
              : typeof rel === 'object' && rel !== null && 'id' in rel
                ? (rel as { id: number }).id
                : null
        if (id == null || !req?.payload) return doc
        const hasFields =
          typeof rel === 'object' &&
          rel !== null &&
          Array.isArray((rel as { fields?: unknown }).fields) &&
          ((rel as { fields: unknown[] }).fields.length > 0)
        if (hasFields) return doc
        const definition = await req.payload.findByID({
          collection: 'custom-collection-definitions',
          id,
          depth: 2,
        })
        return { ...doc, customCollection: definition ?? doc.customCollection }
      },
    ],
  },
  admin: {
    useAsTitle: 'systemName',
    defaultColumns: ['systemName', 'customCollection', 'sortOrder', 'updatedAt'],
    group: { pl: 'Treść', en: 'Content', de: 'Inhalt' },
    description: {
      pl: 'Wpisy danych: podaj nazwę systemową, wybierz definicję danych, zapisz. W zapisanym wpisie dodawaj dane w polu Dane (klucz: wartość). Stronę możesz powiązać z konkretnym Data Entry w kolekcji Strony.',
      en: 'Data entries: enter a system name, select a data definition, save. In the saved entry add data in the Data field (key: value). You can link a page to a specific Data Entry in the Pages collection.',
      de: 'Dateneinträge: Systemname angeben, Datendefinition wählen, speichern. Im gespeicherten Eintrag Daten im Feld Daten hinzufügen (Schlüssel: Wert). Sie können eine Seite mit einem konkreten Dateneintrag in der Sammlung Seiten verknüpfen.',
    },
  },
  labels: {
    singular: { pl: 'Wpis danych', en: 'Data Entry', de: 'Dateneintrag' },
    plural: { pl: 'Wpisy danych', en: 'Data Entries', de: 'Dateneinträge' },
  },
  fields: [
    {
      name: 'systemName',
      type: 'text',
      required: true,
      label: { pl: 'Nazwa systemowa', en: 'System name', de: 'Systemname' },
      admin: {
        description: {
          pl: 'Nazwa dla CMS (np. "cennik 1") – identyfikuje ten wpis w panelu. Po zapisaniu wybierz definicję i wypełnij pole Dane.',
          en: 'Name for the CMS (e.g. "pricing 1") – identifies this entry in the panel. After saving, select the definition and fill the Data field.',
          de: 'Name für das CMS (z. B. "Preise 1") – identifiziert diesen Eintrag im Panel. Nach dem Speichern Definition wählen und Feld Daten ausfüllen.',
        },
      },
    },
    {
      name: 'customCollection',
      type: 'relationship',
      relationTo: 'custom-collection-definitions',
      required: true,
      label: { pl: 'Definicja danych', en: 'Data definition', de: 'Datendefinition' },
      admin: {
        description: {
          pl: 'Wybierz definicję (np. Cennik). Pola w "Dane" zależą od tej definicji.',
          en: 'Select a definition (e.g. Pricing). The Data field depends on this definition.',
          de: 'Wählen Sie eine Definition (z. B. Preise). Das Feld Daten hängt von dieser Definition ab.',
        },
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      label: { pl: 'Kolejność', en: 'Sort order', de: 'Sortierung' },
      admin: {
        description: { pl: 'Sortowanie (mniejsza wartość = wyżej).', en: 'Sort order (lower value = higher).', de: 'Sortierung (kleinerer Wert = weiter oben).' },
      },
    },
    {
      name: 'data',
      type: 'json',
      required: false,
      label: { pl: 'Dane', en: 'Data', de: 'Daten' },
      admin: {
        description: {
          pl: 'Dodawaj wpisy przyciskiem „Dodaj wpis danych”. Każdy wpis to zestaw pól z definicji (klucz: wartość).',
          en: 'Add entries with the "Add data entry" button. Each entry is a set of fields from the definition (key: value).',
          de: 'Einträge mit „Dateneintrag hinzufügen" hinzufügen. Jeder Eintrag ist ein Satz Felder aus der Definition (Schlüssel: Wert).',
        },
        components: {
          Field: CustomCollectionDataFieldComponent as any,
        },
      },
      defaultValue: [],
    },
  ],
}
