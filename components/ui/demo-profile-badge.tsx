import { Sparkles } from "lucide-react"

export function DemoProfileBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-[#f20d14]/30 bg-[#f20d14]/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#f20d14] ${className}`}
    >
      <Sparkles className="h-3 w-3" />
      Demo profile
    </span>
  )
}
