"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Newspaper } from "lucide-react"
import { motion } from "framer-motion"
import { createBrowserClient } from "@/lib/supabase/client"

type CommunityNavLinkProps = {
  iconOnly?: boolean
  className?: string
  onClick?: () => void
}

export function CommunityNavLink({ iconOnly = false, className = "", onClick }: CommunityNavLinkProps) {
  const [hasNewPosts, setHasNewPosts] = useState(false)

  useEffect(() => {
    const lastVisited = Number(window.localStorage.getItem("community_last_visited") || 0)

    async function checkForNewPosts() {
      const supabase = createBrowserClient()
      const { data } = await supabase
        .from("articles")
        .select("created_at")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      const newestPublishedAt = data?.created_at ? new Date(data.created_at).getTime() : 0
      setHasNewPosts(newestPublishedAt > lastVisited)
    }

    checkForNewPosts()
  }, [])

  return (
    <motion.div whileTap={{ scale: 0.96 }}>
      <Link
        href="/community"
        onClick={onClick}
        aria-label="Community"
        className={`relative inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-3 text-sm font-medium transition-colors hover:bg-accent ${className}`}
      >
        <Newspaper className="h-4 w-4" />
        {!iconOnly && <span>Community</span>}
        {hasNewPosts && (
          <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-background" />
        )}
      </Link>
    </motion.div>
  )
}
