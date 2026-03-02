import type { Metadata } from 'next'

import config from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams: searchParams as Promise<Record<string, string | string[]>> })

const Page = ({ params, searchParams }: Args) =>
  RootPage({
    config,
    params,
    searchParams: searchParams as Promise<Record<string, string | string[]>>,
    importMap,
  })

export default Page
