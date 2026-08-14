"use client"
import { cn } from "@/lib/utils"

interface PortfolioTabsProps {
  platforms: { name: string; count: number }[]
  activeTab: string
  onTabChange: (tab: string) => void
}

export function PortfolioTabs({ platforms, activeTab, onTabChange }: PortfolioTabsProps) {
  const totalCount = platforms.reduce((sum, p) => sum + p.count, 0)

  return (
    <div className="sticky top-0 bg-background z-10 border-b">
      <div className="flex gap-1 overflow-x-auto py-2 px-1">
        <button
          onClick={() => onTabChange("all")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
            activeTab === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80",
          )}
        >
          All ({totalCount})
        </button>
        {platforms.map((platform) => (
          <button
            key={platform.name}
            onClick={() => onTabChange(platform.name.toLowerCase())}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              activeTab === platform.name.toLowerCase()
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            {platform.name} ({platform.count})
          </button>
        ))}
      </div>
    </div>
  )
}
