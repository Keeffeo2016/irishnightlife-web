import type { Metadata } from 'next'
import { LegalDocumentView } from '@/components/legal/LegalDocumentView'
import { cookiesDocument } from '@/content/legal'

export const metadata: Metadata = {
  title: 'Cookie Notice — IrishNightlife.ie',
  description: cookiesDocument.description,
  alternates: { canonical: '/cookies' },
}

export default function CookiesPage() {
  return <LegalDocumentView document={cookiesDocument} />
}
