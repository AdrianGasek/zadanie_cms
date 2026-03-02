import type { Page, Integration, FaqCategory, Post } from '../../../../payload-types'
import type { PageCollectionData } from '@/lib/api/pages'
import type { Locale } from '@/lib/i18n/config'
import { getTranslations } from '@/lib/i18n/translations'
import { pathWithLocale } from '@/lib/i18n/routes'
import Link from 'next/link'
import { LocaleSwitcher } from './LocaleSwitcher'

// TODO: przenieść to do innego folderu w projekcie, zrobić review, rozbić na komponenty
// Wywaliłem pageType, bo nie ma go w payload-types.ts trzeba potem naprawić komponent

type Props = {
  page: Page
  data?: PageCollectionData
  locale?: Locale
}

type LayoutBlock = NonNullable<Page['layout']>[number]

/** Generyczna karta dla dowolnego dokumentu – wyświetla name/title, shortDescription i opcjonalnie slug link. */
function GenericItemCard({
  item,
  locale,
  t,
}: {
  item: Record<string, unknown>
  locale: Locale
  t: ReturnType<typeof getTranslations>
}) {
  const name = (item.name ?? item.title ?? '—') as string
  const desc = (item.shortDescription ?? item.description ?? '') as string
  const slug = item.slug as string | undefined
  const href = slug ? pathWithLocale(`/${slug}`, locale) : undefined

  return (
    <li className="rounded-lg border p-4">
      <h3 className="font-medium">{name}</h3>
      {desc && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">{desc}</p>
      )}
      {href && (
        <Link
          href={href}
          className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-2 inline-block"
        >
          {t.common.more}
        </Link>
      )}
    </li>
  )
}

/** Wpis z własnej kolekcji – data może być zagnieżdżona; _definitionFields z type i fields. */
type CustomEntryItem = {
  id?: number
  data?: Record<string, unknown>
  _useAsTitle?: string
  _definitionFields?: Array<{
    key?: string
    label?: string
    type?: string
    fields?: CustomEntryItem['_definitionFields']
    nestedFields?: CustomEntryItem['_definitionFields']
    level3Fields?: CustomEntryItem['_definitionFields']
  }>
}

function renderFieldValue(
  value: unknown,
  fieldType: string | undefined,
  _fieldKey: string | undefined,
  t: ReturnType<typeof getTranslations>,
): React.ReactNode {
  if (value == null || value === '') return null
  if (fieldType === 'richText' && typeof value === 'string') {
    return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: value }} />
  }
  if (fieldType === 'image') {
    const obj = value as { id?: number; url?: string | null }
    const url = obj?.url
    if (url) return <img src={url} alt="" className="max-h-24 rounded object-contain" />
    if (typeof obj?.id === 'number') return <span className="text-neutral-500">{t.common.image} #{obj.id}</span>
    return null
  }
  if (typeof value === 'boolean') return value ? t.common.yes : t.common.no
  if (typeof value === 'object' && !Array.isArray(value)) return null
  return String(value)
}

