import type { ReactNode } from "react"
import Link from "next/link"
import { Home } from "lucide-react"

export default function CrewPoolsLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <div className="mx-auto flex max-w-6xl justify-end px-4 pt-4 md:px-8 print:hidden">
        <Link
          href="/find-crew"
          className="flex h-10 items-center gap-2 rounded-full border border-[#e4ebf3] bg-white px-4 text-sm font-semibold text-[#07111f] shadow-sm transition hover:border-[#ef1218] hover:text-[#ef1218]"
        >
          <Home className="h-4 w-4" />
          Return Home
        </Link>
      </div>
      {children}
    </div>
  )
}
