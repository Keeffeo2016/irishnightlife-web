import type { Metadata } from 'next'
import { LegalDocumentView } from '@/components/legal/LegalDocumentView'
import { termsDocument } from '@/content/legal'

export const metadata: Metadata = {
  title: 'Terms of Use — IrishNightlife.ie',
  description: termsDocument.description,
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return <LegalDocumentView document={termsDocument} />
}