function renderCustomFields(
  data: Record<string, unknown>,
  fields: CustomEntryItem['_definitionFields'],
  useAsTitle: string | undefined,
  depth: number,
  t: ReturnType<typeof getTranslations>,
): React.ReactNode[] {
  if (!fields?.length) return []
  const maxDepth = 3
  if (depth > maxDepth) return []
  const nodes: React.ReactNode[] = []
  for (const f of fields) {
    const key = f.key
    if (!key) continue
    const val = data[key]
    if (f.type === 'group' && val != null && typeof val === 'object' && !Array.isArray(val)) {
      const nested = val as Record<string, unknown>
      const subFields = f.fields ?? f.nestedFields ?? f.level3Fields
      if (subFields?.length) {
        nodes.push(
          <div key={key} className={depth > 0 ? 'ml-3 mt-2 pl-3 border-l border-neutral-200 dark:border-neutral-700' : undefined}>
            {f.label && <div className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1">{f.label}</div>}
            <dl className="space-y-1 text-sm">
              {renderCustomFields(nested, subFields, undefined, depth + 1, t).map((node, i) => (
                <div key={i}>{node}</div>
              ))}
            </dl>
          </div>
        )
      }
      continue
    }
    if (key === useAsTitle) continue
    if (val == null || val === '') continue
    nodes.push(
      <div key={key} className="flex gap-2">
        <dt className="text-neutral-500 dark:text-neutral-400 shrink-0">{f.label ?? key}:</dt>
        <dd className="text-neutral-700 dark:text-neutral-300">
          {renderFieldValue(val, f.type, key, t)}
        </dd>
      </div>
    )
  }
  return nodes
}

function CustomCollectionCard({ item, t }: { item: CustomEntryItem; t: ReturnType<typeof getTranslations> }) {
  const data = item.data ?? {}
  const useAsTitle = item._useAsTitle
  const fields = item._definitionFields ?? []
  const titleVal = useAsTitle ? data[useAsTitle] : undefined
  const titleDisplay =
    titleVal != null && typeof titleVal === 'object' && (titleVal as { url?: string })?.url
      ? t.common.image
      : titleVal != null && titleVal !== ''
        ? String(titleVal)
        : '—'

  return (
    <li className="rounded-lg border p-4">
      <h3 className="font-medium">{titleDisplay}</h3>
      <dl className="mt-2 space-y-1 text-sm">
        {renderCustomFields(data, fields, useAsTitle, 0, t)}
      </dl>
    </li>
  )
}

/** Generyczna lista dla dowolnego pageType – np. własne typy dodane w Page Type Collections. */
function GenericCollectionBlock({
  items,
  title,
  isCustomCollection = false,
  locale,
  t,
}: {
  items: unknown[]
  title: string
  isCustomCollection?: boolean
  locale: Locale
  t: ReturnType<typeof getTranslations>
}) {
  if (!items?.length) return null
  return (
    <section className="mb-10">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) =>
          isCustomCollection ? (
            <CustomCollectionCard key={(item as CustomEntryItem)?.id ?? i} item={item as CustomEntryItem} t={t} />
          ) : (
            <GenericItemCard key={(item as { id?: number })?.id ?? i} item={item as Record<string, unknown>} locale={locale} t={t} />
          )
        )}
      </ul>
    </section>
  )
}

