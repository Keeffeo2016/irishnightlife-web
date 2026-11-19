import {
  LEGAL_CONTROLLER,
  LEGAL_LAST_UPDATED,
  type LegalDocument,
} from './types'

export const privacyDocument: LegalDocument = {
  slug: 'privacy',
  title: 'Privacy Policy',
  description:
    'How IrishNightlife.ie collects, uses, and protects personal data under Irish and EU data protection law.',
  lastUpdated: LEGAL_LAST_UPDATED,
  intro: `This Privacy Policy explains how ${LEGAL_CONTROLLER.name} (“we”, “us”, “our”) processes personal data when you use irishnightlife.ie and related services. It is written to reflect how the product works today. It is not legal advice.`,
  sections: [
    {
      heading: 'Who is responsible',
      paragraphs: [
        `The data controller for IrishNightlife.ie is ${LEGAL_CONTROLLER.name}. For privacy requests, contact ${LEGAL_CONTROLLER.email}.`,
      ],
    },
    {
      heading: 'What we collect',
      paragraphs: [
        'Depending on how you use the site, we may process the following categories of data:',
      ],
      bullets: [
        'Account data: email address, full name, password (stored by our auth provider), and account role (consumer, venue owner, or admin).',
        'OAuth data: if you sign in with Google or Apple, we receive the identity details those providers share for authentication.',
        'Venue business data: venue name, street address, Eircode, city, county, description, photos, and optional contact details you choose to publish.',
        'Favourites: venues or events you save to your profile.',
        'Planner preferences: choices you make in the Tonight Planner (for example occasion, vibe, or budget). These are used to generate a plan and may appear in the page URL; checklist progress may be stored in your browser’s local storage.',
        'Usage analytics (first-party): page path and timestamp only, stored in our database to understand which public pages are viewed. We do not attach a user id to these records.',
        'Technical data: authentication session cookies required to keep you signed in.',
      ],
    },
    {
      heading: 'Why we process data (lawful bases)',
      paragraphs: [
        'We process personal data where necessary to provide the service you request (contract), where we have a legitimate interest in operating and improving a nightlife discovery platform, or where we need to meet legal obligations. Account creation and venue listing are processed to deliver those features. First-party page-view counts support product and venue insights without identifying individual visitors in those records.',
      ],
    },
    {
      heading: 'How we use data',
      paragraphs: ['We use personal data to:'],
      bullets: [
        'Create and manage consumer and venue-owner accounts.',
        'Publish and moderate venue and event listings (venue listings may remain hidden until approved).',
        'Show saved favourites on your profile.',
        'Operate the planner and related maps.',
        'Provide aggregated page-view insights to venue owners and admins.',
        'Secure the service and prevent abuse.',
      ],
    },
    {
      heading: 'Who we share data with (processors and third parties)',
      paragraphs: [
        'We use service providers who process data on our behalf or as part of delivering the site:',
      ],
      bullets: [
        'Supabase — authentication, database, and file storage (including venue images).',
        'Vercel — website hosting and delivery.',
        'Google and Apple — optional sign-in (OAuth) when you choose those providers.',
        'Google Fonts — font delivery used in the site appearance.',
        'OpenStreetMap — map tiles when interactive maps are shown.',
      ],
    },
    {
      heading: 'Payments',
      paragraphs: [
        'We do not currently process payments or store card details on IrishNightlife.ie. If paid subscriptions or ticketing are added later, this policy will be updated and the payment provider will be named.',
      ],
    },
    {
      heading: 'Cookies and similar technologies',
      paragraphs: [
        'We use authentication cookies that are necessary to keep you signed in, session storage to avoid double-counting a page view in a single browser session, and local storage for planner checklist state. See our Cookie Notice for details.',
      ],
    },
    {
      heading: 'Retention',
      paragraphs: [
        'We keep account and venue data while your account remains active and as needed to operate the service. You may ask us to delete your account data (subject to legal retention needs, for example dispute or security logs). Page-view records are aggregated analytics and are retained for product reporting. Browser local storage remains on your device until you clear it.',
      ],
    },
    {
      heading: 'Your rights',
      paragraphs: [
        'Under the GDPR and Irish data protection law, you may have the right to access, rectify, erase, restrict, or object to certain processing, and to data portability where applicable. You may also lodge a complaint with the Data Protection Commission (dataprotection.ie).',
        `To exercise your rights, email ${LEGAL_CONTROLLER.email}. We aim to respond within one month.`,
      ],
    },
    {
      heading: 'International transfers',
      paragraphs: [
        'Our processors may store or process data in the EU/EEA or in other countries. Where data leaves the EEA, we rely on appropriate safeguards provided by those processors (such as standard contractual clauses) as described in their documentation.',
      ],
    },
    {
      heading: 'Children',
      paragraphs: [
        'IrishNightlife.ie is aimed at adults interested in nightlife. We do not knowingly create accounts for children. If you believe a child has provided personal data, contact us so we can delete it.',
      ],
    },
    {
      heading: 'Changes',
      paragraphs: [
        'We may update this policy when the product changes (for example payments, marketing email, or new analytics). The “Last updated” date at the top will change when we do.',
      ],
    },
  ],
}
