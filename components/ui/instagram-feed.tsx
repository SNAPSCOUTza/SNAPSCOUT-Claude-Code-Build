"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Instagram, ExternalLink, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface InstagramFeedProps {
  handle?: string
  url?: string
  className?: string
  postCount?: number
}

export function InstagramFeed({ handle, url, className, postCount = 6 }: InstagramFeedProps) {
  const [instagramHandle, setInstagramHandle] = useState("")
  const [showFeed, setShowFeed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (handle) {
      setInstagramHandle(handle.replace("@", ""))
      setShowFeed(true)
    } else if (url) {
      // Extract handle from URL
      const match = url.match(/instagram\.com\/([^/?]+)/)
      if (match) {
        setInstagramHandle(match[1])
        setShowFeed(true)
      }
    }
  }, [handle, url])

  useEffect(() => {
    if (showFeed && instagramHandle) {
      // Simulate loading time for SnapWidget
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [showFeed, instagramHandle])

  if (!showFeed || !instagramHandle) {
    return null
  }

  const instagramUrl = `https://instagram.com/${instagramHandle}`

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Instagram className="h-5 w-5 mr-2 text-pink-600" />
            Latest Instagram Posts
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
              <Instagram className="h-4 w-4 mr-1" />@{instagramHandle}
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
            <span className="ml-2 text-gray-600">Loading Instagram posts...</span>
          </div>
        ) : (
          <>
            {/* Actual SnapWidget Embed */}
            <div className="snapwidget-container mb-6">
              <div className="bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-1 rounded-lg">
                <div className="bg-white rounded-lg overflow-hidden">
                  <iframe
                    src={`https://snapwidget.com/embed/${instagramHandle}`}
                    className="snapwidget-widget w-full h-96 border-0"
                    allowTransparency={true}
                    frameBorder="0"
                    scrolling="no"
                    style={{
                      border: "none",
                      overflow: "hidden",
                      width: "100%",
                      height: "400px",
                    }}
                    title={`Instagram feed for @${instagramHandle}`}
                  />
                </div>
              </div>
            </div>

            {/* Fallback Grid for when SnapWidget is not available */}
            <div className="snapwidget-fallback hidden">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {Array.from({ length: postCount }).map((_, index) => (
                  <div
                    key={index}
                    className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity group relative overflow-hidden"
                    onClick={() => window.open(instagramUrl, "_blank")}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-pink-500/20 to-red-500/20"></div>
                    <div className="relative z-10 text-center">
                      <Instagram className="h-6 w-6 text-white mx-auto mb-1 drop-shadow-lg" />
                      <span className="text-xs text-white font-medium drop-shadow-lg">Post {index + 1}</span>
                    </div>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ExternalLink className="h-4 w-4 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600 mb-3">Follow for the latest updates and behind-the-scenes content</p>
              <Button
                variant="outline"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
                onClick={() => window.open(instagramUrl, "_blank")}
              >
                <Instagram className="h-4 w-4 mr-2" />
                Follow @{instagramHandle}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
