const EIRCODE = /^(?:[AC-FHKNPRTV-Y]\d{2}|D6W)[0-9AC-FHKNPRTV-Y]{4}$/

export function normalizeEircode(value: string): string | null {
  const compact = value.toUpperCase().replace(/[\s-]/g, '')
  if (!EIRCODE.test(compact)) return null
  return `${compact.slice(0, 3)} ${compact.slice(3)}`
}
