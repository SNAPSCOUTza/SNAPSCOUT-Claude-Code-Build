# 002 — Animate the subscription card's Role Selection and Cancel modals

- **Status**: TODO
- **Commit**: 6684113
- **Severity**: HIGH
- **Category**: Missed opportunities (Physicality & origin)
- **Estimated scope**: 1 file, 1 import + 2 modal blocks

## Problem

`components/dashboard/subscription-card.tsx` renders two modals — the plan-selection modal (opened via "Change Role & Subscribe") and the cancel-subscription confirmation — as raw conditionally-rendered `<div>`s with **zero animation**. They snap in and out instantly. This is the real subscribe/cancel flow (reached from the Dashboard's Subscription tab and from `/subscribe/plans`), not a demo or dead component.

Current code, `components/dashboard/subscription-card.tsx:403-422` (Role Selection Modal open):

```tsx
      {/* Role Selection Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Choose Your Role</h2>
                <p className="text-sm text-gray-500">Select a membership plan to continue</p>
              </div>
              <button
                onClick={() => {
                  setShowRoleModal(false)
                  setSelectedRole(null)
                  setError(null)
                }}
                className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
```

Current code, `components/dashboard/subscription-card.tsx:500-505` (Role Selection Modal close):

```tsx
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
```

Current code, `components/dashboard/subscription-card.tsx:507-511` (Cancel Confirmation Modal open):

```tsx
      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 text-center">
```

Current code, `components/dashboard/subscription-card.tsx:554-558` (Cancel Confirmation Modal close):

```tsx
              </div>
            </div>
          </div>
        </div>
      )}
```

## Target

Wrap each modal's backdrop `<div>` and panel `<div>` in `motion.div` with `AnimatePresence` so both animate in AND out. Backdrop fades; panel scales up from `0.97` with a slight rise, matching the physicality rule (never `scale(0)`) and the "modals stay centered" exemption (no `transform-origin` needed — these are centered, not trigger-anchored). Use `200ms` and this repo's own button/card curve, `cubic-bezier(0.22, 1, 0.36, 1)` — already defined globally in `app/globals.css:171` and used throughout the app's interactive-control CSS — expressed as the equivalent Framer Motion easing array `[0.22, 1, 0.36, 1]`.

Role Selection Modal, target:

```tsx
      {/* Role Selection Modal */}
      <AnimatePresence>
        {showRoleModal && (
          <motion.div
            key="role-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Choose Your Role</h2>
                  <p className="text-sm text-gray-500">Select a membership plan to continue</p>
                </div>
                <button
                  onClick={() => {
                    setShowRoleModal(false)
                    setSelectedRole(null)
                    setError(null)
                  }}
                  className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
```

...(everything between stays exactly as-is)...

```tsx
                )}
              </Button>
            </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
```

Cancel Confirmation Modal, target:

```tsx
      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            key="cancel-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full"
            >
              <div className="p-6 text-center">
```

...(everything between stays exactly as-is)...

```tsx
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
```

## Repo conventions to follow

- `cubic-bezier(0.22, 1, 0.36, 1)` is this app's one shared curve for interactive-control motion — defined in `app/globals.css:171` and reused at `:174`, `:195`, `:205`, `:215`, `:367`. Use its Framer Motion array form, `[0.22, 1, 0.36, 1]`, rather than a bare string or a different curve.
- Exemplar for the exact `AnimatePresence` + backdrop/panel scale pattern this codebase already uses for a bottom-sheet-style overlay: `app/studios-stores/page.tsx:250-256` (backdrop opacity) — note that file has the *same missing-`AnimatePresence`* bug, tracked separately in plan `003-mobile-filter-drawer-exit-animation.md`; do not copy its bug, only its prop shape.
- Radix's own dialog primitive in this repo animates centered modals with fade + `zoom-in/out-95` (`components/ui/dialog.tsx:68`) — `scale: 0.97` here is deliberately closer to `1` than Radix's `0.95` since this modal is larger (`max-w-3xl`); keep it in the `0.95-0.97` range per the physicality rule, don't drop lower.
- No `transform-origin` needed — these modals are centered via `flex items-center justify-center` on the backdrop, which is the correct, exempt case for centered modals.

## Steps

1. In `components/dashboard/subscription-card.tsx`, add `AnimatePresence` to the existing Framer Motion import. Current (this file has no framer-motion import yet — verify with a search for `"framer-motion"` in this file before editing; if one already exists, merge into it instead of adding a duplicate): add a new line `import { AnimatePresence, motion } from "framer-motion"` near the top with the other imports.
2. Replace the Role Selection Modal's opening (`components/dashboard/subscription-card.tsx:403-406`, the `{/* Role Selection Modal */}` comment through the first `<div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">`) with the Target block's opening shown above: wrap `{showRoleModal && (...)}` in `<AnimatePresence>`, turn the backdrop `<div>` into a `motion.div` with the backdrop props, and turn the panel `<div>` into a `motion.div` with the panel props. Keep every line between the panel's opening `<div>` (now `motion.div`) and its closing `</div>` completely unchanged.
3. Replace the Role Selection Modal's closing (`components/dashboard/subscription-card.tsx:500-505`) with the Target block's closing: the panel's closing tag becomes `</motion.div>`, the backdrop's closing tag becomes `</motion.div>`, both inside the new `)}` / `</AnimatePresence>`.
4. Repeat the same transformation for the Cancel Confirmation Modal: opening at `components/dashboard/subscription-card.tsx:507-511`, closing at `:554-558`. Use `key="cancel-modal-backdrop"` (not `"role-modal-backdrop"`) to keep the two `AnimatePresence` instances distinct.
5. Do not add a `key` to the inner panel `motion.div` in either modal — each is the sole child of its own `AnimatePresence`, so only the backdrop (the direct child being added/removed) needs a `key`.

## Boundaries

- Do NOT touch any content strictly between the panel's opening and closing tags in either modal (the plan grid, the feature list, the cancel confirmation's amber "What happens next" box, the buttons) — only the four wrapper tags per modal (backdrop open/close, panel open/close) change.
- Do NOT touch the "Active"/"Cancelled"/"Expired" state cards earlier in this file (lines ~286-399) — they are not modals and are out of scope.
- Do NOT add a new easing token to `app/globals.css` — reuse the existing `cubic-bezier(0.22, 1, 0.36, 1)` value inline as shown.
- Do NOT change the `onClick` handlers, state names, or any business logic.
- If `showRoleModal`/`showCancelModal` or the surrounding markup don't match what's quoted in Problem above (drift since commit `6684113`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npx tsc --noEmit -p tsconfig.json` — should not introduce any new errors in `components/dashboard/subscription-card.tsx`.
- **Feel check**: log into the dashboard, open the Subscription tab (a free/expired test account shows "Change Role & Subscribe"), and confirm:
  - Clicking "Change Role & Subscribe" fades the backdrop in and the panel scales up from ~97% with a slight rise — it does not snap in.
  - Clicking the "X" or clicking outside closes it with a matching fade/scale-down — it does not just vanish.
  - Select an active/cancelled test subscription (or stub `subscription.status = "active"`) to reach "Cancel Subscription" and confirm the same enter/exit behavior on that modal.
  - In DevTools Animations panel, set playback to 10% and confirm the panel never scales below `0.97` and never overshoots past `1` (no bounce — this is a plain ease-out/ease-in tween, not a spring).
  - Toggle `prefers-reduced-motion` (Rendering panel) and confirm the modals still open/close (opacity fade remains) but the scale/translate motion is minimal — Framer Motion's own reduced-motion handling covers this automatically since no `transform`-only CSS override is involved; just confirm nothing gets stuck invisible.
- **Done when**: both modals in `components/dashboard/subscription-card.tsx` animate in and out via `AnimatePresence`, using `duration: 0.2` and `ease: [0.22, 1, 0.36, 1]`, and `tsc --noEmit` shows no new errors.
