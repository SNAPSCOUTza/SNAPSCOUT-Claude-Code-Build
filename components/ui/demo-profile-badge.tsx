type DemoProfileBadgeProps = {
  className?: string
  // "red" (default) is a solid red pill with white text, for use on plain
  // white page backgrounds (detail-page badge rows). "white" is a solid
  // white pill with black text, for use as an overlay on top of photos
  // (card thumbnails), where a translucent/red pill loses contrast against
  // varied image content.
  variant?: "red" | "white"
}

export function DemoProfileBadge({ className = "", variant = "red" }: DemoProfileBadgeProps) {
  const colors =
    variant === "white"
      ? "bg-white text-[#111318] shadow-md"
      : "bg-[#f20d14] text-white"

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${colors} ${className}`}
    >
      Demo profile
    </span>
  )
}
