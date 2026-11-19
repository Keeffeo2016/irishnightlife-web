import {
  LEGAL_CONTROLLER,
  LEGAL_LAST_UPDATED,
  type LegalDocument,
} from './types'

export const termsDocument: LegalDocument = {
  slug: 'terms',
  title: 'Terms of Use',
  description:
    'Terms governing use of IrishNightlife.ie for consumers and venue owners.',
  lastUpdated: LEGAL_LAST_UPDATED,
  intro: `These Terms of Use (“Terms”) govern access to and use of irishnightlife.ie operated by ${LEGAL_CONTROLLER.name} (“we”, “us”, “our”). By using the site or creating an account, you agree to these Terms.`,
  sections: [
    {
      heading: 'The service',
      paragraphs: [
        'IrishNightlife.ie is a nightlife discovery platform for Ireland. We list venues and events, offer a planner to help you choose a night out, and provide tools for venue owners to manage listings. We do not operate venues, sell tickets by default, or guarantee that any event will take place as described.',
      ],
    },
    {
      heading: 'Eligibility (18+)',
      paragraphs: [
        'The service is intended for users aged 18 or over. Nightlife venues and events may be age-restricted by law or by the venue. You are responsible for complying with age and entry rules at any venue you visit.',
      ],
    },
    {
      heading: 'Accounts',
      paragraphs: [
        'You may create a consumer account or a venue-owner account. You must provide accurate information and keep your login credentials secure. You are responsible for activity under your account. We may suspend or terminate accounts that abuse the service, submit misleading content, or breach these Terms.',
      ],
    },
    {
      heading: 'Venue owners and listings',
      paragraphs: [
        'If you register a venue, you confirm you are authorised to represent that venue. Listings may remain hidden until approved by an administrator. You are responsible for the accuracy of venue details, images, and events you submit. We may edit, refuse, or remove content that is unlawful, misleading, or inconsistent with the platform.',
      ],
    },
    {
      heading: 'Acceptable use',
      paragraphs: ['You agree not to:'],
      bullets: [
        'Use the service for unlawful purposes.',
        'Scrape, overload, or interfere with the site or its security.',
        'Upload content you do not have rights to use.',
        'Impersonate others or misrepresent your affiliation with a venue.',
        'Attempt to access another user’s account or non-public areas without authorisation.',
      ],
    },
    {
      heading: 'Intellectual property',
      paragraphs: [
        'The IrishNightlife.ie brand, site design, and original content we publish are owned by us or our licensors. Venue owners retain rights in content they upload, and grant us a licence to host and display that content for operating the platform. You may not copy or reuse our branding without permission.',
      ],
    },
    {
      heading: 'Third-party services and maps',
      paragraphs: [
        'The site may load third-party resources such as map tiles and fonts, and may offer sign-in via Google or Apple. Those services have their own terms and privacy practices. Venue websites, ticket links, or social profiles we surface are operated by third parties, not by us.',
      ],
    },
    {
      heading: 'Disclaimers',
      paragraphs: [
        'Event times, line-ups, prices, and venue details can change. Always confirm with the venue. The planner provides suggestions based on the information available to us; it is not a guarantee of availability, suitability, or safety. To the fullest extent permitted by law, the service is provided “as is” without warranties of uninterrupted or error-free operation.',
      ],
    },
    {
      heading: 'Limitation of liability',
      paragraphs: [
        'To the fullest extent permitted by applicable law, we are not liable for indirect or consequential loss, loss of profits, or loss arising from venue entry decisions, event cancellations, or third-party websites. Nothing in these Terms excludes liability that cannot be excluded under Irish law (including for death or personal injury caused by negligence, or for fraud).',
      ],
    },
    {
      heading: 'Privacy',
      paragraphs: [
        'How we process personal data is described in our Privacy Policy. By creating an account you acknowledge that policy.',
      ],
    },
    {
      heading: 'Changes',
      paragraphs: [
        'We may update these Terms as the product evolves. Continued use after changes are posted constitutes acceptance of the updated Terms. The “Last updated” date shows when they last changed.',
      ],
    },
    {
      heading: 'Governing law',
      paragraphs: [
        'These Terms are governed by the laws of Ireland. Courts in Ireland have exclusive jurisdiction, without prejudice to any mandatory consumer protections that apply where you live in the EU/EEA.',
      ],
    },
    {
      heading: 'Contact',
      paragraphs: [
        `Questions about these Terms: ${LEGAL_CONTROLLER.email}.`,
      ],
    },
  ],
}
