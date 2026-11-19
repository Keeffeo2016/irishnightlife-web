# Compliance checklist (IrishNightlife.ie)

Operational companion to the in-app Privacy Policy, Terms of Use, and Cookie Notice. **Not legal advice.** Have a solicitor review policy text before a hard public launch.

**Controller contact:** `privacy@irishnightlife.ie` (IrishNightlife / IrishNightlife.ie)

## Pre-launch

- [ ] `/privacy`, `/terms`, and `/cookies` load and match what the product actually does
- [ ] Footer Legal links work on mobile and desktop
- [ ] Signup requires Terms + Privacy acknowledgment (email and OAuth paths)
- [ ] `privacy@irishnightlife.ie` inbox is monitored (or forwards to a watched mailbox)
- [ ] Supabase and Vercel account owners know who handles data-subject requests

## Processors / DPAs

Confirm you have (or have accepted) processor terms / DPAs for:

| Processor | Role today |
|-----------|------------|
| Supabase | Auth, database, storage |
| Vercel | Hosting |
| Google / Apple | Optional OAuth sign-in |
| Google Fonts | Font delivery |
| OpenStreetMap | Map tiles |

Re-check these when you add Stripe, email providers, analytics SDKs, or AI services that store personal data.

## GDPR rights requests (MVP process)

1. Receive request at `privacy@irishnightlife.ie` (access, deletion, correction, etc.).
2. Verify the requester’s identity reasonably (e.g. confirm control of the account email).
3. Act within **one month** (extend only where GDPR allows, and tell the requester).
4. For deletion: remove or anonymise `public.users` / related app data and handle Auth user deletion via Supabase as appropriate; note venue content may need owner hand-off.
5. Log the request date, type, and outcome internally (even a simple shared inbox label or spreadsheet is fine at MVP).

Self-service export/delete UI is **not** required for this pass.

## Cookie banner — when to add one

**Not required for the current stack** if you only use:

- Strictly necessary auth session cookies
- First-party page views (path + timestamp, no user id)
- Functional local/session storage as described in the Cookie Notice

**Add a consent mechanism before** shipping non-essential cookies or trackers, for example:

- Google Analytics / ads / Meta Pixel
- Marketing email pixels
- Third-party session replay or heatmaps
- Any cookie that is not strictly necessary for the service the user requested

## Keep policies in sync

Update Privacy, Terms, and Cookies (and this checklist) when you ship:

- [ ] Stripe or any payments
- [ ] Transactional or marketing email
- [ ] Contact / support forms that store messages
- [ ] Third-party analytics or advertising
- [ ] AI features that store prompts or personal data
- [ ] New account fields (phone, date of birth, preferences, reviews)

Legal page content lives in `src/content/legal/`.
