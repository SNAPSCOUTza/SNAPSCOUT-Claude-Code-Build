"use client"

import { useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"

const fadeUp = {
  hidden: { opacity: 0, y: 18, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
}

export default function SignUpPage() {
  const router = useRouter()

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      router.replace("/onboarding")
    }, 1200)

    return () => window.clearTimeout(timeout)
  }, [router])

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f2ee] px-4 py-8 text-[#111318]">
      <motion.section
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.14, delayChildren: 0.08 }}
        className="w-full max-w-[430px] rounded-[34px] border border-[#e1e6ef] bg-white p-6 text-center shadow-[0_24px_70px_rgba(17,19,24,0.10)]"
      >
        <motion.div
          variants={fadeUp}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fff1f2] ring-1 ring-[#ffd4d8]"
        >
          <Image
            src="/images/snapscout-new-logo.jpeg"
            alt="SnapScout"
            width={52}
            height={52}
            className="h-12 w-12 rounded-full object-cover"
            priority
          />
        </motion.div>

        <motion.div variants={fadeUp} transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }} className="mt-5">
          <p className="text-[24px] font-black leading-none">
            <span className="text-[#ff111b]">Snap</span>Scout
          </p>
          <p className="mt-2 text-[12px] font-black uppercase tracking-[0.24em] text-[#9aa4b5]">Onboarding</p>
        </motion.div>

        <motion.div variants={fadeUp} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="mt-8">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#ff111b] text-white shadow-[0_16px_34px_rgba(255,17,27,0.25)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="text-[31px] font-black leading-[1.02] tracking-tight">Let&apos;s set up your SnapScout profile.</h1>
          <p className="mx-auto mt-3 max-w-[310px] text-[15px] leading-6 text-[#667085]">
            We&apos;ll personalize your account before asking you to create it.
          </p>
        </motion.div>

        <motion.div variants={fadeUp} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="mt-8">
          <Link
            href="/onboarding"
            className="inline-flex h-14 w-full items-center justify-center rounded-full bg-[#ff111b] text-[16px] font-extrabold text-white shadow-[0_18px_40px_rgba(255,17,27,0.24)]"
          >
            Continue to onboarding
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </motion.div>
      </motion.section>
    </main>
  )
}
