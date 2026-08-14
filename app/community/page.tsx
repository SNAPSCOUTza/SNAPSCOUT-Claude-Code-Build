"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, Bookmark, CalendarDays, Heart, Home, Lock, MapPin, ShieldCheck, Sparkles, Star, Users, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { createBrowserClient } from "@/lib/supabase/client"
import { MotionRevealGroup, MotionRevealItem, MotionRevealSolo, revealItem } from "@/components/ui/motion-reveal"
import { StickyScrollCard } from "@/components/ui/sticky-scroll-card"
import {
  communityCategories,
  communityGuidelines,
  communitySuccessStories,
  mockCommunityPosts,
  regionalGroups,
  type CommunityPost,
  upcomingCommunityEvents,
} from "@/lib/community-data"

function isNewPost(post: CommunityPost) {
  return Date.now() - new Date(post.published_at).getTime() < 48 * 60 * 60 * 1000
}

export default function CommunityPage() {
  const { profile } = useAuth()
  const [posts, setPosts] = useState<CommunityPost[]>(mockCommunityPosts)
  const [category, setCategory] = useState<(typeof communityCategories)[number]>("All")
  const [expandedPreviewId, setExpandedPreviewId] = useState<string | null>(null)
  const [openPost, setOpenPost] = useState<CommunityPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookmarked, setBookmarked] = useState<string[]>([])

  const isSubscriber = profile?.subscription_status === "active"

  useEffect(() => {
    window.localStorage.setItem("community_last_visited", String(Date.now()))

    async function loadPosts() {
      try {
        const supabase = createBrowserClient()
        const { data, error } = await supabase
          .from("community_posts")
          .select("id, slug, title, headline, body, category, cover_image_url, published_at, access_level, status")
          .eq("status", "published")
          .order("published_at", { ascending: false })

        if (error) throw error
        if (data?.length) setPosts(data as CommunityPost[])
      } catch {
        setPosts(mockCommunityPosts)
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [])

  const filteredPosts = useMemo(() => {
    if (category === "All") return posts
    return posts.filter((post) => post.category === category)
  }, [category, posts])

  const handleOpenPost = (post: CommunityPost) => {
    const locked = post.access_level === "subscribers" && !isSubscriber
    if (locked) {
      setExpandedPreviewId((current) => (current === post.id ? null : post.id))
      return
    }
    setOpenPost(post)
  }

  return (
    <main className="min-h-screen bg-white text-[#0b0b0d]">
      <section className="px-4 pb-10 pt-8 md:px-8 md:pt-14">
        <div className="mx-auto max-w-7xl">
          <MotionRevealSolo className="mb-4 flex items-center justify-between gap-2">
            <Button asChild variant="outline" className="h-11 rounded-full px-4">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Return Home
              </Link>
            </Button>
            <Button asChild className="h-11 rounded-full px-4 md:hidden">
              <Link href="/">
                <Home className="h-4 w-4" />
                Home
              </Link>
            </Button>
          </MotionRevealSolo>

          <MotionRevealGroup className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/10 text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Community
              </Badge>
              <h1 className="text-[32px] font-bold leading-none md:text-5xl">SnapScout Community</h1>
              <p className="mt-3 max-w-2xl text-[14px] text-muted-foreground md:text-base">
                News, resources, and spotlights for SA creatives.
              </p>
            </div>
            {!isSubscriber && (
              <Button asChild className="h-[52px] rounded-full px-6">
                <Link href="/subscribe">Subscribe to read</Link>
              </Button>
            )}
          </MotionRevealGroup>

          <MotionRevealGroup className="mt-6 flex gap-2 overflow-x-auto pb-2">
            {communityCategories.map((item) => (
              <motion.button
                key={item}
                type="button"
                variants={revealItem}
                whileTap={{ scale: 0.96 }}
                onClick={() => setCategory(item)}
                className={`min-h-11 whitespace-nowrap rounded-full border px-4 text-[14px] font-medium transition-colors ${
                  category === item
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {item}
              </motion.button>
            ))}
          </MotionRevealGroup>

          {loading ? (
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="aspect-[3/4] rounded-2xl" />
              ))}
            </div>
          ) : (
            <MotionRevealGroup className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              {filteredPosts.map((post) => {
                const locked = post.access_level === "subscribers" && !isSubscriber
                const expanded = expandedPreviewId === post.id

                return (
                  <motion.article key={post.id} layout variants={revealItem}>
                    <Card className="overflow-hidden rounded-2xl border-border bg-card">
                      <button type="button" onClick={() => handleOpenPost(post)} className="block w-full text-left">
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <Image src={post.cover_image_url || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
                          {locked && (
                            <div className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-background/85 text-foreground backdrop-blur">
                              <Lock className="h-4 w-4" />
                            </div>
                          )}
                          {isNewPost(post) && (
                            <span className="absolute left-3 top-3 inline-flex min-h-8 animate-pulse items-center rounded-full bg-primary px-3 text-[12px] font-semibold text-primary-foreground shadow-lg">
                              New
                            </span>
                          )}
                          <Badge className="absolute bottom-3 left-3 rounded-full">{post.category}</Badge>
                        </div>
                        <CardContent className="grid gap-2 p-4">
                          <p className="font-mono text-[12px] text-muted-foreground">
                            {new Date(post.published_at).toLocaleDateString("en-ZA", { day: "2-digit", month: "short" })}
                          </p>
                          <h2 className="line-clamp-2 text-[16px] font-bold leading-tight md:text-[24px]">{post.title}</h2>
                          <p className="line-clamp-3 text-[14px] text-muted-foreground">{post.headline}</p>
                        </CardContent>
                      </button>

                      <AnimatePresence>
                        {expanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t"
                          >
                            <div className="grid gap-3 p-4">
                              <div className="relative overflow-hidden rounded-2xl bg-muted p-4">
                                <p className="blur-[3px] text-[14px] leading-6 text-muted-foreground">{post.body}</p>
                                <div className="absolute inset-0 grid place-items-center bg-background/35">
                                  <Button asChild className="h-[52px] rounded-full px-6">
                                    <Link href="/subscribe">Subscribe to read</Link>
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
                  </motion.article>
                )
              })}
            </MotionRevealGroup>
          )}

          <section className="mt-14">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-[28px] font-black leading-tight md:text-4xl">Connect with South Africa's Creative Community</h2>
              <p className="mt-3 text-[15px] leading-7 text-[#556170] md:text-lg">
                Join photographers, videographers, and film professionals building careers together. Share experiences,
                learn from each other, and grow your network.
              </p>
            </div>

            <h3 className="mt-12 text-center text-[24px] font-black md:text-3xl">Success Stories</h3>
            <MotionRevealGroup className="mt-6 grid gap-4 md:grid-cols-3">
              {communitySuccessStories.map((story, index) => (
                <StickyScrollCard key={story.name} top="112px" delay={0.08 + index * 0.06}>
                  <motion.article
                    variants={revealItem}
                    whileTap={{ scale: 0.98 }}
                    className="rounded-[20px] border border-[#e1e8f0] bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="grid h-14 w-14 place-items-center rounded-full bg-[#ffe4e4] text-[#f20d14]">
                          <Users className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="text-[18px] font-bold">{story.name}</h4>
                          <p className="text-[14px] text-[#667085]">{story.role}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 flex items-center justify-between text-[14px] text-[#667085]">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {story.location}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#111318]">
                        <Star className="h-4 w-4 fill-[#f2a900] text-[#f2a900]" />
                        {story.rating}
                      </span>
                    </div>
                    <p className="mt-5 text-[14px] leading-6 text-[#4d5663]">"{story.quote}"</p>
                    <div className="mt-5 flex items-center justify-between text-[13px]">
                      <span className="font-semibold text-[#111318]">{story.projects}</span>
                      <span className="inline-flex items-center gap-1 text-[#667085]">
                        <Heart className="h-4 w-4 text-[#f20d14]" />
                        Verified
                      </span>
                    </div>
                  </motion.article>
                </StickyScrollCard>
              ))}
            </MotionRevealGroup>
          </section>

          <section className="mt-14 rounded-[22px] border border-[#e1e8f0] bg-[#f8fbff] p-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)] md:p-8">
            <div className="text-center">
              <h3 className="text-[24px] font-black md:text-3xl">Regional Groups</h3>
              <p className="mt-2 text-[14px] text-[#667085]">Connect with creatives in your province</p>
            </div>
            <MotionRevealGroup className="mt-6 grid gap-3 md:grid-cols-3">
              {regionalGroups.map((group) => (
                <MotionRevealItem key={group.province} className="rounded-2xl bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-[#111318]">{group.province}</h4>
                      <p className="mt-2 text-[14px] text-[#667085]">{group.city}</p>
                    </div>
                    <span className="rounded-full border border-[#dbe3ee] bg-white px-3 py-1 text-[12px] text-[#4d5663]">
                      {group.members}
                    </span>
                  </div>
                </MotionRevealItem>
              ))}
            </MotionRevealGroup>
          </section>

          <section className="mt-14">
            <h3 className="text-center text-[24px] font-black md:text-3xl">Upcoming Events</h3>
            <MotionRevealGroup className="mt-6 grid gap-4 md:grid-cols-3">
              {upcomingCommunityEvents.map((event) => (
                <motion.article
                  key={event.title}
                  variants={revealItem}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-[20px] border border-[#e1e8f0] bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
                >
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-[#e8f0ff] text-[#3366ff]">
                      <CalendarDays className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-[18px] font-bold leading-tight">{event.title}</h4>
                      <p className="mt-1 text-[14px] text-[#667085]">{event.date}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between text-[13px] text-[#4d5663]">
                    <span>{event.type}</span>
                    <span>{event.attending}</span>
                  </div>
                  <p className="mt-6 flex items-center gap-2 text-[14px] text-[#667085]">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </p>
                  <Button variant="outline" className="mt-5 h-11 w-full rounded-lg border-[#dbe3ee] bg-white">
                    Register Interest
                  </Button>
                </motion.article>
              ))}
            </MotionRevealGroup>
          </section>

          <section className="mt-14 rounded-[22px] border border-[#e1e8f0] bg-[#f8fbff] p-6 shadow-[0_16px_36px_rgba(15,23,42,0.06)] md:p-8">
            <h3 className="text-center text-[24px] font-black md:text-3xl">Community Guidelines</h3>
            <MotionRevealGroup className="mt-7 grid gap-6 md:grid-cols-4">
              {communityGuidelines.map((item) => (
                <MotionRevealItem key={item.title} className="text-center">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[#ffe4e4] text-[#f20d14]">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h4 className="mt-4 font-bold text-[#111318]">{item.title}</h4>
                  <p className="mt-2 text-[14px] leading-6 text-[#667085]">{item.body}</p>
                </MotionRevealItem>
              ))}
            </MotionRevealGroup>
          </section>
        </div>
      </section>

      <Dialog open={!!openPost} onOpenChange={(open) => !open && setOpenPost(null)}>
        <DialogContent className="bottom-0 left-auto right-0 top-0 h-full max-h-none max-w-xl translate-x-0 translate-y-0 overflow-y-auto rounded-none border-y-0 border-r-0 p-0 sm:max-w-xl">
          {openPost && (
            <>
              <div className="relative aspect-[4/3]">
                <Image src={openPost.cover_image_url || "/placeholder.svg"} alt={openPost.title} fill className="object-cover" />
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setOpenPost(null)}
                  className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-background/90 backdrop-blur"
                  aria-label="Close post"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>
              <DialogHeader className="p-5 text-left">
                <Badge className="mb-2 w-fit rounded-full">{openPost.category}</Badge>
                <DialogTitle className="text-[24px] font-bold leading-tight">{openPost.title}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 px-5 pb-8">
                <p className="text-[14px] text-muted-foreground">{openPost.headline}</p>
                <p className="text-[14px] leading-7">{openPost.body}</p>
                {isSubscriber && (
                  <Button
                    variant="outline"
                    className="h-[52px] rounded-full"
                    onClick={() =>
                      setBookmarked((current) =>
                        current.includes(openPost.id) ? current.filter((id) => id !== openPost.id) : [...current, openPost.id],
                      )
                    }
                  >
                    <Bookmark className={bookmarked.includes(openPost.id) ? "fill-current" : ""} />
                    {bookmarked.includes(openPost.id) ? "Bookmarked" : "Bookmark"}
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
