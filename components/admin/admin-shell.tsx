import Link from "next/link"
import { Home, ShieldCheck } from "lucide-react"
import { adminNavItems } from "@/lib/admin/admin-config"
import type { AdminProfile } from "@/lib/admin/server"

type AdminShellProps = {
  profile: AdminProfile
  children: React.ReactNode
}

export default function AdminShell({ profile, children }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[#f6f8fb] text-[#111318]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-4 py-5 lg:flex-row lg:px-6">
        <aside className="lg:sticky lg:top-5 lg:h-[calc(100vh-40px)] lg:w-72">
          <div className="flex h-full flex-col rounded-[28px] border border-[#e1e7f0] bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
            <div className="rounded-[24px] bg-[#111318] p-5 text-white">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-white/45">SnapScout</p>
              <h1 className="mt-2 text-2xl font-black leading-none">
                Admin <span className="text-[#f20d14]">Console</span>
              </h1>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold">
                <ShieldCheck className="h-4 w-4 text-[#f20d14]" />
                {profile.role === "super_admin" ? "Super admin" : "Admin"}
              </div>
            </div>

            <nav className="mt-4 flex-1 space-y-1 overflow-y-auto pr-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-[#4b5870] transition duration-200 hover:bg-[#fff0f1] hover:text-[#f20d14] active:scale-[0.98]"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f3f6fb] text-[#60708a] transition group-hover:bg-white group-hover:text-[#f20d14]">
                      <Icon className="h-4 w-4" />
                    </span>
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="mt-4 border-t border-[#e5eaf2] pt-4">
              <Link
                href="/explore"
                className="flex h-12 items-center justify-center gap-2 rounded-full border border-[#dce3ee] bg-white text-sm font-bold transition hover:border-[#f20d14] hover:text-[#f20d14] active:scale-[0.98]"
              >
                <Home className="h-4 w-4" />
                Back to app
              </Link>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-5 rounded-[28px] border border-[#e1e7f0] bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#f20d14]">Platform management</p>
                <h2 className="mt-1 text-3xl font-black leading-none">Control room</h2>
              </div>
              <div className="rounded-full bg-[#f5f7fb] px-4 py-2 text-sm font-semibold text-[#52627a]">
                {profile.email || profile.display_name || "Admin user"}
              </div>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
