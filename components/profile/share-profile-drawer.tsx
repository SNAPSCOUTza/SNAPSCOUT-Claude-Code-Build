"use client"

import { useState } from "react"
import { MessageSquare, Share2, X } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ProfileShareCard } from "@/components/profile/profile-share-card"
import { ShareToMessengerModal } from "@/components/profile/share-to-messenger-modal"

export interface ShareProfileDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profileId: string
  profileName: string
  profileRole?: string
  profileLocation?: string
  profileImage?: string
  profileBio?: string
  profileHref: string
  stats?: { label: string; value: string }[]
}

// Bottom-sheet drawer using the same Dialog-as-bottom-sheet pattern already
// established across the app (gig-apply blocker, Locations disclaimer,
// sign-in drawer) rather than pulling in a new drawer dependency.
export function ShareProfileDrawer({
  open,
  onOpenChange,
  profileId,
  profileName,
  profileRole,
  profileLocation,
  profileImage,
  profileBio,
  profileHref,
  stats,
}: ShareProfileDrawerProps) {
  const [messengerOpen, setMessengerOpen] = useState(false)

  const url = typeof window !== "undefined" ? `${window.location.origin}${profileHref}` : profileHref

  const shareExternally = async () => {
    const shareData = {
      title: `${profileName} on SnapScout`,
      text: `Check out ${profileName} on SnapScout.${profileRole ? `\n\n${profileRole}` : ""}`,
      url,
    }
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // AbortError when the user cancels the native share sheet - not an
        // error worth surfacing.
      }
      return
    }
    // Fallback for browsers without the Web Share API.
    try {
      await navigator.clipboard.writeText(`${shareData.text}\n\n${url}`)
    } catch {
      // Clipboard unavailable too - nothing more we can do gracefully here.
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          unstyled
          showCloseButton={false}
          overlayClassName="fixed inset-0 z-[169] bg-black/35 backdrop-blur-[6px]"
          className="fixed inset-x-0 bottom-0 top-auto z-[170] mx-0 w-full max-w-none gap-0 overflow-hidden rounded-b-none rounded-t-[30px] border-x-0 border-b-0 border-t border-[#e8dfd3] bg-[#f7f7f4] p-0 text-[#111318] shadow-[0_-24px_64px_rgba(15,23,42,0.18)] data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        >
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-[#d7dce6]" />
          <div className="flex items-center justify-between px-5 pb-3 pt-4">
            <DialogTitle className="text-[18px] font-semibold text-[#111318]">Share Profile</DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="grid h-10 w-10 place-items-center rounded-full border border-[#e7e0d6] bg-white"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <div className="max-h-[80dvh] overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+20px)]">
            <ProfileShareCard
              profileName={profileName}
              profileRole={profileRole}
              profileLocation={profileLocation}
              profileImage={profileImage}
              profileBio={profileBio}
              stats={stats}
              url={url}
            />

            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={shareExternally}
                className="h-12 rounded-full border-[#e6ebf3] bg-white text-[#111318] hover:bg-[#fff7f7] hover:text-[#f20d14]"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button
                type="button"
                onClick={() => setMessengerOpen(true)}
                className="h-12 rounded-full bg-[#f20d14] text-white hover:bg-[#d9070d]"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Share in SnapScout
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ShareToMessengerModal open={messengerOpen} onOpenChange={setMessengerOpen} profileId={profileId} profileHref={profileHref} />
    </>
  )
}
