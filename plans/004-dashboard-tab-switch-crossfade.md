# 004 — Crossfade the dashboard's sidebar tab panels

- **Status**: TODO
- **Commit**: 6684113
- **Severity**: MEDIUM
- **Category**: Missed opportunities (Purpose & frequency)
- **Estimated scope**: 1 file (`app/dashboard/page.tsx`), 9 edits (2 wrapper-boundary inserts + 7 near-identical panel wraps)

## Problem

`app/dashboard/page.tsx` renders one big "Main Content" column (`lg:col-span-3 space-y-6`, opens at line 1697) whose body is seven mutually-exclusive `{activeSection === "..." && (...)}` blocks — Profile, Portfolio, Gallery, Settings, Business, Packages, Subscription — selected by clicking sidebar buttons. Switching tabs teleports: the old panel's DOM is removed and the new one appears in the same frame, with no transition, even though these are large, unrelated content blocks (forms, calendars, subscription cards).

Exemplar of the pattern (first block), current code, `app/dashboard/page.tsx:1700-1704`:

```tsx
            {user?.id && (
              <AvailabilityManager ownerId={user.id} ownerType={dashboardOwnerType} />
            )}

            {activeSection === "profile" && (
              <Card>
```

...

Current code, `app/dashboard/page.tsx:2023-2026` (profile block's close, portfolio block's open):

```tsx
              </Card>
            )}

            {activeSection === "portfolio" && (
              <PortfolioManager
```

