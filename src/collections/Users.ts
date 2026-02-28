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
    group: 'System',
  },
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      access: {
        read: ({ req }) => Boolean(req.user?.roles?.includes('admin')),
        create: ({ req }) => Boolean(req.user?.roles?.includes('admin')),
        update: ({ req }) => Boolean(req.user?.roles?.includes('admin')),
      },
    },
  ],
}
