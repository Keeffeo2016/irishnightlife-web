/**
 * Serialize JSON-LD for embedding in a <script type="application/ld+json"> tag.
 * Escapes characters that can break out of the script element when user-controlled
 * strings contain HTML-sensitive sequences such as </script>.
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}
