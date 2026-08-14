"use client"

import { useState, useEffect, useRef, type MouseEvent } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import {
  isProfileSavedLocally,
  removeProfileLocally,
  saveProfileLocally,
  type LocalSavedProfile,
} from "@/lib/saved-profiles-local"

interface SaveProfileButtonProps {
  profileId: string
  profileName: string
  profileRole?: string
  profileLocation?: string
  profileImage?: string
  profileHref?: string
  category?: LocalSavedProfile["category"]
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  showText?: boolean
}

export function SaveProfileButton({
  profileId,
  profileName,
  profileRole,
  profileLocation,
  profileImage,
  profileHref,
  category = "profile",
  variant = "ghost",
  size = "icon",
  className,
  showText = false,
}: SaveProfileButtonProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const initRef = useRef(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    const initAuth = async () => {
      setIsSaved(isProfileSavedLocally(profileId))
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        setUserId(session.user.id)
        checkIfSaved(session.user.id)
      }
    }
    initAuth()
  }, [profileId])

  const checkIfSaved = async (uid: string) => {
    try {
      const { data } = await supabase
        .from("user_favorites")
        .select("id")
        .eq("user_id", uid)
        .eq("favorited_user_id", profileId)
        .maybeSingle()

      setIsSaved(!!data)
    } catch (error) {
      setIsSaved(isProfileSavedLocally(profileId))
    }
  }

  const handleToggleSave = async (event?: MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault()
    event?.stopPropagation()

    try {
      setIsLoading(true)
      const nextSaved = !isSaved

      if (nextSaved) {
        saveProfileLocally({
          id: profileId,
          name: profileName,
          role: profileRole,
          location: profileLocation,
          imageUrl: profileImage,
          href: profileHref,
          category,
        })
      } else {
        removeProfileLocally(profileId)
      }

      setIsSaved(nextSaved)

      if (!userId) return

      if (!nextSaved) {
        const { error } = await supabase
          .from("user_favorites")
          .delete()
          .eq("user_id", userId)
          .eq("favorited_user_id", profileId)

        if (error) throw error
      } else {
        const { error } = await supabase.from("user_favorites").insert({
          user_id: userId,
          favorited_user_id: profileId,
        })

        if (error && error.code !== "23505") throw error
      }
    } catch (error) {
      setIsSaved(isProfileSavedLocally(profileId))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggleSave}
      disabled={isLoading}
      className={cn(
        "border border-[#e1e7f1] bg-white text-[#647084] shadow-sm transition-[transform,box-shadow,background-color,color] duration-200 ease-out hover:border-[#ffd0d2] hover:bg-[#fff4f4] hover:text-[#f20d14] hover:shadow-[0_10px_24px_rgba(242,13,20,0.12)] active:scale-95",
        size === "icon" ? "h-11 w-11 min-w-11 rounded-full p-0" : "rounded-full px-4",
        isSaved && "border-[#f20d14] bg-red-50 text-[#f20d14]",
        className,
      )}
      aria-label={isSaved ? `Remove ${profileName} from favorites` : `Save ${profileName} to favorites`}
    >
      <Heart className={`h-4 w-4 transition-[transform,opacity] duration-200 ${isSaved ? "fill-current scale-110" : ""}`} />
      {showText && <span className="ml-2">{isSaved ? "Saved" : "Save"}</span>}
    </Button>
  )
}
