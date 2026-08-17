"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Clock, DollarSign, Users, ArrowLeft, CheckCircle, AlertCircle, Briefcase, Home, Send, Crown, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import MobileShell from "@/components/mobile/mobile-shell"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { sanitizeSingleLineInput, sanitizeTextInput } from "@/lib/utils/sanitize"

type ApplyBlockReason = "signed_out" | "no_subscription" | "scout"

// Mock gig for fallback
const mockGig = {
  id: "mock-1",
  title: "Corporate Video Production",
  location: "Cape Town, Western Cape",
  category: "Commercial",
  gig_type: "contract",
  salary_min: 15000,
  salary_max: 25000,
  salary_currency: "ZAR",
  experience_level: "mid", // Changed from "Mid-level" to "mid"
  description:
    "Looking for a complete video production team for corporate training videos. Need director, cinematographer, and editor.",
  required_skills: ["Cinematography", "Video Editing", "Directing"],
  responsibilities:
    "Lead video production from concept to completion. Manage crew and equipment. Deliver high-quality corporate training content.",
  qualifications:
    "Minimum 3 years experience in corporate video production. Professional equipment required. Portfolio showcasing similar work.",
  remote_option: false,
  positions_available: 3,
  status: "active",
  created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  application_deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  client: {
    id: "client-1",
    full_name: "Sarah Johnson",
    profile_image_url:
      "https://images.pexels.com/photos/2327360/pexels-photo-2327360.jpeg?auto=compress&cs=tinysrgb&w=150",
  },
}

const confirmationImage = "/images/gig-application-starting-conversation.png"
const duplicateApplicationMessage = "You've already applied for this gig."

function isDuplicateGigApplicationError(error: unknown) {
  if (!error || typeof error !== "object") return false

  const maybeError = error as {
    code?: string
    message?: string
    details?: string
  }
  const haystack = `${maybeError.message || ""} ${maybeError.details || ""}`.toLowerCase()

  return (
    maybeError.code === "23505" ||
    haystack.includes("gig_applications_gig_id_freelancer_id_key") ||
    haystack.includes("duplicate key value")
  )
}

