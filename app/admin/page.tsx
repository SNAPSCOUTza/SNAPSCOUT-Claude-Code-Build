import Link from "next/link"
import { AlertTriangle, BarChart3, Briefcase, Megaphone, MousePointerClick, ShieldCheck, Sparkles, Users } from "lucide-react"
import { getAdminMetrics } from "@/lib/admin/server"

const metricCards = [
  { key: "totalUsers", label: "Users", icon: Users, tone: "bg-[#111318] text-white" },
  { key: "totalGigs", label: "Gigs", icon: Briefcase, tone: "bg-white text-[#111318]" },
  { key: "applications", label: "Applications", icon: Sparkles, tone: "bg-white text-[#111318]" },
  { key: "openReports", label: "Open reports", icon: AlertTriangle, tone: "bg-[#fff3f0] text-[#b42318]" },
  { key: "activeAds", label: "Active ads", icon: Megaphone, tone: "bg-white text-[#111318]" },
  { key: "totalAdClicks", label: "Ad clicks", icon: MousePointerClick, tone: "bg-white text-[#111318]" },
]

export default async function AdminOverviewPage() {
  const metrics = await getAdminMetrics()

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[32px] bg-[#111318] text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
        <div className="relative p-6 sm:p-8">
          <div className="absolute right-8 top-8 h-24 w-24 rounded-full bg-[#f20d14] blur-3xl opacity-40" />
          <p className="text-xs font-black uppercase tracking-[0.28em] text-white/45">Super admin CMS</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-black leading-[0.92] sm:text-5xl">
            Run content, users, moderation, and visibility from one place.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/65">
            Manage SnapScout operations without exposing the console to ordinary users. Public content stays readable;
            write access stays admin-only.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/admin/users" className="rounded-full bg-[#f20d14] px-5 py-3 text-sm font-black text-white transition hover:scale-[1.02] active:scale-[0.98]">
              Manage users
            </Link>
            <Link href="/admin/moderation" className="rounded-full border border-white/20 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10 active:scale-[0.98]">
              Review reports
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metricCards.map((card) => {
          const Icon = card.icon
          const value = metrics[card.key as keyof typeof metrics] as number
          return (
            <div key={card.key} className={`rounded-[26px] border border-[#e1e7f0] p-5 shadow-sm ${card.tone}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold opacity-70">{card.label}</span>
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[#f20d14] text-white">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <div className="mt-6 text-4xl font-black">{Number(value || 0).toLocaleString()}</div>
            </div>
          )
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[28px] border border-[#e1e7f0] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f20d14]">Activity</p>
              <h2 className="mt-1 text-2xl font-black">Recent admin actions</h2>
            </div>
            <BarChart3 className="h-6 w-6 text-[#8b98ad]" />
          </div>
          <div className="mt-5 space-y-3">
            {metrics.recentActivity.length ? (
              metrics.recentActivity.map((item: any) => (
                <div key={item.id} className="rounded-2xl border border-[#edf1f6] bg-[#fafbfe] p-4">
                  <p className="font-bold">{item.action}</p>
                  <p className="text-sm text-[#64748b]">
                    {item.entity_type || "platform"} · {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-2xl bg-[#fafbfe] p-4 text-sm text-[#64748b]">No admin activity has been logged yet.</p>
            )}
          </div>
        </div>
        <div className="rounded-[28px] border border-[#e1e7f0] bg-white p-5 shadow-sm">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-[#fff0f1] text-[#f20d14]">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="mt-5 text-2xl font-black">Guardrails live here.</h2>
          <p className="mt-2 text-sm leading-6 text-[#64748b]">
            The console is hidden from non-admin users, route guarded on the server, and backed by Supabase RLS policies.
          </p>
          <div className="mt-5 rounded-2xl bg-[#f6f8fb] p-4 text-sm font-semibold text-[#52627a]">
            Admins: {metrics.adminUsers} · Suspended: {metrics.suspendedUsers}
          </div>
        </div>
      </section>
    </div>
  )
}
