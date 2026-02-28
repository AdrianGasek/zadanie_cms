/**
 * ESM loader that treats .css (and .scss, .sass, .less) as empty modules.
 * Use with: node --import ./scripts/css-loader.mjs node_modules/payload/bin.js migrate:reset
 * Required because Payload CLI loads config via tsx and dependencies (e.g. react-image-crop)
 * import .css files, which Node does not support by default.
 */
const styleExtensions = ['.css', '.scss', '.sass', '.less']

export async function load(url, context, nextLoad) {
  const isStyle = styleExtensions.some((ext) => url.endsWith(ext) || url.includes(`${ext}?`))
  if (isStyle) {
    return { format: 'module', shortCircuit: true, source: 'export {}' }
  }
  return nextLoad(url, context)
}
