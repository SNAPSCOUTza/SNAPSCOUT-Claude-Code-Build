import { Loader2 } from "lucide-react"

import MobileShell from "@/components/mobile/mobile-shell"
import { Skeleton } from "@/components/ui/skeleton"

function GigSkeletonCard() {
  return (
    <div className="rounded-[26px] border border-[#ece4da] bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-6 w-40 rounded-full" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-9 w-20 rounded-full" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Skeleton className="h-[92px] rounded-[20px]" />
        <Skeleton className="h-[92px] rounded-[20px]" />
      </div>

      <div className="mt-4 space-y-3">
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="h-4 w-[92%] rounded-full" />
        <Skeleton className="h-4 w-[70%] rounded-full" />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-28 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="md:hidden">
        <MobileShell title="Available Gigs">
          <div className="rounded-[28px] border border-[#ece4da] bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-[#f2c2c6] bg-[#fff7f7] px-6 py-7 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#A41010]" />
              <p className="text-[15px] font-semibold text-[#111318]">Loading gigs</p>
              <p className="text-[13px] text-[#6b7280]">Pulling the latest opportunities for you.</p>
            </div>

            <div className="mt-4 space-y-4">
              <GigSkeletonCard />
              <GigSkeletonCard />
              <GigSkeletonCard />
            </div>
          </div>
        </MobileShell>
      </div>

      <div className="hidden min-h-screen bg-[#fcfcfd] md:block">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="flex items-center justify-center gap-3 pb-8 text-[#A41010]">
            <Loader2 className="h-7 w-7 animate-spin" />
            <span className="text-lg font-semibold text-[#111318]">Loading gigs</span>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <GigSkeletonCard />
            <GigSkeletonCard />
            <GigSkeletonCard />
            <GigSkeletonCard />
          </div>
        </div>
      </div>
    </div>
  )
}
