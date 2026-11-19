import type { Metadata } from 'next'
import { LegalDocumentView } from '@/components/legal/LegalDocumentView'
import { privacyDocument } from '@/content/legal'

export const metadata: Metadata = {
  title: 'Privacy Policy — IrishNightlife.ie',
  description: privacyDocument.description,
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return <LegalDocumentView document={privacyDocument} />
}
