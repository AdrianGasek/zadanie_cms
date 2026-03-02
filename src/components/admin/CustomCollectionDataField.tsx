'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  useField,
  useForm,
  usePayloadAPI,
  useDocumentInfo,
  useConfig,
  FieldLabel,
  FieldDescription,
  FieldError,
  fieldBaseClass,
} from '@payloadcms/ui'

type DefinitionField = {
  key: string
  label?: string
  type: string
  required?: boolean
  options?: string | null
  fields?: DefinitionField[]
  nestedFields?: DefinitionField[]
  level3Fields?: DefinitionField[]
}

type CustomCollectionDataFieldProps = {
  field: { label?: string; admin?: { description?: string }; name: string }
  path: string
  readOnly?: boolean
}

function getSiblingPath(path: string, siblingName: string): string {
  if (!path || path === siblingName) return siblingName
  const idx = path.lastIndexOf('.')
  if (idx === -1) return siblingName
  return `${path.slice(0, idx)}.${siblingName}`
}

function getNested(obj: Record<string, unknown>, path: string[]): unknown {
  if (path.length === 0) return obj
  let cur: unknown = obj
  for (const k of path) {
    if (cur == null || typeof cur !== 'object' || Array.isArray(cur)) return undefined
    cur = (cur as Record<string, unknown>)[k]
  }
  return cur
}

function setNested(obj: Record<string, unknown>, path: string[], value: unknown): Record<string, unknown> {
  if (path.length === 0) return value != null && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : obj
  const [head, ...rest] = path
  const next = (obj[head] != null && typeof obj[head] === 'object' && !Array.isArray(obj[head]))
    ? (obj[head] as Record<string, unknown>)
    : {}
  return { ...obj, [head]: setNested(next, rest, value) }
}

/** Zwraca bezpieczny string do wyświetlenia w inputach – nigdy "[object Object]". */
function getDisplayString(val: unknown): string {
  if (val == null) return ''
  if (typeof val === 'string') return val
  if (typeof val === 'number' || typeof val === 'boolean') return String(val)
  if (val instanceof Date) return val.toISOString().slice(0, 10)
  if (typeof val === 'object') return ''
  return String(val)
}

const FIELD_TYPE_LABELS: Record<string, string> = {
  text: 'tekst',
  textarea: 'długi tekst',
  richText: 'formatowany tekst',
  number: 'liczba',
  date: 'data',
  checkbox: 'checkbox',
  select: 'lista wyboru',
  image: 'obraz',
  group: 'grupa',
}
function getFieldTypeLabel(type: string): string {
  return FIELD_TYPE_LABELS[type] ?? type
}

