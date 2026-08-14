"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Newspaper } from "lucide-react"
import { motion } from "framer-motion"
import { mockCommunityPosts } from "@/lib/community-data"

type CommunityNavLinkProps = {
  iconOnly?: boolean
  className?: string
  onClick?: () => void
}

const newestPublishedAt = Math.max(...mockCommunityPosts.map((post) => new Date(post.published_at).getTime()))

export function CommunityNavLink({ iconOnly = false, className = "", onClick }: CommunityNavLinkProps) {
  const [hasNewPosts, setHasNewPosts] = useState(false)

  useEffect(() => {
    const lastVisited = Number(window.localStorage.getItem("community_last_visited") || 0)
    setHasNewPosts(newestPublishedAt > lastVisited)
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
