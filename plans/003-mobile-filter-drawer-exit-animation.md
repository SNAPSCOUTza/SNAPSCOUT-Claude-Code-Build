# 003 — Give the mobile filter drawer a real exit animation

- **Status**: TODO
- **Commit**: 6684113
- **Severity**: MEDIUM
- **Category**: Interruptibility
- **Estimated scope**: 2 files (duplicated block), 1 edit each

## Problem

`app/studios-stores/page.tsx` and `app/studios/page.tsx` each have an identical mobile filter drawer. It has a proper spring entrance (`initial={{ y: 40 }}` → `animate={{ y: 0 }}`), but the block is **not wrapped in `AnimatePresence`**, so when `mobileFiltersOpen` flips to `false`, React unmounts the whole subtree immediately — the drawer slides in smoothly but disappears with a hard cut. The `exit` prop on the backdrop (`exit={{ opacity: 0 }}`, currently present) is inert without `AnimatePresence`; the inner panel doesn't even have an `exit` prop yet.

Current code, `app/studios-stores/page.tsx:250-312`:

```tsx
          {mobileFiltersOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="fixed inset-0 z-50 bg-black/35"
            >
              <motion.div
                initial={{ y: 40, opacity: 0.9 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 28 }}
                className="absolute bottom-0 left-0 right-0 rounded-t-[28px] border-t border-[#e8dfd3] bg-white p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-[16px] font-semibold">Filters</p>
                  <motion.button
                    type="button"
                    onClick={() => setMobileFiltersOpen(false)}
                    className="grid h-9 w-9 place-items-center rounded-full border border-[#e7e0d6] bg-white"
                    aria-label="Close filters"
                    whileTap={{ scale: 0.9, rotate: -8 }}
                  >
                    <X className="h-4.5 w-4.5" />
                  </motion.button>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-[#f20d14]">Type</p>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-full border-[#e7e0d6] bg-white">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="studio">Studios</SelectItem>
                        <SelectItem value="store">Equipment Stores</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <!-- location Select block, unchanged -->
                  </div>
                  <Button className="w-full bg-[#f20d14] text-white hover:bg-[#d80a10]" onClick={() => setMobileFiltersOpen(false)}>
                    Apply
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
```

(`app/studios/page.tsx:336-398` is the byte-for-byte same block, with `typeFilter`/`setTypeFilter`/`locationFilter`/`setLocationFilter`/`provinces.map(...)` in place of `selectedType`/`setSelectedType`/the hardcoded city list — the wrapper motion props are identical.)

## Target

Wrap `{mobileFiltersOpen && (...)}` in `<AnimatePresence>`, add a matching `key` to the backdrop so `AnimatePresence` can track it, and add the missing `exit` prop to the inner panel so it retreats the way it arrived.

```tsx
          <AnimatePresence>
            {mobileFiltersOpen && (
              <motion.div
                key="mobile-filters-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="fixed inset-0 z-50 bg-black/35"
              >
                <motion.div
                  initial={{ y: 40, opacity: 0.9 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 40, opacity: 0.9 }}
                  transition={{ type: "spring", stiffness: 280, damping: 28 }}
                  className="absolute bottom-0 left-0 right-0 rounded-t-[28px] border-t border-[#e8dfd3] bg-white p-5"
                >
                  <!-- everything inside stays exactly as-is -->
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
```

## Repo conventions to follow

- `AnimatePresence` is already used correctly for an equivalent sheet-style overlay elsewhere in this app — see `components/layout/header.tsx:268-284` (mobile nav drawer: backdrop + sliding panel, both with matching `initial`/`animate`/`exit`, both inside `<AnimatePresence>`). Match that structure, not a new one.
- Do not change the existing entrance values (`type: "spring", stiffness: 280, damping: 28`, backdrop `duration: 0.18, ease: "easeOut"`) — the entrance already feels right; this plan only fixes the missing exit.
- Reusing the entrance values for `exit` (`y: 40, opacity: 0.9` on the panel, `opacity: 0` on the backdrop, both already present as `initial`) is deliberate: an exit that mirrors the entrance is the "symmetric paths" rule from the audit — don't invent a different exit motion.

## Steps

1. In `app/studios-stores/page.tsx`, add `AnimatePresence` to the existing framer-motion import at line 13 (currently `import { motion } from "framer-motion"` — change to `import { AnimatePresence, motion } from "framer-motion"`).
2. Wrap the block at `app/studios-stores/page.tsx:250` (`{mobileFiltersOpen && (`) through `:312` (the matching `)}`) in `<AnimatePresence>` / `</AnimatePresence>`, per the Target above.
3. Add `key="mobile-filters-backdrop"` to the backdrop `motion.div` (the one with `className="fixed inset-0 z-50 bg-black/35"`).
4. Add `exit={{ y: 40, opacity: 0.9 }}` to the inner panel `motion.div` (the one with `className="absolute bottom-0 left-0 right-0 rounded-t-[28px] ..."`), matching its existing `initial` value exactly.
5. Do not touch anything inside the panel (the Type select, Location select, Apply button) — only the two wrapper tags and the new `AnimatePresence` boundary.
6. Repeat steps 1–5 identically in `app/studios/page.tsx`: import at line 13 (confirm the exact line number before editing — it may have shifted independently of `studios-stores/page.tsx`), block at `:336-398`, same `key` and `exit` values.

## Boundaries

- Do NOT touch `MobileShell`, `MotionRevealGroup`, or anything else in either file outside the `mobileFiltersOpen` block.
- Do NOT change the spring config or backdrop duration — only add the missing `exit` prop and the `AnimatePresence` wrapper.
- Do NOT consolidate the two files into a shared component — that's a larger refactor outside this plan's scope, even though the block is duplicated.
- If the block's line numbers or props don't match what's quoted in Problem above in either file (drift since commit `6684113`), STOP and report instead of improvising.

## Verification

- **Mechanical**: `npx tsc --noEmit -p tsconfig.json` — should not introduce any new errors in either file.
- **Feel check**, on both `/studios-stores` and `/studios` at a mobile viewport width (<768px so the mobile shell renders):
  - Open the filter sheet (whatever control sets `mobileFiltersOpen(true)`) and confirm the existing spring-in behavior is unchanged.
  - Close it (tap the X, tap Apply, or tap the backdrop) and confirm the sheet now slides back down (`y: 40`) and fades while the backdrop fades out — it must not disappear instantly.
  - In DevTools Animations panel, set playback to 10% on close and confirm the panel's exit path visually mirrors its entrance (same distance, opposite direction) rather than a straight opacity cut.
  - Toggle `prefers-reduced-motion` (Rendering panel) and confirm the sheet still opens/closes (state still toggles, content still reachable) — Framer Motion's default reduced-motion behavior disables the transform but this repo has no custom override to check here, so just confirm nothing gets stuck.
- **Done when**: closing the filter sheet on both `/studios-stores` and `/studios` visibly animates out instead of cutting, and `tsc --noEmit` shows no new errors.
