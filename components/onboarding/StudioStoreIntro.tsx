"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StudioStoreIntroProps {
  onContinue: () => void
  onBack: () => void
}

const fadeUp = {
  initial: { opacity: 0, y: 18, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
}

export function StudioStoreIntro({ onContinue, onBack }: StudioStoreIntroProps) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const timeout = window.setTimeout(() => setReady(true), 5000)
    return () => window.clearTimeout(timeout)
  }, [])

  return (
    <motion.section
      initial="initial"
      animate="animate"
      transition={{ staggerChildren: 0.14, delayChildren: 0.08 }}
      className="flex min-h-[calc(100svh-118px)] flex-col"
    >
      <div className="relative flex flex-1 flex-col overflow-hidden rounded-[34px] border border-[#e0e6ef] bg-white px-5 pb-6 pt-4 shadow-[0_18px_56px_rgba(17,19,24,0.08)]">
        <motion.button
          variants={fadeUp}
          transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
          type="button"
          onClick={onBack}
          className="absolute left-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#dce3ee] bg-white/85 text-[#111318] shadow-sm backdrop-blur"
          aria-label="Back"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </motion.button>

        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-6 w-full max-w-[390px]"
        >
          <div className="relative mx-auto aspect-[9/13] max-h-[62svh] w-full overflow-hidden rounded-[28px] bg-white">
            <Image
              src="/images/onboarding-studio-store-intro.png"
              alt="Studio and store owner onboarding"
              fill
              className="bg-white object-contain"
              priority
            />
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.74, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
          className="mx-auto mt-4 max-w-[350px] text-center"
        >
          <p className="text-[12px] font-black uppercase tracking-[0.24em] text-[#ff111b]">Studio / Store setup</p>
          <h1 className="mt-2 text-[31px] font-black leading-[1.03] tracking-tight">
            Built for Studio & Store Owners
          </h1>
          <p className="mx-auto mt-3 max-w-[320px] text-[15px] leading-6 text-[#667085]">
            Manage bookings, showcase your space or products, and connect with the right clients.
          </p>
        </motion.div>
      </div>

      <div className="sticky bottom-0 -mx-4 mt-auto border-t border-[#e8edf4] bg-[#f5f2ee]/95 px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-3 backdrop-blur">
        {ready ? (
          <motion.div
            initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
          >
            <Button
              className="h-14 w-full rounded-full bg-[#ff111b] text-[16px] font-extrabold text-white shadow-[0_18px_36px_rgba(255,17,27,0.22)] hover:bg-[#e60012]"
              onClick={onContinue}
            >
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-14 items-center justify-center gap-2"
            role="status"
            aria-label="Preparing studio and store onboarding"
          >
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                className="h-2.5 w-2.5 rounded-full bg-[#ff111b]"
                animate={{ opacity: [0.35, 1, 0.35], y: [0, -5, 0], scale: [0.9, 1.08, 0.9] }}
                transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.16, ease: "easeInOut" }}
              />
            ))}
          </motion.div>
        )}
      </div>
    </motion.section>
  )
}
