import Link from "next/link"
import { ShieldAlert } from "lucide-react"

export default function AccountSuspendedPage() {
  return (
    <main className="min-h-screen bg-[#f6f8fb] px-4 py-12 text-[#111318]">
      <section className="mx-auto max-w-xl rounded-[32px] border border-[#e1e7f0] bg-white p-8 text-center shadow-[0_20px_50px_rgba(15,23,42,0.1)]">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#fff0f1] text-[#f20d14]">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-black">Account under review</h1>
        <p className="mt-3 text-sm leading-6 text-[#64748b]">
          This account has been temporarily suspended by SnapScout moderation. Please contact support if you believe
          this was a mistake.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-[#f20d14] px-6 text-sm font-black text-white"
        >
          Contact support
        </Link>
      </section>
    </main>
  )
}
