"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AccountCreatedScreenProps {
  email: string
  primaryButtonClass: string
  onContinue: () => void
}

const fadeUp = {
  initial: { opacity: 0, y: 18, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.54, ease: [0.22, 1, 0.36, 1] as const } },
}

export function AccountCreatedScreen({ email, primaryButtonClass, onContinue }: AccountCreatedScreenProps) {
  return (
    <motion.section {...fadeUp} className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-[34px] border border-[#e0e6ef] bg-white shadow-[0_20px_70px_rgba(15,23,42,0.1)]"
      >
        <div className="px-5 pb-6 pt-5">
          <div className="overflow-hidden rounded-[28px] bg-[#fbfaf8]">
            <img
              src="/images/onboarding-all-set.png"
              alt="SnapScout creatives ready to collaborate"
              className="h-auto w-full object-cover"
            />
          </div>
          <div className="px-2 pb-2 pt-6 text-center">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ff111b]">Account created</p>
            <h1 className="mt-2 text-[28px] font-black leading-tight tracking-tight">Check your email</h1>
            <p className="mt-3 text-[15px] leading-6 text-[#667085]">
              We&apos;ve sent a confirmation link to <span className="font-bold text-[#111318]">{email}</span>. Click
              it, then come back and sign in.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
      >
        <Button
          className={`h-14 w-full rounded-full text-[16px] font-extrabold shadow-[0_18px_36px_rgba(255,17,27,0.22)] ${primaryButtonClass}`}
          onClick={onContinue}
        >
          Go to sign in
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <p className="mt-3 text-center text-[12px] leading-5 text-[#667085]">
          Didn&apos;t get the email? Check your spam folder, or try signing up again.
        </p>
      </motion.div>
    </motion.section>
  )
}