/** Zamienia slug pageType na czytelny tytuł (np. prices-list → Prices list). */
function formatPageTypeTitle(pageType: string): string {
  return pageType
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

export function PageContent({ page, data, locale: localeProp }: Props) {
  const { title, shortDescription, layout, slug } = page
  const pageType = typeof slug === 'string' && slug.length > 0 ? slug : 'entries'
  const collectionItems = data?.[pageType]
  const dataSections = data ? Object.entries(data) : []
  const locale = localeProp ?? 'pl'
  const t = getTranslations(locale)

  return (
    <article className="dynamic-page">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {shortDescription && (
            <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">
              {shortDescription}
            </p>
          )}
        </div>
        <LocaleSwitcher currentLocale={locale} basePath={slug ? `/${slug}` : undefined} ariaLabel={t.aria.localeSwitcher} />
      </header>

      {/* integrations – dedykowany blok */}
      {/* TODO: przenieść to do innego folderu w projekcie, zrobić review, rozbić na komponenty */}
      {((pageType === 'integrations' && Array.isArray(collectionItems) && collectionItems.length > 0)
        || dataSections.some(([k]) => k === 'integrations')) &&
        Array.isArray((data?.['integrations'] ?? collectionItems)) &&
        (data?.['integrations'] ?? collectionItems)!.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">{t.sections.integrations}</h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {((data?.['integrations'] ?? collectionItems) as Integration[]).map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border p-4 flex items-start gap-3"
                >
                  {typeof item.logo === 'object' && item.logo?.url && (
                    <img
                      src={item.logo.url}
                      alt={item.name}
                      className="h-10 w-10 rounded object-contain shrink-0"
                    />
                  )}
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                      {item.shortDescription}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

      {/* faq – dedykowany blok (kategorie FAQ) */}
      {((pageType === 'faq' && Array.isArray(collectionItems) && collectionItems.length > 0)
        || dataSections.some(([k]) => k === 'faq')) &&
        Array.isArray((data?.['faq'] ?? collectionItems)) &&
        (data?.['faq'] ?? collectionItems)!.length > 0 && (
          <section className="mb-10 space-y-8">
            <h2 className="text-xl font-semibold mb-4">{t.sections.faq}</h2>
            {((data?.['faq'] ?? collectionItems) as FaqCategory[]).map((category) => (
              <div key={category.id} className="rounded-lg border p-4">
                <h3 className="font-medium mb-2">{category.name}</h3>
                {category.shortDescription && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                    {category.shortDescription}
                  </p>
                )}
                {category.items && category.items.length > 0 && (
                  <ul className="space-y-2">
                    {category.items.map((item, i) => (
                      <li key={item.id ?? i}>
                        <strong className="text-sm">{item.question}</strong>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5">
                          {item.answer}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </section>
        )}

      {/* news – dedykowany blok (posty) */}
      {((pageType === 'news' && Array.isArray(collectionItems) && collectionItems.length > 0)
        || dataSections.some(([k]) => k === 'news' || k === 'posts')) &&
        Array.isArray((data?.['news'] ?? data?.['posts'] ?? collectionItems)) &&
        (data?.['news'] ?? data?.['posts'] ?? collectionItems)!.length > 0 && (
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">{t.sections.news}</h2>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {((data?.['news'] ?? data?.['posts'] ?? collectionItems) as Post[]).map((post) => (
                <li key={post.id} className="rounded-lg border p-4">
                  <h3 className="font-medium">{post.title}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
                    {post.shortDescription}
                  </p>
                  <Link
                    href={pathWithLocale(`/news/${post.slug}`, locale)}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-2 inline-block"
                  >
                    {t.common.readMore}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

      {/* Dowolny inny pageType z Page Type Collections – generyczna lista lub własna kolekcja */}
      {pageType !== 'integrations' &&
        pageType !== 'faq' &&
        pageType !== 'news' &&
        Array.isArray(collectionItems) &&
        collectionItems.length > 0 && (() => {
          const first = collectionItems[0] as CustomEntryItem
          const isCustom = first?._useAsTitle != null && first?.data != null
          return (
            <GenericCollectionBlock
              items={collectionItems}
              title={formatPageTypeTitle(pageType)}
              isCustomCollection={isCustom}
              locale={locale}
              t={t}
            />
          )
        })()}

      {/* Dodatkowe sekcje z dataSources – render generyczny dla nieznanych kluczy */}
      {dataSections
        .filter(([key]) => key !== 'integrations' && key !== 'faq' && key !== 'news' && key !== 'posts' && key !== pageType)
        .map(([key, items]) => {
          if (!Array.isArray(items) || items.length === 0) return null
          const first = items[0] as CustomEntryItem
          const isCustom = first?._useAsTitle != null && first?.data != null
          return (
            <GenericCollectionBlock
              key={key}
              items={items}
              title={formatPageTypeTitle(key)}
              isCustomCollection={isCustom}
              locale={locale}
              t={t}
            />
          )
        })}

      {/* Bloki layoutu – dedykowany blok (hero, content, cta) */}
      {/* TODO: przenieść to do innego folderu w projekcie, zrobić review, rozbić na komponenty */}
      {/* TODO: tutaj można czarować i rozbudować aby było konfigurowalne i dynamiczne ^_^ */}
      {layout && layout.length > 0 && (
        <div className="space-y-10">
          {layout.map((block: LayoutBlock, index: number) => {
            if (!block || !('blockType' in block)) return null
            switch (block.blockType) {
              case 'hero':
                return (
                  <section key={block.id ?? index}>
                    test hero component
                  </section>
                )
              case 'content':
                return (
                  <section key={block.id ?? index}>
                    test content component
                  </section>
                )
              case 'cta':
                return (
                  <section key={block.id ?? index}>
                    test cta component
                  </section>
                )
              default:
                return null
            }
          })}
        </div>
      )}
    </article>
  )
}
