"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Star, Trash2 } from "lucide-react"
import { LoadingDot } from "@/components/ui/loading-dot"

type AdminLocation = {
  id: string
  name: string
  city: string
  province: string
  location_type: string
  status: string
  cover_image_url: string | null
  rating: number
  review_count: number
  save_count: number
  created_by: string
  created_at: string
}

export default function AdminLocationsManager() {
  const [locations, setLocations] = useState<AdminLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState("")
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const loadLocations = async () => {
    setLoading(true)
    const response = await fetch("/api/admin/locations")
    const payload = await response.json()
    if (!response.ok) setError(payload.error || "Could not load locations.")
    else setLocations(payload.locations || [])
    setLoading(false)
  }

  useEffect(() => {
    loadLocations()
  }, [])

  const deleteLocation = async (id: string) => {
    setDeletingId(id)
    setError("")
    const response = await fetch(`/api/admin/locations/${id}`, { method: "DELETE" })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) setError(payload.error || "Could not delete this location.")
    else setLocations((current) => current.filter((location) => location.id !== id))
    setDeletingId("")
    setConfirmId(null)
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] border border-[#e1e7f0] bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#f20d14]">Super admin</p>
        <h1 className="mt-1 text-3xl font-black">Shoot locations</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748b]">
          Review every location uploaded by users and remove listings that no longer belong on the platform.
        </p>
      </section>

      {error && <p className="rounded-2xl bg-[#fff0f1] px-4 py-3 text-sm font-semibold text-[#b42318]">{error}</p>}

      <section className="grid gap-3">
        {loading ? (
          <div className="rounded-[28px] border border-[#e1e7f0] bg-white p-8 text-center text-[#64748b]">
            Loading locations...
          </div>
        ) : locations.length === 0 ? (
          <div className="rounded-[28px] border border-[#e1e7f0] bg-white p-8 text-center text-[#64748b]">
            No locations have been uploaded yet.
          </div>
        ) : (
          locations.map((location) => (
            <article key={location.id} className="rounded-[26px] border border-[#e1e7f0] bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#f3f6fb]">
                    {location.cover_image_url ? (
                      <Image src={location.cover_image_url} alt={location.name} fill className="object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-[#9aa0ab]">
                        <MapPin className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <Link href={`/locations/${location.id}`} target="_blank" className="truncate text-lg font-black hover:text-[#f20d14]">
                      {location.name || "Untitled location"}
                    </Link>
                    <p className="truncate text-sm text-[#64748b]">
                      {location.city}, {location.province}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#f3f6fb] px-3 py-1 text-xs font-bold text-[#52627a]">
                        {location.location_type}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          location.status === "published"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-[#fff3f0] text-[#b45309]"
                        }`}
                      >
                        {location.status}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#fff0f1] px-3 py-1 text-xs font-bold text-[#f20d14]">
                        <Star className="h-3 w-3 fill-current" />
                        {location.rating > 0 ? location.rating.toFixed(1) : "New"} ({location.review_count})
                      </span>
                      <span className="rounded-full bg-[#f3f6fb] px-3 py-1 text-xs font-bold text-[#52627a]">
                        {location.save_count} saved
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {confirmId === location.id ? (
                    <>
                      <button
                        onClick={() => deleteLocation(location.id)}
                        disabled={deletingId === location.id}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-red-600 px-4 text-sm font-bold text-white transition hover:bg-red-700 active:scale-[0.98] disabled:opacity-50"
                      >
                        {deletingId === location.id ? <LoadingDot /> : null}
                        Confirm delete
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="inline-flex h-11 items-center justify-center rounded-full border border-[#dce3ee] px-4 text-sm font-bold transition hover:border-[#f20d14] hover:text-[#f20d14] active:scale-[0.98]"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmId(location.id)}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#dce3ee] px-4 text-sm font-bold text-[#b42318] transition hover:border-red-600 hover:bg-red-50 active:scale-[0.98]"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  )
}
