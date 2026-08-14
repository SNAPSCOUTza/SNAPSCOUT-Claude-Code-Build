"use client"

import { useState } from "react"
import Image from "next/image"
import { Play } from "lucide-react"
import { PortfolioLightbox } from "./portfolio-lightbox"
import type { LightboxPortfolioItem } from "@/types/portfolio"

interface PortfolioItem extends LightboxPortfolioItem {
  id: string
  type: "image" | "video"
  thumbnail: string
  fullUrl?: string
  title?: string
}

interface PortfolioGridProps {
  items: PortfolioItem[]
  onHire?: () => void
}

const platformColors: Record<string, string> = {
  instagram: "bg-gradient-to-br from-purple-500 to-pink-500",
  youtube: "bg-red-500",
  vimeo: "bg-blue-500",
  facebook: "bg-blue-600",
  imdb: "bg-amber-500",
  external: "bg-slate-700",
  local: "bg-gray-500",
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function PortfolioGrid({ items, onHire }: PortfolioGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-lg">No portfolio items yet</p>
        <p className="text-sm mt-2">Connect your social media or upload content to showcase your work</p>
      </div>
    )
  }

  return (
    <>
      {/* Grid Layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            onClick={() => setLightboxIndex(index)}
            className="aspect-square relative group cursor-pointer overflow-hidden rounded-lg bg-muted"
          >
            {/* Thumbnail Image */}
            <Image
              src={item.thumbnail || "/placeholder.svg"}
              alt={item.title || "Portfolio item"}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />

            {/* Overlay on Hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-center text-white">
                {item.type === "video" && (
                  <div className="mb-2">
                    <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm">
                      <Play className="h-6 w-6 text-white fill-white" />
                    </div>
                  </div>
                )}
                {item.title && <p className="text-sm font-medium px-4 line-clamp-2">{item.title}</p>}
              </div>
            </div>

            {/* Platform Badge */}
            {item.platform && (
              <div
                className={`absolute top-2 left-2 ${platformColors[item.platform]} text-white text-xs px-2 py-1 rounded-full font-medium opacity-0 group-hover:opacity-100 transition-opacity`}
              >
                {item.platform}
              </div>
            )}

            {/* Video Duration */}
            {item.type === "video" && item.duration && (
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {formatDuration(item.duration)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <PortfolioLightbox
          items={items}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNext={() => setLightboxIndex((lightboxIndex + 1) % items.length)}
          onPrev={() => setLightboxIndex((lightboxIndex - 1 + items.length) % items.length)}
          onHire={onHire}
        />
      )}
    </>
  )
}
