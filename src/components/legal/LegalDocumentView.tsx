import Link from 'next/link'
import type { LegalDocument } from '@/content/legal'

const RELATED: { href: string; label: string }[] = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Use' },
  { href: '/cookies', label: 'Cookie Notice' },
]

export function LegalDocumentView({ document }: { document: LegalDocument }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 border-b border-border pb-8">
        <p className="mb-2 text-sm text-muted-foreground">
          Last updated: {document.lastUpdated}
        </p>
        <h1 className="font-[family-name:var(--font-outfit)] text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {document.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {document.intro}
        </p>
      </header>

      <div className="space-y-10">
        {document.sections.map((section) => (
          <section key={section.heading} aria-labelledby={`legal-${slugify(section.heading)}`}>
            <h2
              id={`legal-${slugify(section.heading)}`}
              className="mb-3 font-[family-name:var(--font-outfit)] text-xl font-semibold text-foreground"
            >
              {section.heading}
            </h2>
            <div className="space-y-3 text-base leading-relaxed text-muted-foreground">
              {section.paragraphs.map((paragraph, index) => (
                <p key={`${section.heading}-p-${index}`}>{paragraph}</p>
              ))}
              {section.bullets && section.bullets.length > 0 ? (
                <ul className="list-disc space-y-2 pl-5">
                  {section.bullets.map((bullet, index) => (
                    <li key={`${section.heading}-b-${index}`}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </section>
        ))}
      </div>

      <nav
        className="mt-12 border-t border-border pt-6"
        aria-label="Related legal pages"
      >
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {RELATED.filter((item) => item.href !== `/${document.slug}`).map(
            (item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            )
          )}
        </ul>
      </nav>
    </article>
  )
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
