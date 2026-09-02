"use client"

import { useEffect, useState } from "react"
import { ShieldCheck } from "lucide-react"
import { LoadingDot } from "@/components/ui/loading-dot"

const roles = ["user", "client", "scout", "creator", "crew", "studio", "store", "admin", "super_admin"]

export default function AdminUsersManager() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [savingId, setSavingId] = useState("")

  const loadUsers = async () => {
    setLoading(true)
    const response = await fetch("/api/admin/users")
    const payload = await response.json()
    if (!response.ok) setError(payload.error || "Could not load users.")
    else setUsers(payload.users || [])
    setLoading(false)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const updateUser = async (userId: string, patch: Record<string, any>) => {
    setSavingId(userId)
    setError("")
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
    const payload = await response.json()
    if (!response.ok) setError(payload.error || "Could not update user.")
    else setUsers((current) => current.map((user) => (user.user_id === userId ? payload.user : user)))
    setSavingId("")
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] border border-[#e1e7f0] bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#f20d14]">Super admin</p>
        <h1 className="mt-1 text-3xl font-black">Users and access</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748b]">
          Promote admins, suspend accounts, and inspect profile state. Role edits are restricted to super admins by
          server guard and RLS.
        </p>
      </section>

      {error && <p className="rounded-2xl bg-[#fff0f1] px-4 py-3 text-sm font-semibold text-[#b42318]">{error}</p>}

      <section className="grid gap-3">
        {loading ? (
          <div className="rounded-[28px] border border-[#e1e7f0] bg-white p-8 text-center text-[#64748b]">Loading users...</div>
        ) : (
          users.map((user) => (
            <article key={user.user_id} className="rounded-[26px] border border-[#e1e7f0] bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#f3f6fb] text-sm font-black text-[#52627a]">
                      {(user.display_name || user.email || "?").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-xl font-black">{user.display_name || user.full_name || "Unnamed user"}</h2>
                      <p className="truncate text-sm text-[#64748b]">{user.email || user.user_id}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#f3f6fb] px-3 py-1 text-xs font-bold text-[#52627a]">{user.account_type || "no type"}</span>
                    <span className="rounded-full bg-[#fff0f1] px-3 py-1 text-xs font-bold text-[#f20d14]">{user.role || "user"}</span>
                    {user.suspended && <span className="rounded-full bg-[#fff3f0] px-3 py-1 text-xs font-bold text-[#b42318]">Suspended</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <select
                    value={user.role || "user"}
                    onChange={(event) => updateUser(user.user_id, { role: event.target.value })}
                    className="h-11 rounded-full border border-[#dce3ee] bg-white px-4 text-sm font-bold outline-none focus:border-[#f20d14]"
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => updateUser(user.user_id, { suspended: !user.suspended })}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#dce3ee] px-4 text-sm font-bold transition hover:border-[#f20d14] hover:text-[#f20d14] active:scale-[0.98]"
                  >
                    {savingId === user.user_id ? <LoadingDot /> : <ShieldCheck className="h-4 w-4" />}
                    {user.suspended ? "Restore" : "Suspend"}
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  )
}
