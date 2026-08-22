"use client"

import { useCallback, useEffect, useState } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { ReviewSheet, type ExistingReview } from "@/components/reviews/review-sheet"

type LeaveReviewButtonProps = {
  profileId: string
  profileName: string
  onReviewChange?: () => void
  className?: string
}

// Only ever renders when the visitor is signed in, isn't viewing their own
// profile, and has a confirmed booking with this person - the real gate is
// the "confirmed bookings can leave a review" RLS policy on profile_reviews;
// this is purely so the button doesn't show up for people who'd just get a
// 403 from the API.
export function LeaveReviewButton({ profileId, profileName, onReviewChange, className }: LeaveReviewButtonProps) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [checking, setChecking] = useState(true)
  const [eligible, setEligible] = useState(false)
  const [existingReview, setExistingReview] = useState<ExistingReview>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const loadEligibility = useCallback(async () => {
    if (!isAuthenticated || !user || user.id === profileId) {
      setEligible(false)
      setChecking(false)
      return
    }
    setChecking(true)
    try {
      const response = await fetch(`/api/reviews/eligibility?profile_id=${encodeURIComponent(profileId)}`)
      if (!response.ok) {
        setEligible(false)
        return
      }
      const result = await response.json()
      setEligible(Boolean(result.eligible))
      setExistingReview(result.existingReview || null)
    } catch {
      setEligible(false)
    } finally {
      setChecking(false)
    }
  }, [isAuthenticated, user, profileId])

  useEffect(() => {
    if (isLoading) return
    loadEligibility()
  }, [isLoading, loadEligibility])

  if (isLoading || checking || !eligible) return null

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setSheetOpen(true)}
        className={
          className || "h-12 rounded-full border-[#e6ebf3] bg-white text-[#111318] hover:bg-[#fff7f7] hover:text-[#f20d14]"
        }
      >
        <Star className="mr-2 h-4 w-4" />
        {existingReview ? "Edit your review" : "Leave a review"}
      </Button>
      <ReviewSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        profileId={profileId}
        profileName={profileName}
        existingReview={existingReview}
        onSaved={() => {
          loadEligibility()
          onReviewChange?.()
        }}
      />
    </>
  )
}
