export type LegalSection = {
  heading: string
  paragraphs: string[]
  bullets?: string[]
}

export type LegalDocument = {
  slug: 'privacy' | 'terms' | 'cookies'
  title: string
  description: string
  lastUpdated: string
  intro: string
  sections: LegalSection[]
}

export const LEGAL_CONTROLLER = {
  name: 'IrishNightlife / IrishNightlife.ie',
  email: 'privacy@irishnightlife.ie',
} as const

export const LEGAL_LAST_UPDATED = '14 November 2026'
