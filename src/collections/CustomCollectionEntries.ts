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
    group: 'Content',
    description:
      'Produkcyjna wersja zestawu danych: podaj nazwę systemową (np. "cennik 1 szkic"), wybierz definicję danych, zapisz. Po wejściu w zapisany wpis dodawaj dane przyciskiem i polami klucz: wartość z definicji. Stronę możesz powiązać z konkretnym Data Entry w kolekcji Strony.',
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
      label: 'Nazwa systemowa',
      admin: {
        description:
          'Nazwa dla CMS (np. "cennik 1 szkic") – identyfikuje ten wpis w panelu. Po zapisaniu wpisu wybierz definicję danych i dodaj dane (klucz: wartość) w polu Dane.',
      },
    },
    {
      name: 'customCollection',
      type: 'relationship',
      relationTo: 'custom-collection-definitions',
      required: true,
      label: 'Definicja danych',
      admin: {
        description: 'Wybierz definicję (np. Cennik). Pola w "Dane" zależą od tej definicji – wypełnij i zapisz, aby dodać wpis do listy.',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      label: 'Kolejność',
      admin: {
        description: 'Sortowanie (mniejsza wartość = wyżej).',
      },
    },
    {
      name: 'data',
      type: 'json',
      required: false,
      label: 'Dane',
      admin: {
        description:
          'Dodawaj wpisy danych przyciskiem „Dodaj wpis danych”. Każdy wpis to zestaw pól z definicji (klucz: wartość). Zapisując dokument, wartości trafią do bazy jako JSON (tablica obiektów).',
        components: {
          // Custom field component; Payload expects PayloadComponent<FieldClientComponent|FieldServerComponent> – cast to satisfy
          Field: CustomCollectionDataFieldComponent as any,
        },
      },
      defaultValue: [],
    },
  ],
}
