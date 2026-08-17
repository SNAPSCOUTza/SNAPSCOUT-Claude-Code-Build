# Animation plans

Written by the `improve-animations` skill from the findings in a prior `find-animation-opportunities` sweep. Each plan is self-contained — hand any one of them to `improve-animations execute <plan>` or to any coding agent directly.

| # | Title | Severity | File(s) | Status |
| --- | --- | --- | --- | --- |
| [001](001-desktop-landing-hero-fade-in.md) | Wire up the dead hero fade-in on the desktop landing page | HIGH | `components/desktop/desktop-landing.tsx` | TODO |
| [002](002-subscription-card-modal-transitions.md) | Animate the subscription card's Role Selection and Cancel modals | HIGH | `components/dashboard/subscription-card.tsx` | TODO |
| [003](003-mobile-filter-drawer-exit-animation.md) | Give the mobile filter drawer a real exit animation | MEDIUM | `app/studios-stores/page.tsx`, `app/studios/page.tsx` | TODO |
| [004](004-dashboard-tab-switch-crossfade.md) | Crossfade the dashboard's sidebar tab panels | MEDIUM | `app/dashboard/page.tsx` | TODO |

## Recommended execution order

1. **001** — single file, zero risk (adds props to already-imported `motion` components, no new wrapper elements). Do this first as a warm-up / sanity check that the toolchain (`tsc --noEmit`) is clean before touching riskier files.
2. **002** — single file, low risk, but touches a real payment/subscription flow — verify the feel check against a live subscription state (active or free) before considering it done.
3. **003** — two files with an identical duplicated block; do both in the same sitting so they don't drift apart again.
4. **004** — largest and riskiest change (`app/dashboard/page.tsx` is a large, actively-used file this session already touched for the profile-picture and avatar-resize fixes). Do this last, after 001–003 have validated the approach on smaller files. Read the Boundaries section closely — it explicitly says to stop rather than guess if line numbers have drifted.

## Dependencies

None of the four plans touch the same file, so they can be executed in any order or in parallel — the order above is a risk-based recommendation, not a hard dependency chain.

## Notes

- All four plans reuse this app's one shared motion curve, `cubic-bezier(0.22, 1, 0.36, 1)` (`app/globals.css:171`), rather than introducing new tokens — see each plan's "Repo conventions to follow" section for the exemplar it was matched against.
- Findings this run explicitly did **not** produce plans for (see the original `find-animation-opportunities` report): the shadcn `Toast` component's asymmetric enter/exit (only referenced by an internal dev tool, not user-facing) and the mobile bottom tab bar (correctly minimal already, high-frequency).