Current code, `app/dashboard/page.tsx:2774-2778` (subscription block's close, end of Main Content column):

```tsx
                }}
              />
            )}
          </div>
        </div>
```

All seven blocks share the identical outer shape `{activeSection === "<name>" && ( <root> ... </root> )}` at a fixed 12-space indent. The full table of every block is in Steps below — do not skip any.

## Target

Wrap the whole run of seven blocks (not `IncomingAvailabilityRequests` or `AvailabilityManager`, which render on every tab) in a single `<AnimatePresence mode="wait">`, and wrap each block's root element in a `motion.div` with a unique `key` so `AnimatePresence` can tell which panel is entering vs. leaving. `mode="wait"` means the outgoing panel fully fades out before the incoming one fades in — deliberate here, since these panels are unrelated content with no shared layout to bridge.

Worked example — the profile block, in full:

```tsx
            {user?.id && (
              <AvailabilityManager ownerId={user.id} ownerType={dashboardOwnerType} />
            )}

            <AnimatePresence mode="wait">
              {activeSection === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Card>
                    <!-- everything that was already inside <Card>...</Card> stays exactly as-is -->
                  </Card>
                </motion.div>
              )}

              {activeSection === "portfolio" && (
                <motion.div
                  key="portfolio"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                >
                  <PortfolioManager
                    items={portfolioItems}
                    loading={portfolioItemsLoading}
                    onItemsLoaded={setPortfolioItems}
                    onRefresh={loadPortfolioItems}
                    onPreviewGallery={() => setActiveSection("gallery")}
                  />
                </motion.div>
              )}

              <!-- gallery, settings, business, packages, subscription follow the same pattern -->
            </AnimatePresence>
          </div>
        </div>
```

Every block gets the exact same `motion.div` props — only `key` and the wrapped root element differ. `duration: 0.18` and `ease: [0.22, 1, 0.36, 1]` (this app's shared curve, `cubic-bezier(0.22, 1, 0.36, 1)`, already defined at `app/globals.css:171`) apply to all seven identically. Exit only fades (`{ opacity: 0 }`, no `y` change) — a small `y` on exit while the next panel also animates in from `y: 4` would fight and look like a bounce; enter carries the motion, exit is a plain fade.

## Repo conventions to follow

- `motion` is already imported in this file: `app/dashboard/page.tsx:6`. Add `AnimatePresence` to that same import line — do not add a second `framer-motion` import.
- `cubic-bezier(0.22, 1, 0.36, 1)` is this app's one shared interaction curve (`app/globals.css:171`, reused at `:175`, `:194`, `:204`, `:215`); its Framer Motion array form is `[0.22, 1, 0.36, 1]`. Use it, don't invent a new curve.
- `AnimatePresence mode="wait"` with keyed `motion.div` children is already used correctly in this codebase for step transitions: `app/onboarding/page.tsx:228-229` (`<AnimatePresence mode="wait"><motion.div key={...} ...>`). Match that shape.

## Steps

1. In `app/dashboard/page.tsx`, change the import at line 6 from `import { motion } from "framer-motion"` to `import { AnimatePresence, motion } from "framer-motion"`.
2. Insert `<AnimatePresence mode="wait">` on its own line immediately after line 1702 (the `)}` that closes the `{user?.id && (<AvailabilityManager .../>)}` block) and before line 1704 (`{activeSection === "profile" && (`). The blank line 1703 may stay or go — either is fine.
3. For each of the seven blocks below, wrap the block's root element in a `motion.div` with `key`, `initial={{ opacity: 0, y: 4 }}`, `animate={{ opacity: 1, y: 0 }}`, `exit={{ opacity: 0 }}`, `transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}` — i.e. insert the `motion.div` opening tag on the line right after `{activeSection === "..." && (` and its closing `</motion.div>` on the line right before the block's matching `)}`. Do not alter anything between the root element's own opening and closing tags.

   | Block | Opens at | Root element | Closes at |
   | --- | --- | --- | --- |
   | Profile | `app/dashboard/page.tsx:1704` (`{activeSection === "profile" && (`) | `<Card>` | `app/dashboard/page.tsx:2024` (`)}`, `</Card>` is the line just above at `:2023`) |
   | Portfolio | `:2026` (`{activeSection === "portfolio" && (`) | `<PortfolioManager ... />` (self-closing) | `:2034` (`)}`) |
   | Gallery | `:2036` (`{activeSection === "gallery" && (`) | `<Card>` | `:2202` (`)}`, `</Card>` at `:2201`) |
   | Settings | `:2204` (`{activeSection === "settings" && (`) | `<Card>` | `:2290` (`)}`, `</Card>` at `:2289`) |
   | Business | `:2292` (`{activeSection === "business" && isStudioOrStoreAccount && (`) | `<div className="space-y-6">` | `:2609` (`)}`, `</div>` at `:2608`) |
   | Packages | `:2611` (`{activeSection === "packages" && isStudioOrStoreAccount && (`) | `<div className="space-y-6">` | `:2765` (`)}`, `</div>` at `:2764`) |
   | Subscription | `:2767` (`{activeSection === "subscription" && (`) | `<SubscriptionCard ... />` (self-closing) | `:2776` (`)}`) |

   Use `key="profile"`, `key="portfolio"`, `key="gallery"`, `key="settings"`, `key="business"`, `key="packages"`, `key="subscription"` respectively — plain lowercase strings matching each `activeSection` value, so `AnimatePresence` can tell blocks apart.
4. Insert `</AnimatePresence>` on its own line immediately after line 2776 (now shifted by whatever you inserted above — find it by content, not by original line number: the `)}` that closes the Subscription block) and before the `</div>` that closes the "Main Content" column.
5. Business and Packages are gated by `isStudioOrStoreAccount` in addition to `activeSection` — leave that condition exactly as-is (`{activeSection === "business" && isStudioOrStoreAccount && (`); only add the `motion.div` wrapper inside, same as the others.

## Boundaries

- Do NOT wrap `IncomingAvailabilityRequests` (`:1698`) or `AvailabilityManager` (`:1700-1702`) — they render on every tab, not per-section, and must stay outside `AnimatePresence`.
- Do NOT touch the `<aside>` sidebar column (the tab buttons themselves, lines before `:1697`) — only the Main Content column's seven panels change.
- Do NOT change any state, props, or business logic inside any panel — this is a motion-wrapper-only change, seven times.
- Do NOT add `AnimatePresence` around anything other than these seven blocks (no wrapping the whole page, no wrapping the sidebar).
- If any block's opening/closing line numbers or root element don't match the table above (drift since commit `6684113`), STOP and report instead of improvising — do not guess at bracket matching by eye on a file this size.

## Verification

- **Mechanical**: `npx tsc --noEmit -p tsconfig.json` — should not introduce any new errors in `app/dashboard/page.tsx`.
- **Feel check**: log into the dashboard and click through every sidebar tab (Profile, Portfolio, Gallery, Settings, Subscription, and — on a studio/store test account — Business and Packages) and confirm:
  - Each switch fades the old panel out and the new one in with a slight upward settle — no instant content swap, no flash of both panels overlapping.
  - Clicking the same tab twice in a row (e.g. Profile → Profile) does not restart or glitch the animation — `AnimatePresence` with a stable `key` should simply skip re-animating since the section didn't change.
  - Rapidly clicking between two tabs several times does not leave the transition stuck mid-fade or stack up duplicate panels — `mode="wait"` should always resolve to exactly one panel.
  - In DevTools Animations panel, set playback to 10% on a tab switch and confirm the outgoing panel fully fades before the incoming panel starts (that's what `mode="wait"` guarantees) rather than the two crossing over.
  - Toggle `prefers-reduced-motion` (Rendering panel) and confirm tab switching still works and content still becomes visible — opacity feedback should remain even if position/timing is reduced.
- **Done when**: all seven dashboard tabs crossfade on switch using `duration: 0.18` and `ease: [0.22, 1, 0.36, 1]`, and `tsc --noEmit` shows no new errors.
