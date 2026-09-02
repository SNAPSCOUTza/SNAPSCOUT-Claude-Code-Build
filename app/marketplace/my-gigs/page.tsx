"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Briefcase, MapPin, ChevronDown, ChevronUp, Mail, ExternalLink, Trash2 } from "lucide-react"
import { createBrowserClient } from "@supabase/ssr"
import MobileShell from "@/components/mobile/mobile-shell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Gig {
  id: string
  title: string
  category: string
  location: string
  status: string
  salary_min: number | null
  salary_max: number | null
  salary_currency: string | null
  created_at: string
}

interface Applicant {
  id: string
  freelancer_id: string
  status: string
  cover_message: string | null
  proposed_rate: number | null
  created_at: string
  display_name: string
  profile_picture: string | null
  profession: string | null
  email: string | null
}

const statusColor = (status: string) => {
  switch (status) {
    case "accepted":
    case "hired":
      return "bg-emerald-100 text-emerald-800"
    case "rejected":
      return "bg-red-100 text-red-800"
    case "shortlisted":
      return "bg-blue-100 text-blue-800"
    default:
      return "bg-yellow-100 text-yellow-800"
  }
}

const formatBudget = (gig: Gig) => {
  if (gig.salary_min && gig.salary_max) {
    return `R${gig.salary_min.toLocaleString()} - R${gig.salary_max.toLocaleString()}`
  }
  return "Rate negotiable"
}

