import React, { Suspense } from 'react'
import { AdminLocaleReload } from '@/components/admin/AdminLocaleReload'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <AdminLocaleReload />
      </Suspense>
      {children}
    </>
  )
}
