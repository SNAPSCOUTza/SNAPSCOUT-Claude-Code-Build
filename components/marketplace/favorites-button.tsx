"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

interface FavoritesButtonProps {
  freelancerId: string
  category?: string
  size?: "sm" | "default" | "lg"
  variant?: "default" | "outline" | "ghost"
  showText?: boolean
}

export function FavoritesButton({
  freelancerId,
  category,
  size = "default",
  variant = "ghost",
  showText = false,
}: FavoritesButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // Check if freelancer is already favorited
  const checkFavoriteStatus = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) return

      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("client_id", user.id)
        .eq("freelancer_id", freelancerId)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error checking favorite status:", error)
        return
      }

      setIsFavorited(!!data)
    } catch (error) {
      console.error("Error:", error)
    }
  }

  // Toggle favorite status
  const toggleFavorite = async () => {
    setLoading(true)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        toast.error("You must be logged in to save favorites")
        return
      }

      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("client_id", user.id)
          .eq("freelancer_id", freelancerId)

        if (error) {
          console.error("Error removing favorite:", error)
          toast.error("Failed to remove from favorites")
          return
        }

        setIsFavorited(false)
        toast.success("Removed from favorites")
      } else {
        // Add to favorites
        const { error } = await supabase.from("favorites").insert({
          client_id: user.id,
          freelancer_id: freelancerId,
          category: category || null,
        })

        if (error) {
          console.error("Error adding favorite:", error)
          toast.error("Failed to add to favorites")
          return
        }

        setIsFavorited(true)
        toast.success("Added to favorites")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkFavoriteStatus()
  }, [freelancerId])

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleFavorite}
      disabled={loading}
      className={`flex items-center gap-2 ${
        isFavorited ? "text-red-600 hover:text-red-700" : "text-gray-600 hover:text-red-600"
      }`}
    >
      <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
      {showText && (isFavorited ? "Saved" : "Save")}
    </Button>
  )
}