export default function GigApplicationPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [gig, setGig] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [confirmationConfirmed, setConfirmationConfirmed] = useState(false)
  const [confirmationClosing, setConfirmationClosing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [blockReason, setBlockReason] = useState<ApplyBlockReason | null>(null)
  const [checkingEligibility, setCheckingEligibility] = useState(true)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)

  // Prevent duplicate submissions
  const submitAttemptedRef = useRef(false)
  const dataFetchedRef = useRef(false)

  const [applicationData, setApplicationData] = useState({
    cover_message: "",
    proposed_rate: "",
    proposed_timeline: "",
    portfolio_samples: "",
  })

  useEffect(() => {
    if (dataFetchedRef.current) return

    const fetchGigAndCheckApplication = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )

        // Get session once
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session?.user) {
          setCurrentUserId(session.user.id)

          const [{ data: profileRow }, { data: subscriptionRow }] = await Promise.all([
            supabase.from("user_profiles").select("account_type, user_type").eq("user_id", session.user.id).maybeSingle(),
            supabase
              .from("user_subscriptions")
              .select("id")
              .eq("user_id", session.user.id)
              .eq("status", "active")
              .limit(1)
              .maybeSingle(),
          ])

          const accountType = (profileRow?.account_type || profileRow?.user_type || "").toLowerCase()
          if (accountType === "scout") {
            setBlockReason("scout")
          } else if (!subscriptionRow) {
            setBlockReason("no_subscription")
          } else {
            setBlockReason(null)
          }
        } else {
          setBlockReason("signed_out")
        }
        setCheckingEligibility(false)

        // Check if using mock ID
        if (params.id.startsWith("mock-")) {
          setGig(mockGig)
          setLoading(false)
          dataFetchedRef.current = true
          return
        }

        // Single query to fetch gig with client info
        const { data: gigData, error: gigError } = await supabase
          .from("gigs")
          .select(`
            *,
            client:client_id (
              id,
              full_name,
              profile_image_url
            )
          `)
          .eq("id", params.id)
          .single()

        if (gigError || !gigData) {
          setGig(mockGig)
        } else {
          setGig(gigData)

          if (session?.user) {
            const { data: existingApp } = await supabase
              .from("gig_applications")
              .select("id")
              .eq("gig_id", params.id)
              .eq("freelancer_id", session.user.id)
              .maybeSingle()

            if (existingApp) {
              setAlreadyApplied(true)
            }
          }
        }

        dataFetchedRef.current = true
      } catch (err) {
        console.error("Error:", err)
        setGig(mockGig)
      } finally {
        setLoading(false)
      }
    }

    fetchGigAndCheckApplication()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Prevent duplicate submissions, and re-check eligibility server-side isn't
    // available here, so this client-side guard mirrors the UI gating above.
    if (submitting || submitAttemptedRef.current || alreadyApplied || blockReason) return
    submitAttemptedRef.current = true
    setSubmitting(true)
    setError(null)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        setError("Please sign in to apply")
        setSubmitting(false)
        submitAttemptedRef.current = false
        return
      }

      if (params.id.startsWith("mock-")) {
        setConfirmationConfirmed(false)
        setConfirmationClosing(false)
        setSubmitSuccess(true)
        setAlreadyApplied(true)

        setTimeout(() => {
          setConfirmationConfirmed(true)
        }, 3500)

        setTimeout(() => {
          setConfirmationClosing(true)
        }, 4300)

        setTimeout(() => {
          router.push("/marketplace/available-gigs?applied=true")
        }, 4750)
        return
      }

      const sanitizedCoverMessage = sanitizeTextInput(applicationData.cover_message, 3000)
      const sanitizedTimeline = sanitizeSingleLineInput(applicationData.proposed_timeline, 80)
      const portfolioSamples = applicationData.portfolio_samples
        .split(",")
        .map((s) => sanitizeSingleLineInput(s, 500))
        .filter((s) => s.length > 0)
        .slice(0, 12)

      if (!sanitizedCoverMessage) {
        setError("Please add a cover message before submitting.")
        setSubmitting(false)
        submitAttemptedRef.current = false
        return
      }

      const { error: insertError } = await supabase.from("gig_applications").insert({
        gig_id: params.id,
        freelancer_id: session.user.id,
        cover_message: sanitizedCoverMessage,
        proposed_rate: applicationData.proposed_rate ? Number.parseFloat(applicationData.proposed_rate) : null,
        proposed_timeline: sanitizedTimeline,
        portfolio_samples: portfolioSamples,
        status: "pending",
      })

      if (insertError) {
        console.error("Error submitting application:", insertError)
        if (isDuplicateGigApplicationError(insertError)) {
          setAlreadyApplied(true)
          setError(duplicateApplicationMessage)
        } else {
          setError(insertError.message || "We could not submit your application. Please try again.")
        }
        setSubmitting(false)
        submitAttemptedRef.current = false
        return
      }

      setSubmitSuccess(true)
      setAlreadyApplied(true)
      setConfirmationConfirmed(false)
      setConfirmationClosing(false)

      setTimeout(() => {
        setConfirmationConfirmed(true)
      }, 3500)

      setTimeout(() => {
        setConfirmationClosing(true)
      }, 4300)

      setTimeout(() => {
        router.push("/marketplace/available-gigs?applied=true")
      }, 4750)
    } catch (err) {
      console.error("Error:", err)
      setError("An unexpected error occurred")
      setSubmitting(false)
      submitAttemptedRef.current = false
    }
  }

  if (loading) {
    return (
      <MobileShell title="Apply">
        <div className="flex min-h-[65vh] items-center justify-center px-5">
          <div className="w-full max-w-sm rounded-[32px] bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-black/10 border-b-[#f20d14]" />
            <p className="text-[15px] font-semibold text-black">Loading gig details...</p>
            <p className="mt-1 text-sm text-neutral-500">Preparing the application brief.</p>
          </div>
        </div>
      </MobileShell>
    )
  }

  if (!gig) {
    return (
      <MobileShell title="Apply">
        <div className="flex min-h-[65vh] items-center justify-center px-5">
          <div className="w-full max-w-sm rounded-[32px] bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-[#f20d14]">
              <AlertCircle className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-black tracking-[-0.03em] text-black">Gig not found</h1>
            <p className="mt-2 text-sm text-neutral-500">The gig you're looking for doesn't exist or has been removed.</p>
            <Link href="/marketplace/available-gigs">
              <Button className="mt-5 h-[52px] rounded-full bg-[#f20d14] px-6 text-white hover:bg-[#d9070d]">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Gigs
              </Button>
            </Link>
          </div>
        </div>
      </MobileShell>
    )
  }

  if (submitSuccess) {
    return (
      <div className="fixed inset-0 z-[90] overflow-hidden bg-white">
        <motion.div
          className="relative flex min-h-[100dvh] flex-col items-center justify-center px-7 text-center"
          initial={{ clipPath: "circle(0% at 50% 52%)", opacity: 0.6 }}
          animate={{
            clipPath: "circle(145% at 50% 52%)",
            opacity: confirmationClosing ? 0 : 1,
          }}
          transition={{
            clipPath: { duration: 0.95, ease: [0.19, 1, 0.22, 1] },
            opacity: { duration: confirmationClosing ? 0.45 : 0.25, ease: "easeOut" },
          }}
        >
          <motion.img
            src={confirmationImage}
            alt=""
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
            className="mb-3 w-full max-w-[360px] object-contain"
          />
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.48, ease: "easeOut" }}
          >
            <h2 className="text-[28px] font-black leading-tight tracking-[-0.03em] text-black">Starting conversation</h2>
            <p className="mt-2 text-[15px] leading-6 text-neutral-500">Will notify you as soon as they respond</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.68, duration: 0.35 }}
            className="mt-7 flex h-12 items-center justify-center gap-2"
          >
            {confirmationConfirmed ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#35a936] text-white">
                <CheckCircle className="h-7 w-7" />
              </div>
            ) : (
              [0, 1, 2].map((dot) => (
                <motion.span
                  key={dot}
                  className="h-2.5 w-2.5 rounded-full bg-[#f20d14]"
                  animate={{ y: [0, -7, 0], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.72, repeat: Infinity, delay: dot * 0.12, ease: "easeInOut" }}
                />
              ))
            )}
          </motion.div>
        </motion.div>
      </div>
    )
  }

  const formatBudget = () => {
    if (gig.salary_min && gig.salary_max) {
      return `R${gig.salary_min.toLocaleString()} - R${gig.salary_max.toLocaleString()}`
    }
    if (gig.salary_max) return `Up to R${gig.salary_max.toLocaleString()}`
    if (gig.salary_min) return `From R${gig.salary_min.toLocaleString()}`
    return "Negotiable"
  }

  const formatGigType = (value: string | null | undefined) => {
    const labelMap: Record<string, string> = {
      "full-time": "Full-time",
      "part-time": "Part-time",
      contract: "Contract",
      freelance: "Freelance",
      internship: "Internship",
    }
    const normalized = (value || "").trim().toLowerCase()
    return labelMap[normalized] || value || "Project"
  }

  return (
    <MobileShell title="Apply">
      <div className="space-y-5 px-4 pb-28 pt-3 sm:px-6">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, ease: "easeOut" }}
          className="overflow-hidden rounded-[32px] bg-[#111] p-5 text-white shadow-sm"
        >
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/marketplace/available-gigs"
              className="inline-flex h-11 items-center rounded-full border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Gigs
            </Link>
            <Link
              href="/explore"
              className="inline-flex h-11 items-center rounded-full border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white"
            >
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </div>

          <div className="mt-6 flex items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/45">SnapScout Gigs</p>
              <h1 className="mt-2 max-w-[330px] text-[34px] font-black leading-[0.95] tracking-[-0.04em]">
                Apply for this production.
              </h1>
            </div>
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#f20d14]">
              <Briefcase className="h-6 w-6" />
            </div>
          </div>
          <p className="mt-4 max-w-[360px] text-[15px] leading-6 text-white/70">
            Send your rate, timeline, portfolio, and cover note. We will open the conversation after you submit.
          </p>
        </motion.section>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="lg:col-span-1"
          >
            <Card className="overflow-hidden rounded-[30px] border-0 bg-white shadow-sm ring-1 ring-black/5 lg:sticky lg:top-8">
              <CardHeader className="space-y-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-[24px] font-black leading-tight tracking-[-0.03em] text-black">
                    {gig.title}
                  </CardTitle>
                  <Badge className="rounded-full bg-[#f3eee6] px-3 py-1 text-xs font-black text-black hover:bg-[#f3eee6]">
                    {gig.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-5 pt-0">
                <div className="grid gap-3 rounded-[24px] bg-[#f7f7f4] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                    <MapPin className="h-4 w-4 text-[#f20d14]" />
                    {gig.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                    <Clock className="h-4 w-4 text-[#f20d14]" />
                    {formatGigType(gig.gig_type)}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                    <DollarSign className="h-4 w-4 text-[#f20d14]" />
                    {formatBudget()}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                    <Users className="h-4 w-4 text-[#f20d14]" />
                    {gig.positions_available || 1} position{(gig.positions_available || 1) === 1 ? "" : "s"}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-neutral-400">Brief</p>
                  <p className="mt-2 text-[15px] leading-6 text-neutral-700">{gig.description}</p>
                </div>

                {gig.required_skills && gig.required_skills.length > 0 && (
                  <div className="border-t border-neutral-100 pt-4">
                    <h4 className="mb-2 text-sm font-black text-black">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {gig.required_skills.map((skill: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="rounded-full border-neutral-200 px-3 py-1 text-xs font-semibold">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {gig.client && (
                  <div className="border-t border-neutral-100 pt-4">
                    <h4 className="mb-2 text-sm font-black text-black">Posted By</h4>
                    <div className="flex items-center gap-3 rounded-[22px] bg-white p-2 ring-1 ring-neutral-100">
                      <img
                        src={gig.client.profile_image_url || "/placeholder.svg?height=48&width=48"}
                        alt={gig.client.full_name}
                        loading="lazy"
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-black">{gig.client.full_name}</p>
                        <p className="text-xs font-semibold text-neutral-500">Hiring client</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="overflow-hidden rounded-[30px] border-0 bg-white shadow-sm ring-1 ring-black/5">
              <CardHeader className="p-5">
                <CardTitle className="text-[22px] font-black tracking-[-0.02em] text-black">Application Form</CardTitle>
                {alreadyApplied && (
                  <div className="mt-3 flex items-center gap-2 rounded-[22px] bg-amber-50 p-3 text-sm font-semibold text-amber-700">
                    <AlertCircle className="h-5 w-5" />
                    <span>{duplicateApplicationMessage}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-5 pt-0">
                {checkingEligibility ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-b-[#f20d14]" />
                  </div>
                ) : blockReason ? (
                  <div className="rounded-[24px] bg-[#f7f7f4] p-6 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-[#f20d14]">
                      <Crown className="h-7 w-7" />
                    </div>
                    <h3 className="mt-4 text-lg font-black text-black">
                      {blockReason === "scout" ? "Scout accounts can't apply" : "Paid subscription required"}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                      {blockReason === "signed_out"
                        ? "Sign in with a paid subscription to apply for this gig."
                        : blockReason === "scout"
                          ? "Scout accounts can post gigs to hire talent, but can't apply for them yourself."
                          : "Gigs can only be applied for by users with a paid subscription."}
                    </p>
                    <Button
                      type="button"
                      onClick={() => setShowUpgradePrompt(true)}
                      className="mt-5 h-[52px] w-full rounded-full bg-[#f20d14] text-[15px] font-bold text-white hover:bg-[#d9070d]"
                    >
                      Apply for this Gig
                    </Button>
                  </div>
                ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="rounded-[22px] border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>
                  )}

                  <div>
                    <Label htmlFor="rate">Your Proposed Rate (ZAR)</Label>
                    <Input
                      id="rate"
                      type="number"
                      placeholder="e.g., 5000"
                      value={applicationData.proposed_rate}
                      onChange={(e) => setApplicationData((prev) => ({ ...prev, proposed_rate: e.target.value }))}
                      className="mt-2 h-12 rounded-2xl border-[#e1e7f1] bg-white text-[15px] shadow-none focus-visible:ring-[#f20d14]"
                      disabled={alreadyApplied}
                    />
                  </div>

                  <div>
                    <Label htmlFor="timeline">Proposed Timeline</Label>
                    <Select
                      value={applicationData.proposed_timeline}
                      onValueChange={(value) => setApplicationData((prev) => ({ ...prev, proposed_timeline: value }))}
                      disabled={alreadyApplied}
                    >
                      <SelectTrigger className="mt-2 h-12 rounded-2xl border-[#e1e7f1] bg-white text-[15px] shadow-none focus:ring-[#f20d14]">
                        <SelectValue placeholder="Select availability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediately">Available Immediately</SelectItem>
                        <SelectItem value="1-week">Within 1 Week</SelectItem>
                        <SelectItem value="2-weeks">Within 2 Weeks</SelectItem>
                        <SelectItem value="1-month">Within 1 Month</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="portfolio">Portfolio Links (comma-separated)</Label>
                    <Input
                      id="portfolio"
                      type="text"
                      placeholder="https://portfolio.com/project1, https://vimeo.com/12345"
                      value={applicationData.portfolio_samples}
                      onChange={(e) => setApplicationData((prev) => ({ ...prev, portfolio_samples: e.target.value }))}
                      className="mt-2 h-12 rounded-2xl border-[#e1e7f1] bg-white text-[15px] shadow-none focus-visible:ring-[#f20d14]"
                      disabled={alreadyApplied}
                    />
                  </div>

                  <div>
                    <Label htmlFor="coverMessage">Cover Message *</Label>
                    <Textarea
                      id="coverMessage"
                      placeholder="Tell the client why you're perfect for this role..."
                      rows={6}
                      value={applicationData.cover_message}
                      onChange={(e) => setApplicationData((prev) => ({ ...prev, cover_message: e.target.value }))}
                      required
                      className="mt-2 min-h-[150px] rounded-2xl border-[#e1e7f1] bg-white text-[15px] shadow-none focus-visible:ring-[#f20d14]"
                      disabled={alreadyApplied}
                    />
                  </div>

                  <div className="flex flex-col gap-3 border-t border-neutral-100 pt-5 sm:flex-row">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      className="h-[52px] flex-1 rounded-full border-neutral-200 text-[15px] font-bold"
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting || alreadyApplied || !applicationData.cover_message}
                      className="h-[52px] flex-1 rounded-full bg-[#f20d14] text-[15px] font-bold text-white hover:bg-[#d9070d]"
                    >
                      {submitting ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                          Submitting...
                        </>
                      ) : alreadyApplied ? (
                        "Already Applied"
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Submit Application
                        </>
                      )}
                    </Button>
                  </div>
                </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <Dialog open={showUpgradePrompt} onOpenChange={setShowUpgradePrompt}>
        <DialogContent
          unstyled
          showCloseButton={false}
          overlayClassName="fixed inset-0 z-[169] bg-black/35 backdrop-blur-[6px]"
          className="fixed inset-x-0 bottom-0 top-auto z-[170] mx-0 w-full max-w-none gap-0 overflow-hidden rounded-b-none rounded-t-[30px] border-x-0 border-b-0 border-t border-[#e8dfd3] bg-white p-0 text-[#111318] shadow-[0_-24px_64px_rgba(15,23,42,0.18)] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        >
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-[#d7dce6]" />
          <div className="flex items-center justify-between border-b border-[#e8dfd3] px-5 pb-4 pt-4">
            <p className="text-[18px] font-semibold text-[#111318]">Apply for this gig</p>
            <button
              type="button"
              onClick={() => setShowUpgradePrompt(false)}
              aria-label="Close"
              className="grid h-10 w-10 place-items-center rounded-full border border-[#e7e0d6] bg-white"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="px-5 py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-[#f20d14]">
              <Crown className="h-8 w-8" />
            </div>
            <h2 className="mt-4 text-xl font-black text-black">
              {blockReason === "scout" ? "Scout accounts can't apply" : "Paid subscription required"}
            </h2>
            <p className="mt-3 text-[15px] leading-6 text-neutral-600">
              {blockReason === "signed_out"
                ? "Gigs can only be applied for by users with a paid subscription. Sign in (or create a free account) and subscribe to send an application."
                : blockReason === "scout"
                  ? "Scout accounts are free and built for posting gigs to hire talent. To apply for gigs yourself, you'll need a Creator or Crew account with an active subscription."
                  : "Gigs can only be applied for by users with a paid subscription - Studio, Store, Creator, or Crew."}
            </p>

            <div className="mt-6 flex flex-col gap-3">
              {blockReason === "signed_out" ? (
                <Button asChild className="h-[52px] rounded-full bg-[#f20d14] text-[15px] font-bold text-white hover:bg-[#d9070d]">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              ) : blockReason === "no_subscription" ? (
                <Button asChild className="h-[52px] rounded-full bg-[#f20d14] text-[15px] font-bold text-white hover:bg-[#d9070d]">
                  <Link href="/subscribe/plans">Upgrade Plan</Link>
                </Button>
              ) : (
                <Button asChild className="h-[52px] rounded-full bg-[#f20d14] text-[15px] font-bold text-white hover:bg-[#d9070d]">
                  <Link href="/marketplace/post-gig">Post a Gig Instead</Link>
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowUpgradePrompt(false)}
                className="h-[52px] rounded-full border-neutral-200 text-[15px] font-bold"
              >
                Not Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MobileShell>
  )
}
