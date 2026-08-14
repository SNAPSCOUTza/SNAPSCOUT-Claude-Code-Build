"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"

type DevicePreset = {
  key: string
  label: string
  width: number
  height: number
}

const DEVICE_PRESETS: DevicePreset[] = [
  { key: "iphone14", label: "iPhone 14", width: 390, height: 844 },
  { key: "iphone14promax", label: "iPhone 14 Pro Max", width: 430, height: 932 },
]

function isMobilePreviewRoute(pathname: string) {
  if (pathname === "/") return true
  if (pathname === "/explore") return true
  if (pathname === "/find-crew") return true
  if (pathname === "/creators") return true
  if (pathname === "/studios-stores") return true
  if (pathname.startsWith("/crew/")) return true
  return false
}

function withQuery(pathname: string, params: URLSearchParams) {
  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}

export default function MobilePreviewFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  const previewMode = searchParams.get("preview") === "mobile"
  const embedded = searchParams.get("previewEmbedded") === "1"
  const selectedDevice = searchParams.get("device") || "iphone14"
  const device = DEVICE_PRESETS.find((preset) => preset.key === selectedDevice) || DEVICE_PRESETS[0]
  const supportedRoute = isMobilePreviewRoute(pathname)

  const baseParams = new URLSearchParams(searchParams.toString())
  baseParams.delete("preview")
  baseParams.delete("previewEmbedded")

  const iframeParams = new URLSearchParams(baseParams.toString())
  iframeParams.set("previewEmbedded", "1")
  iframeParams.set("device", selectedDevice)

  const normalHref = withQuery(pathname, baseParams)
  const iframeSrc = withQuery(pathname, iframeParams)

  useEffect(() => {
    const root = document.documentElement
    if (embedded) {
      root.dataset.mobilePreviewEmbedded = "true"
      return () => {
        delete root.dataset.mobilePreviewEmbedded
      }
    }

    delete root.dataset.mobilePreviewEmbedded
  }, [embedded])

  const applyEmbeddedScrollbarReset = () => {
    const iframe = iframeRef.current
    if (!iframe) return

    try {
      const doc = iframe.contentDocument
      if (!doc) return

      doc.documentElement.dataset.mobilePreviewEmbedded = "true"
      doc.documentElement.style.overflowX = "hidden"
      if (doc.body) {
        doc.body.style.overflowX = "hidden"
      }

      if (!doc.getElementById("mobile-preview-scrollbar-reset")) {
        const style = doc.createElement("style")
        style.id = "mobile-preview-scrollbar-reset"
        style.textContent = `
          html, body { overflow-x: hidden !important; }
          * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
          *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; background: transparent !important; }
        `
        doc.head.appendChild(style)
      }
    } catch {
      // Preview-only: ignore iframe style injection issues.
    }
  }

  if (!supportedRoute || embedded) {
    return <>{children}</>
  }

  if (!previewMode) {
    return (
      <>
        {children}
      </>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#f2f4f8] px-4 py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4">
        <div className="flex w-full max-w-[430px] items-center justify-between gap-2">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#687182]">
            Device preview · {device.width}x{device.height}
          </p>
          <Link
            href={normalHref}
            className="inline-flex h-9 items-center rounded-full border border-[#d8deea] bg-white px-4 text-[13px] font-semibold text-[#0f1115] hover:bg-[#f7f9fc]"
          >
            Exit Preview
          </Link>
        </div>

        <div className="flex w-full max-w-[430px] gap-2">
          {DEVICE_PRESETS.map((preset) => {
            const params = new URLSearchParams(baseParams.toString())
            params.set("preview", "mobile")
            params.set("device", preset.key)
            return (
              <Link
                key={preset.key}
                href={withQuery(pathname, params)}
                className={`inline-flex h-9 items-center rounded-full border px-3 text-[12px] font-semibold transition-colors ${
                  preset.key === device.key
                    ? "border-[#111318] bg-[#111318] text-white"
                    : "border-[#d8deea] bg-white text-[#0f1115] hover:bg-[#f7f9fc]"
                }`}
              >
                {preset.label}
              </Link>
            )
          })}
        </div>

        <div
          className="relative overflow-hidden rounded-[42px] border-2 border-[#111318] bg-black p-[6px] shadow-[0_26px_80px_rgba(0,0,0,0.35)]"
          style={{
            width: `min(${device.width + 12}px, 96vw)`,
            aspectRatio: `${device.width + 12} / ${device.height + 12}`,
          }}
        >
          <div className="absolute left-1/2 top-[6px] z-20 h-[28px] w-[130px] -translate-x-1/2 rounded-b-[16px] bg-black" />
          <div className="h-full w-full overflow-hidden rounded-[36px] bg-white">
            <iframe
              ref={iframeRef}
              title="Mobile preview"
              src={iframeSrc}
              className="h-full w-full border-0"
              loading="eager"
              referrerPolicy="no-referrer"
              onLoad={applyEmbeddedScrollbarReset}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
