"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Check, Send, Star, Trash2, X } from "lucide-react"
import { LoadingDot } from "@/components/ui/loading-dot"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export type ExistingReview = { id: string; rating: number; body: string | null } | null

type ReviewSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  profileId: string
  profileName: string
  existingReview: ExistingReview
  onSaved: () => void
}

const ratingLabels: Record<number, string> = {
  1: "Not great",
  2: "Below expectations",
  3: "Good",
  4: "Very good",
  5: "Excellent",
}

export function ReviewSheet({ open, onOpenChange, profileId, profileName, existingReview, onSaved }: ReviewSheetProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [hoverRating, setHoverRating] = useState(0)
  const [body, setBody] = useState(existingReview?.body || "")
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const [isClosing, setIsClosing] = useState(false)
  const isEditing = Boolean(existingReview)

  useEffect(() => {
    if (!open) return
    setRating(existingReview?.rating || 0)
    setBody(existingReview?.body || "")
    setError("")
    setSubmitting(false)
    setDeleting(false)
    setIsClosing(false)
  }, [open, existingReview])

  const requestClose = () => {
    if (isClosing) return
    setIsClosing(true)
    window.setTimeout(() => {
      setIsClosing(false)
      onOpenChange(false)
    }, 420)
  }

  const handleSubmit = async () => {
    if (!rating) {
      setError("Choose a star rating")
      return
    }
    setSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_id: profileId, rating, body }),
      })
      const result = await response.json()
      if (!response.ok) {
        setError(result.error || "Couldn't save your review")
        setSubmitting(false)
        return
      }
      onSaved()
      requestClose()
    } catch {
      setError("Couldn't save your review")
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!existingReview) return
    setDeleting(true)
    try {
      const response = await fetch(`/api/reviews/${existingReview.id}`, { method: "DELETE" })
      if (!response.ok) {
        setError("Couldn't remove your review")
        setDeleting(false)
        return
      }
      onSaved()
      requestClose()
    } catch {
      setError("Couldn't remove your review")
      setDeleting(false)
    }
  }

  const displayRating = hoverRating || rating

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          onOpenChange(true)
          return
        }
        requestClose()
      }}
    >
      <DialogContent
        unstyled
        showCloseButton={false}
        onPointerDownOutside={(event) => event.preventDefault()}
        onInteractOutside={(event) => event.preventDefault()}
        className={cn(
          "fixed inset-x-1.5 bottom-0 top-auto z-[180] flex max-h-[calc(100dvh-18px)] w-auto max-w-none translate-x-0 translate-y-0 flex-col overflow-hidden rounded-b-none rounded-t-[30px] border-x-0 border-b-0 border-t border-[#e5e9f2] bg-white p-0 text-[#0b0b0d] shadow-[0_-24px_70px_rgba(0,0,0,0.22)] transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom lg:inset-x-auto lg:bottom-auto lg:left-1/2 lg:top-1/2 lg:h-auto lg:max-h-[92dvh] lg:w-full lg:max-w-md lg:-translate-x-1/2 lg:-translate-y-1/2 lg:rounded-[28px] lg:border",
          isClosing && "translate-y-[112%] opacity-0 lg:translate-y-6",
        )}
      >
        <motion.div
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          className="flex min-h-0 flex-1 flex-col bg-white"
        >
          <div className="shrink-0 border-b border-[#e8edf5] bg-white">
            <div className="mx-auto mt-3 h-1.5 w-16 rounded-full bg-[#cfd5df] shadow-[0_1px_0_rgba(255,255,255,0.8)_inset]" />
            <DialogHeader className="px-5 pb-3 pt-3 text-left">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <DialogTitle className="truncate text-[clamp(19px,5.2vw,22px)] leading-tight">
                    {isEditing ? "Edit your review" : `Review ${profileName.split(" ")[0]}`}
                  </DialogTitle>
                  <DialogDescription className="mt-1 max-w-[32ch] text-[13px] leading-5 text-[#667085]">
                    Share how the shoot went - only visible to other visitors after you post it.
                  </DialogDescription>
                </div>
                <motion.button
                  type="button"
                  onClick={requestClose}
                  aria-label="Close review form"
                  whileTap={{ scale: 0.9, rotate: -8 }}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#e1e7f1] bg-white text-[#111318] shadow-sm transition-[transform,background-color] duration-200 hover:bg-[#f6f8fc] active:scale-[0.96]"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
            </DialogHeader>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white px-5 py-5">
            <div className="grid gap-2">
              <Label className="text-[14px] font-bold">Your rating</Label>
              <div className="flex items-center gap-2" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <motion.button
                    key={value}
                    type="button"
                    whileTap={{ scale: 0.85 }}
                    onMouseEnter={() => setHoverRating(value)}
                    onClick={() => {
                      setRating(value)
                      setError("")
                    }}
                    aria-label={`${value} star${value > 1 ? "s" : ""}`}
                    className="grid h-12 w-12 place-items-center rounded-2xl border border-[#e8edf5] bg-[#f8fafc] transition-colors"
                  >
                    <Star
                      className={cn(
                        "h-6 w-6 transition-colors",
                        value <= displayRating ? "fill-[#f20d14] text-[#f20d14]" : "fill-transparent text-[#c7cedb]",
                      )}
                    />
                  </motion.button>
                ))}
              </div>
              {displayRating > 0 && (
                <p className="text-[13px] font-medium text-[#667085]">{ratingLabels[displayRating]}</p>
              )}
            </div>

            <div className="mt-5 grid gap-2">
              <Label className="text-[14px] font-bold">Tell others about it (optional)</Label>
              <Textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="What was it like working together?"
                className="min-h-[118px] rounded-2xl border-[#e1e7f1] bg-white text-[14px]"
                maxLength={2000}
              />
            </div>

            {error && <p className="mt-3 text-[13px] font-medium text-[#d92d20]">{error}</p>}
          </div>

          <div className="shrink-0 border-t border-[#e8edf5] bg-white px-5 pb-[max(22px,calc(env(safe-area-inset-bottom)+14px))] pt-3 shadow-[0_-10px_26px_rgba(15,23,42,0.08)]">
            <div className="flex gap-2">
              {isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={submitting || deleting}
                  className="h-[52px] rounded-full border-[#f3d3d3] bg-white px-4 text-[#d92d20] hover:bg-[#fff5f5]"
                >
                  {deleting ? <LoadingDot size={9} /> : <Trash2 className="h-4.5 w-4.5" />}
                </Button>
              )}
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || deleting || !rating}
                className="h-[52px] flex-1 rounded-full bg-[#f20d14] text-[15px] font-semibold text-white hover:bg-[#d9070d]"
              >
                {submitting ? (
                  <>
                    <LoadingDot size={9} />
                    Saving
                  </>
                ) : (
                  <>
                    {isEditing ? <Check className="h-4.5 w-4.5" /> : <Send className="h-4.5 w-4.5" />}
                    {isEditing ? "Update review" : "Post review"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