export default function MyGigsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [gigs, setGigs] = useState<Gig[]>([])
  const [applicantsByGig, setApplicantsByGig] = useState<Record<string, Applicant[]>>({})
  const [expandedGigId, setExpandedGigId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deletingGigId, setDeletingGigId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const fetchGigs = async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/auth/login")
      return
    }

    const { data: gigRows, error: gigError } = await supabase
      .from("gigs")
      .select("id, title, category, location, status, salary_min, salary_max, salary_currency, created_at")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })

    if (gigError) {
      console.error("Error fetching gigs:", gigError)
      setLoading(false)
      return
    }

    setGigs(gigRows || [])

    const gigIds = (gigRows || []).map((g) => g.id)
    if (gigIds.length > 0) {
      const { data: applicationRows } = await supabase
        .from("gig_applications")
        .select("id, gig_id, freelancer_id, status, cover_message, proposed_rate, created_at")
        .in("gig_id", gigIds)
        .order("created_at", { ascending: false })

      const freelancerIds = Array.from(new Set((applicationRows || []).map((a) => a.freelancer_id)))
      let profilesById: Record<string, any> = {}
      if (freelancerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("user_profiles")
          .select("user_id, display_name, profile_picture, profession, email")
          .in("user_id", freelancerIds)
        profilesById = Object.fromEntries((profiles || []).map((p) => [p.user_id, p]))
      }

      const grouped: Record<string, Applicant[]> = {}
      for (const app of applicationRows || []) {
        const profile = profilesById[app.freelancer_id]
        const applicant: Applicant = {
          id: app.id,
          freelancer_id: app.freelancer_id,
          status: app.status || "pending",
          cover_message: app.cover_message,
          proposed_rate: app.proposed_rate,
          created_at: app.created_at,
          display_name: profile?.display_name || "SnapScout Member",
          profile_picture: profile?.profile_picture || null,
          profession: profile?.profession || null,
          email: profile?.email || null,
        }
        if (!grouped[app.gig_id]) grouped[app.gig_id] = []
        grouped[app.gig_id].push(applicant)
      }
      setApplicantsByGig(grouped)
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchGigs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const updateApplicationStatus = async (applicationId: string, gigId: string, status: string) => {
    setUpdatingId(applicationId)
    const { error } = await supabase.from("gig_applications").update({ status }).eq("id", applicationId)
    if (!error) {
      setApplicantsByGig((prev) => ({
        ...prev,
        [gigId]: (prev[gigId] || []).map((a) => (a.id === applicationId ? { ...a, status } : a)),
      }))
    }
    setUpdatingId(null)
  }

  const deleteGig = async (gigId: string) => {
    setDeletingGigId(gigId)
    const { error } = await supabase.from("gigs").delete().eq("id", gigId)
    if (!error) {
      setGigs((prev) => prev.filter((g) => g.id !== gigId))
      setApplicantsByGig((prev) => {
        const next = { ...prev }
        delete next[gigId]
        return next
      })
    }
    setDeletingGigId(null)
    setConfirmDeleteId(null)
  }

  return (
    <MobileShell title="My Gigs">
      <div className="space-y-5 px-4 pb-28 pt-3 sm:px-6">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[32px] bg-[#111] p-5 text-white shadow-sm"
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/45">SnapScout Gigs</p>
              <h1 className="mt-2 text-[28px] font-black leading-[0.95] tracking-[-0.04em]">
                Gigs you've posted.
              </h1>
            </div>
            <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#d40000] sm:flex">
              <Briefcase className="h-7 w-7" />
            </div>
          </div>
          <Link
            href="/marketplace/post-gig"
            className="mt-4 inline-flex h-11 items-center rounded-full bg-white px-4 text-sm font-semibold text-black"
          >
            Post a New Gig
          </Link>
        </motion.section>

        {loading && <div className="py-12 text-center text-neutral-500">Loading your gigs...</div>}

        {!loading && gigs.length === 0 && (
          <div className="rounded-[28px] bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
            <Briefcase className="mx-auto mb-3 h-10 w-10 text-neutral-300" />
            <h3 className="text-lg font-bold text-neutral-900">No gigs posted yet</h3>
            <p className="mt-1 text-sm text-neutral-500">Post a gig to start receiving applications from talent.</p>
            <Link href="/marketplace/post-gig">
              <Button className="mt-4 rounded-full bg-[#d40000] text-white hover:bg-[#b80000]">Post a Gig</Button>
            </Link>
          </div>
        )}

        {!loading &&
          gigs.map((gig) => {
            const applicants = applicantsByGig[gig.id] || []
            const isExpanded = expandedGigId === gig.id
            return (
              <div key={gig.id} className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-black/5">
                <div className="flex w-full items-start justify-between gap-4 p-5">
                  <button
                    type="button"
                    onClick={() => setExpandedGigId(isExpanded ? null : gig.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[17px] font-bold text-neutral-900">{gig.title || "Untitled gig"}</h3>
                      <Badge variant="secondary">{gig.category}</Badge>
                      <Badge className={gig.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-neutral-100 text-neutral-700"}>
                        {gig.status}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
                      {gig.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {gig.location}
                        </span>
                      )}
                      <span>{formatBudget(gig)}</span>
                      <span className="font-semibold text-neutral-700">
                        {applicants.length} application{applicants.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(gig.id)}
                      disabled={deletingGigId === gig.id}
                      className="grid h-9 w-9 place-items-center rounded-full text-neutral-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      aria-label="Delete gig"
                      title="Delete gig"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedGigId(isExpanded ? null : gig.id)}
                      className="grid h-9 w-9 place-items-center rounded-full text-neutral-400 hover:bg-neutral-100"
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {confirmDeleteId === gig.id && (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-red-100 bg-red-50 px-5 py-4">
                    <p className="text-sm font-semibold text-red-800">
                      Delete "{gig.title || "this gig"}"? All applications to it will be removed too.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfirmDeleteId(null)}
                        className="h-9 rounded-full px-4 text-xs font-semibold"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        disabled={deletingGigId === gig.id}
                        onClick={() => deleteGig(gig.id)}
                        className="h-9 rounded-full bg-red-600 px-4 text-xs font-semibold text-white hover:bg-red-700"
                      >
                        {deletingGigId === gig.id ? "Deleting..." : "Delete Gig"}
                      </Button>
                    </div>
                  </div>
                )}

                {isExpanded && (
                  <div className="space-y-3 border-t border-neutral-100 p-5 pt-4">
                    {applicants.length === 0 && (
                      <p className="text-sm text-neutral-500">No applications yet for this gig.</p>
                    )}
                    {applicants.map((applicant) => (
                      <div key={applicant.id} className="rounded-2xl bg-[#f7f7f4] p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {applicant.profile_picture ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={applicant.profile_picture}
                                alt={applicant.display_name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200 text-sm font-bold text-neutral-600">
                                {applicant.display_name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-bold text-neutral-900">{applicant.display_name}</p>
                              {applicant.profession && (
                                <p className="text-xs text-neutral-500">{applicant.profession}</p>
                              )}
                            </div>
                          </div>
                          <Badge className={statusColor(applicant.status)}>{applicant.status}</Badge>
                        </div>

                        {applicant.cover_message && (
                          <p className="mt-3 text-sm text-neutral-600 line-clamp-3">{applicant.cover_message}</p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                          <div className="text-sm font-semibold text-neutral-700">
                            {applicant.proposed_rate ? `R${applicant.proposed_rate.toLocaleString()}` : "Rate negotiable"}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {applicant.email && (
                              <a
                                href={`mailto:${applicant.email}`}
                                className="inline-flex h-9 items-center gap-1 rounded-full border border-neutral-200 px-3 text-xs font-semibold text-neutral-700"
                              >
                                <Mail className="h-3.5 w-3.5" />
                                Contact
                              </a>
                            )}
                            <Link
                              href={`/creators/${applicant.freelancer_id}`}
                              className="inline-flex h-9 items-center gap-1 rounded-full border border-neutral-200 px-3 text-xs font-semibold text-neutral-700"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                              View Profile
                            </Link>
                            {applicant.status !== "accepted" && applicant.status !== "hired" && (
                              <Button
                                size="sm"
                                disabled={updatingId === applicant.id}
                                onClick={() => updateApplicationStatus(applicant.id, gig.id, "accepted")}
                                className="h-9 rounded-full bg-[#d40000] px-3 text-xs font-semibold text-white hover:bg-[#b80000]"
                              >
                                Accept
                              </Button>
                            )}
                            {applicant.status !== "rejected" && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={updatingId === applicant.id}
                                onClick={() => updateApplicationStatus(applicant.id, gig.id, "rejected")}
                                className="h-9 rounded-full px-3 text-xs font-semibold"
                              >
                                Decline
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
      </div>
    </MobileShell>
  )
}
