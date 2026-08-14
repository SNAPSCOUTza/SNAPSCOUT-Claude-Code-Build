import { BarChart3, Briefcase, MousePointerClick, Users } from "lucide-react"
import { getAdminMetrics } from "@/lib/admin/server"

export const dynamic = "force-dynamic"

export default async function AdminAnalyticsPage() {
  const metrics = await getAdminMetrics()
  const rows = [
    { label: "Total users", value: metrics.totalUsers, icon: Users },
    { label: "Total gigs", value: metrics.totalGigs, icon: Briefcase },
    { label: "Applications", value: metrics.applications, icon: BarChart3 },
    { label: "Ad clicks", value: metrics.totalAdClicks, icon: MousePointerClick },
  ]

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] border border-[#e1e7f0] bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#f20d14]">Analytics</p>
        <h1 className="mt-1 text-3xl font-black">Platform pulse</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748b]">
          A compact operational dashboard for signups, marketplace activity, moderation, ads, and featured content.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {rows.map((row) => {
          const Icon = row.icon
          return (
            <div key={row.label} className="rounded-[26px] border border-[#e1e7f0] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#64748b]">{row.label}</span>
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[#fff0f1] text-[#f20d14]">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-6 text-4xl font-black">{Number(row.value || 0).toLocaleString()}</div>
            </div>
          )
        })}
      </section>

      <section className="rounded-[30px] border border-[#e1e7f0] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-black">Operational ratios</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-[#f6f8fb] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7b8798]">Open reports</p>
            <p className="mt-2 text-2xl font-black">{metrics.openReports}</p>
          </div>
          <div className="rounded-2xl bg-[#f6f8fb] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7b8798]">Featured creators</p>
            <p className="mt-2 text-2xl font-black">{metrics.featuredCreators}</p>
          </div>
          <div className="rounded-2xl bg-[#f6f8fb] p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7b8798]">Featured gigs</p>
            <p className="mt-2 text-2xl font-black">{metrics.featuredGigs}</p>
          </div>
        </div>
      </section>
    </div>
  )
}
