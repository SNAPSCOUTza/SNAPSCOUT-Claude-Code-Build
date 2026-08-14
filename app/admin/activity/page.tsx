import { getAdminContext } from "@/lib/admin/server"

export const dynamic = "force-dynamic"

export default async function AdminActivityPage() {
  const { supabase } = await getAdminContext()
  const { data: activity } = await supabase
    .from("admin_activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] border border-[#e1e7f0] bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#f20d14]">Audit trail</p>
        <h1 className="mt-1 text-3xl font-black">Admin activity</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748b]">The latest console actions for moderation and operational accountability.</p>
      </section>
      <section className="space-y-3">
        {(activity || []).map((item: any) => (
          <article key={item.id} className="rounded-[24px] border border-[#e1e7f0] bg-white p-5 shadow-sm">
            <p className="text-lg font-black">{item.action}</p>
            <p className="mt-1 text-sm text-[#64748b]">
              {item.entity_type || "platform"} · {new Date(item.created_at).toLocaleString()}
            </p>
          </article>
        ))}
        {!activity?.length && (
          <div className="rounded-[28px] border border-[#e1e7f0] bg-white p-8 text-center text-[#64748b]">
            No activity recorded yet.
          </div>
        )}
      </section>
    </div>
  )
}
