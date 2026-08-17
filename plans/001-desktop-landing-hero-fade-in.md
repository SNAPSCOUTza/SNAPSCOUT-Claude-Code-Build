# 001 — Wire up the dead hero fade-in on the desktop landing page

- **Status**: TODO
- **Commit**: 6684113
- **Severity**: HIGH
- **Category**: Missed opportunities (Purpose & frequency)
- **Estimated scope**: 1 file, ~6 small edits

## Problem

`components/desktop/desktop-landing.tsx` is the marketing hero rendered for every desktop/tablet visitor (`app/page.tsx` picks it via the `x-device-type` header). Six elements in the hero are wrapped in Framer Motion components but have **no animation props at all** — `initial`/`animate`/`whileInView`/`transition` are all missing, so they render exactly like plain `<div>`/`<h1>`/`<p>` tags. One section below, at line 104, the same file does this correctly. This looks like an unfinished wire-up, not an intentional static choice — nothing in the file documents skipping animation on the hero specifically.

Current code, `components/desktop/desktop-landing.tsx:36-97`:

```tsx
              <div className="mx-auto max-w-4xl text-center">
                <motion.div>
                  <Badge variant="secondary" className="mb-4 bg-red-50 text-red-700">
                    ✨ Your Local Companion
                  </Badge>
                </motion.div>

                <motion.h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                  Connecting you with the people and tools to give you the utility to create
                  <Badge variant="secondary" className="ml-4 bg-yellow-100 text-yellow-800 text-sm">
                    Coming Soon
                  </Badge>
                </motion.h1>

                <motion.p className="mt-6 text-lg leading-8 text-gray-700 max-w-2xl mx-auto">
                  Discover talented local photographers, videographers, and content creators in your area based on
                  portfolio quality. Your local companion for finding the perfect creative partner
                </motion.p>

                <motion.div className="mt-10 flex items-center justify-center gap-x-6">
                  <PreviewButtonWithRedHover
                    onClick={() => window.open("https://www.youtube.com/watch?v=cpQKutRoglo", "_blank")}
                    className="h-11 px-6"
                  >
                    Preview
                  </PreviewButtonWithRedHover>
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 px-6 bg-transparent hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <Link href="/onboarding">
                      <UserPlus className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
                      Create Your Profile
                    </Link>
                  </Button>
                </motion.div>

                <motion.p className="mt-4 text-sm text-gray-600">
                  Launching Soon • Be the first to know • Join our waitlist
                </motion.p>
              </div>
            </div>

            {/* Trust Indicators */}
            <motion.div className="mt-16 container mx-auto px-4">
              <div className="flex items-center justify-center space-x-8 text-gray-700">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm">Verified Creators</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm">Secure Payments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span className="text-sm">Quality Guaranteed</span>
                </div>
              </div>
            </motion.div>
```

## Target

Add the same prop shape the file already uses correctly one section down (see Repo conventions below) to each of the six hero `motion.*` elements, staggered by 80ms per element so they reveal in reading order: badge → headline → subtext → CTA row → "Launching Soon" line → trust indicators.

```tsx
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0 }}
                >
                  <Badge variant="secondary" className="mb-4 bg-red-50 text-red-700">
                    ✨ Your Local Companion
                  </Badge>
                </motion.div>

                <motion.h1
                  className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.08 }}
                >
                  Connecting you with the people and tools to give you the utility to create
                  <Badge variant="secondary" className="ml-4 bg-yellow-100 text-yellow-800 text-sm">
                    Coming Soon
                  </Badge>
                </motion.h1>

                <motion.p
                  className="mt-6 text-lg leading-8 text-gray-700 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.16 }}
                >
                  Discover talented local photographers, videographers, and content creators in your area based on
                  portfolio quality. Your local companion for finding the perfect creative partner
                </motion.p>

                <motion.div
                  className="mt-10 flex items-center justify-center gap-x-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.24 }}
                >
                  <PreviewButtonWithRedHover
                    onClick={() => window.open("https://www.youtube.com/watch?v=cpQKutRoglo", "_blank")}
                    className="h-11 px-6"
                  >
                    Preview
                  </PreviewButtonWithRedHover>
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 px-6 bg-transparent hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <Link href="/onboarding">
                      <UserPlus className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
                      Create Your Profile
                    </Link>
                  </Button>
                </motion.div>

                <motion.p
                  className="mt-4 text-sm text-gray-600"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.32 }}
                >
                  Launching Soon • Be the first to know • Join our waitlist
                </motion.p>
              </div>
            </div>

            {/* Trust Indicators */}
            <motion.div
              className="mt-16 container mx-auto px-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex items-center justify-center space-x-8 text-gray-700">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm">Verified Creators</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="text-sm">Secure Payments</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span className="text-sm">Quality Guaranteed</span>
                </div>
              </div>
            </motion.div>
```

