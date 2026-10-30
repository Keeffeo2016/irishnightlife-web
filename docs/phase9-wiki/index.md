# Phase 9 wiki index

Wiki for IrishNightlife.ie Phase 9 (production readiness). Claims are dated; code claims cite commit.

Location for Phase 9: `web/docs/phase9-wiki/`. Earlier redesign tribal knowledge lives in [`../wiki/`](../wiki/index.md) — keep both; do not duplicate Phase 1–8 pages here.

## Status

| Page | Summary |
|---|---|
| [preflight](./preflight.md) | Git safety, baselines at start of Phase 9 |
| [security](./security.md) | Security findings (ingest from audit) |
| [seo](./seo.md) | SEO audit results |
| [a11y-perf](./a11y-perf.md) | Accessibility, images, query limits |
| [lint-plan](./lint-plan.md) | ESLint 10-error fix plan |
| [remediation](./remediation.md) | Approved fixes applied during Phase 9 |
| [mobile-regression](./mobile-regression.md) | Viewport matrix + public smoke; auth dashboard blocked |
| [REPORT](./REPORT.md) | Final production-readiness report — NOT READY FOR RELEASE |

## Goal

Audit and harden for production on `feature/ui-redesign`. No new product features. No deploy/push without approval.
