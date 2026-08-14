import type { ReactNode } from "react"

export function SnapScoutStateArt({
  variant,
  children,
  className = "",
}: {
  variant: "empty" | "offline"
  children?: ReactNode
  className?: string
}) {
  const src =
    variant === "offline"
      ? "/images/loading-states/offline-404.jpg"
      : "/images/loading-states/no-creatives.jpg"
  const alt = variant === "offline" ? "This page is currently offline or not found" : "No creatives here"

  return (
    <div className={`mx-auto flex w-full max-w-[430px] flex-col items-center text-center ${className}`}>
      <img src={src} alt={alt} className="w-full rounded-[28px] object-contain" />
      {children ? <div className="-mt-4 flex flex-wrap justify-center gap-3">{children}</div> : null}
    </div>
  )
}