No new dependency, no new easing token — `motion` is already imported at `components/desktop/desktop-landing.tsx:26`.

## Repo conventions to follow

- This exact prop shape (`initial={{ opacity: 0, y: N }}`, `whileInView={{ opacity: 1, y: 0 }}`, `viewport={{ once: true }}`, `transition={{ duration, delay }}`, no explicit `ease`) is already used correctly in the same file:
  - Exemplar A — section heading: `components/desktop/desktop-landing.tsx:104-109` (`initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}`).
  - Exemplar B — staggered grid card: `components/desktop/desktop-landing.tsx:119-124` (`initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} viewport={{ once: true }}`).
- Use `y: 20` (smaller than Exemplar A/B's 30/50) since these hero lines are text, not cards — a large vertical travel on a headline reads as a jump, not a reveal.
- Do not introduce the button/card CSS curve from `app/globals.css` (`cubic-bezier(0.22, 1, 0.36, 1)`) here — that token is scoped to interactive controls (buttons, inputs, cards), not marketing reveals, and the two nearby exemplars don't use it either. Leave `ease` unset so it inherits Framer Motion's tween default, matching Exemplars A and B exactly.

## Steps

1. In `components/desktop/desktop-landing.tsx`, add `initial`, `whileInView`, `viewport`, and `transition` props (per the Target block above) to the `motion.div` wrapping the "Your Local Companion" badge (currently `components/desktop/desktop-landing.tsx:38`, bare `<motion.div>`). Delay: `0`.
2. Add the same props to the `motion.h1` headline (currently line 44, bare `<motion.h1 className="...">`). Delay: `0.08`.
3. Add the same props to the `motion.p` subtext (currently line 51). Delay: `0.16`.
4. Add the same props to the `motion.div` wrapping the CTA button row (currently line 56). Delay: `0.24`.
5. Add the same props to the `motion.p` "Launching Soon..." line (currently line 75). Delay: `0.32`.
6. Add the same props to the `motion.div` wrapping the trust indicators row (currently line 82). Delay: `0.4`.
7. Do not touch any `Badge`, `Button`, `Link`, or icon markup inside these wrappers — only add props to the six `motion.*` opening tags themselves.

## Boundaries

- Do NOT touch the "Featured Creators" section (line 101 onward) — it already animates correctly and is the exemplar, not the target.
- Do NOT touch `app/page.tsx`, the mobile landing components, or any other file — this is a single-file, single-section change.
- Do NOT add a new easing token or import a curve from `app/globals.css`.
- Do NOT change any Tailwind classes, copy text, or component structure — motion props only.
- If the line numbers or the surrounding JSX don't match what's quoted in Problem above (drift since commit `6684113`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npx tsc --noEmit -p tsconfig.json` — should not introduce any new errors in `components/desktop/desktop-landing.tsx` (the file had none before this change).
- **Feel check**: load `/` on a desktop-width viewport (≥768px so `app/page.tsx` renders `DesktopLanding`), hard-refresh, and confirm:
  - The badge, headline, subtext, CTA buttons, "Launching Soon" line, and trust indicators each fade up from `y: 20px, opacity: 0` in that order, roughly 80ms apart — not all six popping in simultaneously.
  - Nothing pops in with a hard cut (no flash-then-static) — the reveal should be visible even on a fast connection because `whileInView` fires once the section intersects, which happens immediately since it's above the fold.
  - In DevTools Animations panel, set playback to 10% and confirm the six elements are staggered, not simultaneous, and none overshoots (no bounce — plain ease-out tween).
  - Toggle `prefers-reduced-motion` (Rendering panel) and confirm the hero content still renders (Framer Motion's built-in reduced-motion handling on `whileInView` disables the transform but content remains visible and readable — it must not stay hidden at `opacity: 0`).
- **Done when**: all six hero elements in `components/desktop/desktop-landing.tsx:38-97` animate on load with the staggered values above, and `tsc --noEmit` shows no new errors.
