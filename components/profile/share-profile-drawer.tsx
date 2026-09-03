"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { MessageSquare, Share2, X } from "lucide-react"
import { Drawer, DrawerContent, DrawerHandle, DrawerTitle } from "@/components/ui/drawer"
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

// Bottom sheet built on vaul's Drawer - the same mechanism the Quick
// Hire/Book sheet (hire-request-sheet.tsx) uses on mobile - so it gets the
// same native drag-to-dismiss physics and smooth downward close animation,
// rather than the CSS-animate-class approach used elsewhere in the app.
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
  const [isClosing, setIsClosing] = useState(false)

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

  // vaul animates the drawer's own close; isClosing only drives the close
  // button's own tap/exit micro-animation, mirroring the Quick Hire sheet.
  const closeSheet = () => {
    setIsClosing(true)
    onOpenChange(false)
  }

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={(nextOpen) => {
          if (nextOpen) setIsClosing(false)
          onOpenChange(nextOpen)
        }}
        shouldScaleBackground={false}
      >
        <DrawerContent
          unstyled
          overlayClassName="z-[169] bg-black/35 backdrop-blur-[6px]"
          className="fixed inset-x-0 bottom-0 top-auto z-[170] mx-0 flex h-auto max-h-[85dvh] w-full max-w-none flex-col gap-0 overflow-hidden rounded-b-none rounded-t-[30px] border-x-0 border-b-0 border-t border-[#e8dfd3] bg-[#f7f7f4] p-0 text-[#111318] shadow-[0_-24px_64px_rgba(15,23,42,0.18)] outline-none"
        >
          <DrawerTitle className="sr-only">Share Profile</DrawerTitle>

          <motion.div
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.9 }}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="shrink-0">
              <DrawerHandle className="mx-auto mt-3 h-1.5 w-16 rounded-full bg-[#cfd5df] shadow-[0_1px_0_rgba(255,255,255,0.8)_inset]" />
              <div className="flex items-center justify-end px-5 pb-3 pt-4">
                <motion.button
                  type="button"
                  onClick={closeSheet}
                  aria-label="Close"
                  whileTap={{ scale: 0.9, rotate: -8 }}
                  animate={isClosing ? { opacity: 0, scale: 0.7, rotate: 45 } : { opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="grid h-10 w-10 place-items-center rounded-full border border-[#e7e0d6] bg-white"
                >
                  <X className="h-4.5 w-4.5" />
                </motion.button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+20px)]">
              <ProfileShareCard
                profileName={profileName}
                profileRole={profileRole}
                profileLocation={profileLocation}
                profileImage={profileImage}
                profileBio={profileBio}
                stats={stats}
                url={url}
              />

              <div className="mt-4 flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={shareExternally}
                  className="h-12 flex-1 rounded-full border-[#e6ebf3] bg-white text-[#111318] hover:bg-[#fff7f7] hover:text-[#f20d14]"
                  asChild
                >
                  <motion.button whileTap={{ scale: 0.94 }}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </motion.button>
                </Button>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setMessengerOpen(true)}
                  aria-label="Share in SnapScout"
                  title="Share in SnapScout"
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#f20d14] text-white shadow-[0_8px_20px_rgba(242,13,20,0.35)] hover:bg-[#d9070d]"
                >
                  <MessageSquare className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </DrawerContent>
      </Drawer>

      <ShareToMessengerModal open={messengerOpen} onOpenChange={setMessengerOpen} profileId={profileId} profileHref={profileHref} />
    </>
  )
}
