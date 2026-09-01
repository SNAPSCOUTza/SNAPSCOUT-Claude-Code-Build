import { Info } from "lucide-react"

export function DemoProfileNotice({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border border-[#f20d14]/25 bg-[#f20d14]/[0.06] p-4 ${className}`}
    >
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#f20d14]" />
      <p className="text-sm leading-5 text-[#7a1013]">
        This profile is a demo. This user is still in the process of onboarding and can&apos;t be hired at the
        moment.
      </p>
    </div>
  )
}
