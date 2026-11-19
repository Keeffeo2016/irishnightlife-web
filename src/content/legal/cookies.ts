import {
  LEGAL_CONTROLLER,
  LEGAL_LAST_UPDATED,
  type LegalDocument,
} from './types'

export const cookiesDocument: LegalDocument = {
  slug: 'cookies',
  title: 'Cookie Notice',
  description:
    'How IrishNightlife.ie uses cookies and similar technologies in the browser.',
  lastUpdated: LEGAL_LAST_UPDATED,
  intro: `This Cookie Notice explains how ${LEGAL_CONTROLLER.name} uses cookies and similar technologies on irishnightlife.ie. It should be read with our Privacy Policy.`,
  sections: [
    {
      heading: 'What are cookies and similar technologies',
      paragraphs: [
        'Cookies are small text files stored on your device. We also use session storage and local storage in the browser for limited, functional purposes. These technologies help the site work and help us understand which public pages are viewed.',
      ],
    },
    {
      heading: 'Cookies we use',
      paragraphs: [
        'We currently use authentication cookies provided through our sign-in system (Supabase). These cookies are necessary to keep you signed in and to secure account sessions. Without them, account features such as favourites and the venue dashboard cannot work.',
      ],
    },
    {
      heading: 'Session storage',
      paragraphs: [
        'We use session storage to remember that a page view was already recorded for a path during the current browser session. This avoids counting the same page repeatedly while you navigate. The value is a simple flag (path only) and is cleared when you close the tab/window.',
      ],
    },
    {
      heading: 'Local storage',
      paragraphs: [
        'The Tonight Planner may store checklist progress in local storage on your device (keys prefixed with irishnightlife:planner-checks). This data stays in your browser and is not sent to our servers as part of that checklist feature.',
      ],
    },
    {
      heading: 'First-party analytics',
      paragraphs: [
        'When you visit public pages, we may record the page path and a timestamp in our own database (page views). These records do not include your user id. We use them for product and venue insights. We do not currently use third-party advertising or analytics cookies (such as Google Analytics).',
      ],
    },
    {
      heading: 'Third-party resources',
      paragraphs: [
        'Some pages load fonts from Google Fonts and map tiles from OpenStreetMap. Those providers may process technical connection data (such as IP address) according to their own policies when your browser requests those resources. We do not set advertising cookies for those embeds.',
      ],
    },
    {
      heading: 'Consent and necessary cookies',
      paragraphs: [
        'Strictly necessary cookies (including authentication session cookies) are used to provide the service you request and do not require consent under applicable ePrivacy rules. We do not currently set non-essential marketing or advertising cookies. If we introduce non-essential trackers later, we will update this notice and add an appropriate consent mechanism.',
      ],
    },
    {
      heading: 'How to control cookies',
      paragraphs: [
        'You can delete or block cookies in your browser settings. If you block authentication cookies, you will not be able to stay signed in. You can also clear site data (including local and session storage) from your browser.',
      ],
    },
    {
      heading: 'Contact',
      paragraphs: [
        `Questions about cookies: ${LEGAL_CONTROLLER.email}.`,
      ],
    },
  ],
}
