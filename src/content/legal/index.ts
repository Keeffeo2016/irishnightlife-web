import { cookiesDocument } from './cookies'
import { privacyDocument } from './privacy'
import { termsDocument } from './terms'
import type { LegalDocument } from './types'

export {
  LEGAL_CONTROLLER,
  LEGAL_LAST_UPDATED,
  type LegalDocument,
  type LegalSection,
} from './types'
export { cookiesDocument, privacyDocument, termsDocument }

export const legalDocuments: LegalDocument[] = [
  privacyDocument,
  termsDocument,
  cookiesDocument,
]

export function getLegalDocument(
  slug: LegalDocument['slug']
): LegalDocument {
  switch (slug) {
    case 'privacy':
      return privacyDocument
    case 'terms':
      return termsDocument
    case 'cookies':
      return cookiesDocument
    default: {
      const _exhaustive: never = slug
      return _exhaustive
    }
  }
}