export function CustomCollectionDataFieldComponent(props: CustomCollectionDataFieldProps) {
  const { field: fieldConfig, path: pathFromProps, readOnly } = props
  const label = fieldConfig?.label ?? 'Dane'
  const description = fieldConfig?.admin?.description

  const { value, setValue, path, showError, disabled } = useField<
    Record<string, unknown> | Record<string, unknown>[]
  >({
    path: pathFromProps,
    potentiallyStalePath: pathFromProps,
  })

  const { getDataByPath, submit } = useForm()
  const docInfo = useDocumentInfo()
  const docInitialData = docInfo?.initialData
  const docData = docInfo?.data
  const { config } = useConfig()
  const [definitionFetchKey, setDefinitionFetchKey] = useState(0)

  const siblingPath = useMemo(
    () => getSiblingPath(pathFromProps, 'customCollection'),
    [pathFromProps]
  )

  const customCollectionValue = getDataByPath(siblingPath)
  const definitionId = useMemo(() => {
    const fromForm = customCollectionValue
    const fromInitial = docInitialData && typeof docInitialData === 'object' && 'customCollection' in docInitialData
      ? (docInitialData as { customCollection?: unknown }).customCollection
      : undefined
    const fromData = docData && typeof docData === 'object' && 'customCollection' in docData
      ? (docData as { customCollection?: unknown }).customCollection
      : undefined
    const v = fromForm ?? fromInitial ?? fromData
    if (v == null) return null
    if (typeof v === 'number') return v
    if (typeof v === 'object' && v !== null && 'id' in v) return (v as { id: number }).id
    if (typeof v === 'object' && v !== null && 'value' in v) {
      const val = (v as { value: unknown }).value
      if (typeof val === 'number') return val
      if (val != null && typeof val === 'object' && 'id' in (val as object)) return ((val as { id: number }).id)
    }
    return null
  }, [customCollectionValue, docInitialData, docData])

  const definitionFromInitialData = useMemo(() => {
    const sources: unknown[] = []
    if (docInitialData && typeof docInitialData === 'object' && 'customCollection' in docInitialData)
      sources.push((docInitialData as { customCollection?: unknown }).customCollection)
    if (docData && typeof docData === 'object' && 'customCollection' in docData)
      sources.push((docData as { customCollection?: unknown }).customCollection)
    for (const rel of sources) {
      if (!rel || typeof rel !== 'object' || Array.isArray(rel)) continue
      const obj = rel as Record<string, unknown>
      if (Array.isArray(obj.fields) && obj.fields.length > 0) return obj as { fields: DefinitionField[] }
    }
    return null
  }, [docInitialData, docData])

  const definitionFromRelationship = useMemo(() => {
    if (!customCollectionValue || typeof customCollectionValue !== 'object' || Array.isArray(customCollectionValue)) return null
    const obj = customCollectionValue as Record<string, unknown>
    if (Array.isArray(obj.fields) && obj.fields.length > 0) return obj as { fields: DefinitionField[] }
    return null
  }, [customCollectionValue])

  const definitionFromPopulated = definitionFromRelationship ?? definitionFromInitialData

  const definitionApiUrl = useMemo(() => {
    if (!definitionId) return ''
    const apiRoute = config?.routes?.api ?? '/api'
    const pathname = `${apiRoute}/custom-collection-definitions/${definitionId}/fields`
    if (typeof window !== 'undefined' && pathname.startsWith('/')) {
      return `${window.location.origin}${pathname}`
    }
    return pathname
  }, [config?.routes?.api, definitionId])

  const [{ data: fetchedDefinition, isLoading: definitionLoading }] = usePayloadAPI(
    definitionApiUrl,
    { initialData: undefined, initialParams: { depth: 2, _refetch: definitionFetchKey } }
  )

  const definition = useMemo(() => {
    if (definitionFromPopulated && Array.isArray((definitionFromPopulated as { fields?: unknown }).fields) && ((definitionFromPopulated as { fields: unknown[] }).fields.length > 0))
      return definitionFromPopulated
    if (!fetchedDefinition || typeof fetchedDefinition !== 'object') return null
    const res = fetchedDefinition as Record<string, unknown>
    if (Array.isArray(res.errors) && res.errors.length > 0) return null
    const extractDoc = (r: Record<string, unknown>): Record<string, unknown> | null => {
      const arr = Array.isArray(r.fields) ? r.fields : Array.isArray(r.ccd_fields) ? r.ccd_fields : null
      if (arr && arr.length > 0) return { ...r, fields: arr }
      if (r.doc != null && typeof r.doc === 'object') return extractDoc(r.doc as Record<string, unknown>) ?? (r.doc as Record<string, unknown>)
      if (Array.isArray(r.docs) && r.docs.length > 0 && r.docs[0] != null) return extractDoc(r.docs[0] as Record<string, unknown>) ?? (r.docs[0] as Record<string, unknown>)
      if (r.result != null && typeof r.result === 'object') return extractDoc(r.result as Record<string, unknown>) ?? (r.result as Record<string, unknown>)
      if (r.document != null && typeof r.document === 'object') return extractDoc(r.document as Record<string, unknown>) ?? (r.document as Record<string, unknown>)
      if (r.data != null && typeof r.data === 'object') return extractDoc(r.data as Record<string, unknown>) ?? (r.data as Record<string, unknown>)
      return null
    }
    const doc = extractDoc(res) ?? res
    if (!doc || !Array.isArray(doc.fields) || (doc.fields as unknown[]).length === 0) return null
    return doc as { fields: DefinitionField[] }
  }, [definitionFromPopulated, fetchedDefinition])

  const definitionFields = useMemo((): DefinitionField[] => {
    if (!definition || typeof definition !== 'object') return []
    const raw = (definition as { fields?: unknown }).fields
    if (!Array.isArray(raw)) return []
    return (raw as DefinitionField[]).filter(
      (f) => f && typeof f === 'object' && typeof (f as DefinitionField).key === 'string'
    )
  }, [definition])

  const hasImageField = useMemo(
    () =>
      definitionFields.some((f) => f.type === 'image') ||
      definitionFields.some((f) => (f.fields ?? f.nestedFields ?? f.level3Fields)?.some((g) => g.type === 'image' || (g.fields ?? g.nestedFields ?? g.level3Fields)?.some((h) => h.type === 'image'))),
    [definitionFields]
  )
  const mediaApiUrl = useMemo(() => {
    const apiRoute = config?.routes?.api ?? '/api'
    const pathname = `${apiRoute}/media?limit=200`
    if (typeof window !== 'undefined' && pathname.startsWith('/')) return `${window.location.origin}${pathname}`
    return pathname
  }, [config?.routes?.api])
  const [{ data: mediaData }] = usePayloadAPI(hasImageField ? mediaApiUrl : '', { initialData: undefined })
  const mediaOptions = useMemo(() => {
    if (!mediaData || typeof mediaData !== 'object') return []
    const docs = (mediaData as { docs?: { id: number; alt?: string; filename?: string }[] }).docs
    if (!Array.isArray(docs)) return []
    return docs.map((d) => ({ value: d.id, label: d.alt || d.filename || `Media ${d.id}` }))
  }, [mediaData])

  const dataRows = useMemo((): Record<string, unknown>[] => {
    let raw: unknown = value
    if (raw != null && typeof raw === 'object' && !Array.isArray(raw) && 'value' in (raw as object)) {
      const v = (raw as { value: unknown }).value
      if (Array.isArray(v)) raw = v
    }
    if (raw == null) return []
    if (Array.isArray(raw)) {
      return raw.filter((r): r is Record<string, unknown> => r != null && typeof r === 'object' && !Array.isArray(r))
    }
    if (typeof raw === 'object' && !Array.isArray(raw)) return [raw as Record<string, unknown>]
    return []
  }, [value])

  const [localRows, setLocalRows] = useState<Record<string, unknown>[]>([])
  const skipNextSyncRef = useRef(false)
  const lastSetRowsRef = useRef<string | null>(null)
  useEffect(() => {
    if (definitionFields.length === 0) return
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false
      return
    }
    const fromForm = dataRows.length > 0 ? dataRows : [{}]
    const fromFormStr = JSON.stringify(fromForm)
    if (lastSetRowsRef.current != null) {
      if (lastSetRowsRef.current === fromFormStr) return
      const firstKey = definitionFields[0]?.key
      const firstVal = firstKey ? (fromForm[0] as Record<string, unknown>)?.[firstKey] : undefined
      const isStaleForm =
        firstVal !== null &&
        firstVal !== undefined &&
        typeof firstVal === 'object' &&
        !Array.isArray(firstVal) &&
        Object.keys(firstVal as object).length === 0
      if (isStaleForm) return
      lastSetRowsRef.current = null
    }
    // Nie nadpisuj lokalnego stanu, jeśli użytkownik już coś wpisał (form może zwracać pustą wartość przy setValue(..., true))
    const hasLocalContent = localRows.some((row) => row != null && typeof row === 'object' && Object.keys(row).length > 0)
    if (hasLocalContent) {
      const formEmpty = fromForm.every((row) => row == null || typeof row !== 'object' || Object.keys(row).length === 0)
      if (formEmpty) return
    }
    setLocalRows(fromForm)
  }, [dataRows, definitionFields.length, definitionFields[0]?.key, localRows])

  const setDataRows = useCallback(
    (rows: Record<string, unknown>[]) => {
      const next = rows.length > 0 ? rows : [{}]
      lastSetRowsRef.current = JSON.stringify(next)
      setLocalRows(next)
      setValue(JSON.parse(JSON.stringify(next)), true)
      skipNextSyncRef.current = true
    },
    [setValue, pathFromProps]
  )

  const addRow = useCallback(() => {
    setDataRows([...localRows, {}])
  }, [localRows, setDataRows])

  const removeRow = useCallback(
    (index: number) => {
      const next = localRows.filter((_, i) => i !== index)
      setDataRows(next.length > 0 ? next : [{}])
    },
    [localRows, setDataRows]
  )

  const updateRow = useCallback(
    (index: number, key: string, val: unknown) => {
      const next = [...localRows]
      const row = { ...(next[index] ?? {}), [key]: val }
      next[index] = row
      setDataRows(next)
    },
    [localRows, setDataRows]
  )

  const updateRowNested = useCallback(
    (index: number, pathKeys: string[], val: unknown) => {
      const next = [...localRows]
      const row = next[index] ?? {}
      const updated = setNested(row as Record<string, unknown>, pathKeys, val)
      next[index] = updated
      setDataRows(next)
    },
    [localRows, setDataRows]
  )

  if (definitionId == null) {
    return (
      <div className={`${fieldBaseClass} custom-collection-data-field`}>
        <FieldLabel label={label} path={path} required={false} />
        <div className={`${fieldBaseClass}__wrap`}>
          <p className="text-sm text-neutral-500">
            Wybierz najpierw kolekcję (np. Cennik), aby wyświetlić pola do wypełnienia.
          </p>
        </div>
        {description && <FieldDescription description={description} path={path} />}
      </div>
    )
  }

  if (definitionLoading || definitionFields.length === 0) {
    const definitionName =
      (definitionFromPopulated && typeof (definitionFromPopulated as Record<string, unknown>).name === 'string')
        ? (definitionFromPopulated as Record<string, unknown>).name as string
        : (fetchedDefinition && typeof fetchedDefinition === 'object' && typeof (fetchedDefinition as Record<string, unknown>).name === 'string')
          ? (fetchedDefinition as Record<string, unknown>).name as string
          : null
    return (
      <div className={`${fieldBaseClass} custom-collection-data-field`}>
        <FieldLabel label={label} path={path} required={false} />
        <div className={`${fieldBaseClass}__wrap`}>
          <p className="text-sm text-neutral-500">
            {definitionLoading
              ? 'Ładowanie pól…'
              : definitionId != null
                ? definitionName
                  ? `Definicja „${definitionName}" nie ma jeszcze żadnych pól. Aby móc dodawać dane, dodaj pola w tej definicji (patrz poniżej).`
                  : 'Wybrana definicja nie ma jeszcze żadnych pól.'
                : 'Wybierz definicję danych powyżej (pole Definicja danych), aby móc dodawać wpisy.'}
          </p>
          {definitionId != null && !definitionLoading && (
            <>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                <strong>Co zrobić:</strong> W menu wybierz <strong>Content → Definicje danych</strong>, otwórz definicję (np. Cenniki). W sekcji <strong>„Pola danych"</strong> dodaj co najmniej jedno pole (np. Klucz: <code>price</code>, Etykieta: Cena, Typ: Liczba). Zapisz. Potem wróć tutaj i kliknij „Załaduj pola ponownie".
              </p>
              <button
                type="button"
                onClick={() => setDefinitionFetchKey((k) => k + 1)}
                className="mt-2 text-sm px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Załaduj pola ponownie
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  const isDisabled = readOnly || disabled
  const MAX_NESTING_DEPTH = 3

  const renderFieldForRow = (
    rowIndex: number,
    row: Record<string, unknown>,
    f: DefinitionField,
    pathPrefix: string[],
    depth: number
  ): React.ReactNode => {
    const key = f.key
    const path = pathPrefix.concat(key)
    const val = getNested(row, path)
    const required = f.required === true
    const inputId = `field-${path?.join('_')}-${rowIndex}-${key}`.replace(/\./g, '__')

    const update = (v: unknown) => updateRowNested(rowIndex, path, v)

    if (f.type === 'group') {
      if (depth >= MAX_NESTING_DEPTH) return null
      const nestedFields = Array.isArray(f.fields) ? f.fields : Array.isArray(f.nestedFields) ? f.nestedFields : Array.isArray(f.level3Fields) ? f.level3Fields : []
      return (
        <div key={key} className="border border-neutral-200 dark:border-neutral-600 rounded-lg p-3 mt-2 bg-white dark:bg-neutral-900/30">
          <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
            {f.label ?? key}
            <span className="text-xs text-neutral-400 font-normal ml-1">(typ: {getFieldTypeLabel(f.type)})</span>
          </div>
          <div className="space-y-4">
            {nestedFields.map((subF) =>
              subF && typeof subF === 'object' && typeof (subF as DefinitionField).key === 'string'
                ? renderFieldForRow(rowIndex, row, subF as DefinitionField, path, depth + 1)
                : null
            )}
          </div>
        </div>
      )
    }

    if (f.type === 'richText') {
      return (
        <div key={key} className="space-y-1">
          <label htmlFor={inputId} className="block text-sm font-medium">
            {f.label ?? key}
            <span className="text-xs text-neutral-400 font-normal ml-1">(typ: {getFieldTypeLabel(f.type)})</span>
            {required && ' *'}
          </label>
          <textarea
            id={inputId}
            disabled={isDisabled}
            value={getDisplayString(val)}
            onChange={(e) => update(e.target.value)}
            className="w-full min-h-[120px] px-3 py-2 border rounded text-sm"
            rows={5}
          />
          <p className="text-xs text-neutral-500">Rich text (HTML możesz wpisać ręcznie)</p>
        </div>
      )
    }

    if (f.type === 'image') {
      const numVal = typeof val === 'number' ? val : val == null ? '' : Number(val)
      return (
        <div key={key} className="space-y-1">
          <label htmlFor={inputId} className="block text-sm font-medium">
            {f.label ?? key}
            <span className="text-xs text-neutral-400 font-normal ml-1">(typ: {getFieldTypeLabel(f.type)})</span>
            {required && ' *'}
          </label>
          <select
            id={inputId}
            disabled={isDisabled}
            value={numVal === '' ? '' : String(numVal)}
            onChange={(e) => {
              const v = e.target.value
              update(v === '' ? null : parseInt(v, 10))
            }}
            className="w-full px-3 py-2 border rounded text-sm"
          >
            <option value="">— wybierz obraz (Media) —</option>
            {mediaOptions.map((opt) => (
              <option key={opt.value} value={String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )
    }

    if (f.type === 'textarea') {
      return (
        <div key={key} className="space-y-1">
          <label htmlFor={inputId} className="block text-sm font-medium">
            {f.label ?? key}
            <span className="text-xs text-neutral-400 font-normal ml-1">(typ: {getFieldTypeLabel(f.type)})</span>
            {required && ' *'}
          </label>
          <textarea
            id={inputId}
            disabled={isDisabled}
            value={getDisplayString(val)}
            onChange={(e) => update(e.target.value)}
            className="w-full min-h-[80px] px-3 py-2 border rounded text-sm"
            rows={3}
          />
        </div>
      )
    }
    if (f.type === 'number') {
      const numVal =
        typeof val === 'number' && !Number.isNaN(val)
          ? val
          : val === '' || val == null
            ? ''
            : typeof val === 'string'
              ? (Number(val) || '')
              : ''
      return (
        <div key={key} className="space-y-1">
          <label htmlFor={inputId} className="block text-sm font-medium">
            {f.label ?? key}
            <span className="text-xs text-neutral-400 font-normal ml-1">(typ: {getFieldTypeLabel(f.type)})</span>
            {required && ' *'}
          </label>
          <input
            id={inputId}
            type="number"
            disabled={isDisabled}
            value={numVal}
            onChange={(e) => {
              const v = e.target.value
              update(v === '' ? null : parseFloat(v))
            }}
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </div>
      )
    }
    if (f.type === 'date') {
      const dateVal =
        val instanceof Date
          ? val.toISOString().slice(0, 10)
          : typeof val === 'string'
            ? val.slice(0, 10)
            : ''
      return (
        <div key={key} className="space-y-1">
          <label htmlFor={inputId} className="block text-sm font-medium">
            {f.label ?? key}
            <span className="text-xs text-neutral-400 font-normal ml-1">(typ: {getFieldTypeLabel(f.type)})</span>
            {required && ' *'}
          </label>
          <input
            id={inputId}
            type="date"
            disabled={isDisabled}
            value={dateVal}
            onChange={(e) => update(e.target.value || null)}
            className="w-full px-3 py-2 border rounded text-sm"
          />
        </div>
      )
    }
    if (f.type === 'checkbox') {
      const checked = val === true || val === 'true'
      return (
        <div key={key} className="flex items-center gap-2">
          <input
            id={inputId}
            type="checkbox"
            disabled={isDisabled}
            checked={checked}
            onChange={(e) => update(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor={inputId} className="text-sm font-medium">
            {f.label ?? key}
            <span className="text-xs text-neutral-400 font-normal ml-1">(typ: {getFieldTypeLabel(f.type)})</span>
            {required && ' *'}
          </label>
        </div>
      )
    }
    if (f.type === 'select') {
      const options: string[] = f.options
        ? f.options
            .split(/\r?\n/)
            .map((o) => o.trim())
            .filter(Boolean)
        : []
      const strVal = getDisplayString(val)
      return (
        <div key={key} className="space-y-1">
          <label htmlFor={inputId} className="block text-sm font-medium">
            {f.label ?? key}
            <span className="text-xs text-neutral-400 font-normal ml-1">(typ: {getFieldTypeLabel(f.type)})</span>
            {required && ' *'}
          </label>
          <select
            id={inputId}
            disabled={isDisabled}
            value={strVal}
            onChange={(e) => update(e.target.value || null)}
            className="w-full px-3 py-2 border rounded text-sm"
          >
            <option value="">— wybierz —</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )
    }
    return (
      <div key={key} className="space-y-1">
        <label htmlFor={inputId} className="block text-sm font-medium">
          {f.label ?? key}
          <span className="text-xs text-neutral-400 font-normal ml-1">(typ: {getFieldTypeLabel(f.type)})</span>
          {required && ' *'}
        </label>
        <input
          id={inputId}
          type="text"
          disabled={isDisabled}
          value={getDisplayString(val)}
          onChange={(e) => update(e.target.value)}
          className="w-full px-3 py-2 border rounded text-sm"
        />
      </div>
    )
  }

  const displayRows = localRows.length > 0 ? localRows : [{}]

  return (
    <div className={`${fieldBaseClass} custom-collection-data-field ${showError ? 'error' : ''}`}>
      <FieldLabel label={label} path={path} required={false} />
      <div className={`${fieldBaseClass}__wrap`}>
        <FieldError path={path} showError={showError} />
        <div className="space-y-6 mt-2">
          {displayRows.map((row, index) => (
            <div
              key={index}
              className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 bg-neutral-50 dark:bg-neutral-900/50"
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                  Wpis danych #{index + 1}
                </span>
                {displayRows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    disabled={isDisabled}
                    className="text-xs px-2 py-1 rounded border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Usuń
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {definitionFields.map((f) => renderFieldForRow(index, row, f, [], 0))}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addRow}
            disabled={isDisabled}
            className="w-full py-2 px-3 rounded border-2 border-dashed border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:border-primary-500 hover:text-primary-600 dark:hover:border-primary-400 dark:hover:text-primary-400 text-sm font-medium transition-colors"
          >
            + Dodaj wpis danych
          </button>
          <div className="pt-4 mt-4 border-t border-neutral-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => submit?.()}
              disabled={isDisabled}
              className="px-4 py-2 rounded bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white text-sm font-medium disabled:opacity-50 disabled:pointer-events-none"
            >
              Zapisz
            </button>
          </div>
        </div>
        {description && <FieldDescription description={description} path={path} />}
      </div>
    </div>
  )
}
