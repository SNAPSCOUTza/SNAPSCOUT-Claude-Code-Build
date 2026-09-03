"use client"

import { useState } from "react"
import Image from "next/image"
import { Check, Copy, Lock } from "lucide-react"

export interface ProfileShareCardProps {
  profileName: string
  profileRole?: string
  profileLocation?: string
  profileImage?: string
  profileBio?: string
  stats?: { label: string; value: string }[]
  url: string
}

// The share card is a real, live-rendered component (not a screenshot) so
// it always reflects the current profile and stays visually in sync with
// the rest of the app automatically.
export function ProfileShareCard({
  profileName,
  profileRole,
  profileLocation,
  profileImage,
  profileBio,
  stats = [],
  url,
}: ProfileShareCardProps) {
  const [copied, setCopied] = useState(false)
  const initial = profileName?.charAt(0)?.toUpperCase() || "?"
  const displayUrl = url.replace(/^https?:\/\//, "")

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API can be unavailable (older browsers, insecure context)
      // - fail silently rather than throwing, the Copy button just won't
      // show the "Copied" confirmation.
    }
  }

  return (
    <div className="rounded-[28px] border border-[#eee6db] bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
      <div className="flex items-center justify-center gap-1.5">
        <Image src="/images/snapscout-studio-add-logo.png" alt="" width={24} height={24} className="rounded-full" />
        <p className="text-[15px] font-black leading-none">
          <span className="text-[#f20d14]">Snap</span>Scout
        </p>
      </div>

      {/* Red visual - the hero focal point. Built from real UI (gradient +
          Image + text), never a flattened image asset. */}
      <div className="relative mt-4 overflow-hidden rounded-[22px] bg-gradient-to-br from-[#f20d14] via-[#d80a10] to-[#8f0509] px-6 pb-8 pt-10 text-center">
        <div className="pointer-events-none absolute inset-0 opacity-25 [background:radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_55%)]" />
        <div className="relative mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-[#ffd9d6] shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
          {profileImage ? (
            <Image src={profileImage} alt={profileName} fill sizes="112px" className="object-cover" />
          ) : (
            <span className="text-[36px] font-black text-[#f20d14]">{initial}</span>
          )}
        </div>
        <p className="relative mt-4 text-[26px] font-black leading-tight text-white">{profileName}</p>
        {profileLocation && (
          <p className="relative mt-1 text-[13px] font-medium text-white/85">{profileLocation}</p>
        )}
      </div>

      {(profileRole || profileBio) && (
        <div className="mt-4 text-center">
          {profileRole && <p className="text-[15px] font-bold text-[#111318]">{profileRole}</p>}
          {profileBio && <p className="mt-1 text-[13px] leading-5 text-[#666b75]">{profileBio}</p>}
        </div>
      )}

      {stats.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#f1ede7] pt-4">
          {stats.slice(0, 4).map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-[17px] font-black text-[#111318]">{stat.value}</p>
              <p className="text-[11px] text-[#8a94a6]">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      <p className="mt-5 text-center text-[14px] font-semibold text-[#111318]">
        Connect with me on <span className="text-[#f20d14]">SnapScout</span>.
      </p>

      <button
        type="button"
        onClick={copyLink}
        className="mt-3 flex w-full items-center justify-between gap-2 rounded-full bg-[#fdf0ef] px-4 py-3 text-left transition-colors hover:bg-[#fbe4e2]"
      >
        <span className="min-w-0 truncate text-[13px] font-semibold text-[#111318]">{displayUrl}</span>
        <span className="flex shrink-0 items-center gap-1.5 text-[13px] font-bold text-[#f20d14]">
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy
            </>
          )}
        </span>
      </button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[12px] text-[#8a94a6]">
        <Lock className="h-3 w-3" />
        Anyone with this link can view this profile.
      </p>
    </div>
  )
}
