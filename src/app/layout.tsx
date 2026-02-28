import type { Metadata } from 'next'
import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout as PayloadRootLayout } from '@payloadcms/next/layouts'
import React from 'react'

import { importMap } from './(payload)/admin/importMap.js'
import './(payload)/custom.scss'

export const metadata: Metadata = {
  title: 'News CMS',
  description: 'News application with Payload CMS',
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PayloadRootLayout
      config={Promise.resolve(config)}
      importMap={importMap}
      serverFunction={serverFunction}
    >
      {children}
    </PayloadRootLayout>
  )
}
