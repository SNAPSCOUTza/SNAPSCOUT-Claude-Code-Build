"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, FolderKanban, Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CreatePoolModal } from "@/components/crew/CreatePoolModal"
import type { CrewPool } from "@/types/crew-pool"

export default function CrewPoolsPage() {
  const [pools, setPools] = useState<CrewPool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [createOpen, setCreateOpen] = useState(false)

  const fetchPools = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/crew-pools", { credentials: "include" })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not load crew pools")
      setPools(payload.pools || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load crew pools")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPools()
  }, [])

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-[#07111f] md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ef1218]">Crew planning</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">Crew Pools</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#5d6b82]">
              Save trusted creatives into named pools, check availability, and build call sheets from confirmed crew.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="h-12 rounded-full bg-[#ef1218] px-6 text-white hover:bg-[#d90d12]"
          >
            <Plus className="h-4 w-4" />
            New Pool
          </Button>
        </div>

        {error && (
          <div className="mt-6 flex items-center justify-between gap-3 rounded-3xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            <span>{error}</span>
            <Button type="button" variant="outline" size="sm" onClick={fetchPools} className="rounded-full bg-white">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="rounded-[28px] border-[#e4ebf3] bg-white">
                  <CardContent className="space-y-5 p-5">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-11 w-full rounded-full" />
                  </CardContent>
                </Card>
              ))
            : pools.map((pool, index) => (
                <motion.div
                  key={pool.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.35, ease: "easeOut" }}
                >
                  <Card className="h-full rounded-[28px] border-[#e4ebf3] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                    <CardContent className="flex h-full flex-col p-5">
                      <div className="flex items-center justify-between">
                        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f4f7fb]">
                          <FolderKanban className="h-6 w-6 text-[#07111f]" />
                        </span>
                        <span className="h-4 w-4 rounded-full" style={{ backgroundColor: pool.color }} />
                      </div>
                      <h2 className="mt-5 text-xl font-black">{pool.name}</h2>
                      <p className="mt-1 text-sm text-[#5d6b82]">{pool.member_count || 0} saved profiles</p>
                      <Button asChild className="mt-6 h-11 rounded-full bg-[#07111f] text-white hover:bg-black">
                        <Link href={`/crew-pools/${pool.id}`}>
                          Open
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
        </div>

        {!loading && pools.length === 0 && !error && (
          <div className="mt-10 rounded-[32px] border border-dashed border-[#dbe4ee] bg-[#f8fafc] p-8 text-center">
            <FolderKanban className="mx-auto h-12 w-12 text-[#8b98aa]" />
            <h2 className="mt-4 text-2xl font-black">No pools yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#5d6b82]">
              Save crew from any profile to get started, or create your first pool now.
            </p>
            <Button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="mt-5 h-12 rounded-full bg-[#ef1218] px-6 text-white hover:bg-[#d90d12]"
            >
              <Plus className="h-4 w-4" />
              Create pool
            </Button>
          </div>
        )}
      </div>

      <CreatePoolModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(pool) => setPools((prev) => [{ ...pool, member_count: 0 }, ...prev])}
      />
    </main>
  )
}
