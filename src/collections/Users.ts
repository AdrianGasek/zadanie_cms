import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  access: {
    read: ({ req }) => Boolean(req.user),
    create: () => true,
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user?.roles?.includes('admin')),
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'updatedAt'],
    group: { pl: 'System', en: 'System', de: 'System' },
  },
  labels: {
    singular: { pl: 'Użytkownik', en: 'User', de: 'Benutzer' },
    plural: { pl: 'Użytkownicy', en: 'Users', de: 'Benutzer' },
  },
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: [
        { label: { pl: 'Admin', en: 'Admin', de: 'Admin' }, value: 'admin' },
        { label: { pl: 'Edytor', en: 'Editor', de: 'Redakteur' }, value: 'editor' },
      ],
      access: {
        read: ({ req }) => Boolean(req.user?.roles?.includes('admin')),
        create: ({ req }) => Boolean(req.user?.roles?.includes('admin')),
        update: ({ req }) => Boolean(req.user?.roles?.includes('admin')),
      },
    },
  ],
}
