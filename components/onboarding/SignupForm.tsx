"use client"

import { motion } from "framer-motion"
import { useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, Building2, BriefcaseBusiness, Eye, EyeOff, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SignupFormProps {
  roleLabel: string
  primaryButtonClass: string
  email: string
  password: string
  confirmPassword: string
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  onSubmit: () => Promise<void> | void
  onBack: () => void
  loading?: boolean
  error?: string
}

const fadeUp = {
  initial: { opacity: 0, y: 18, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.54, ease: [0.22, 1, 0.36, 1] } },
}

function getStrength(password: string) {
  let score = 0
  if (password.length >= 6) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  return Math.min(score, 4)
}

export function SignupForm({
  roleLabel,
  email,
  password,
  confirmPassword,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  onBack,
  loading,
  error,
}: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const strength = useMemo(() => getStrength(password), [password])
  const passwordsMatch = password.length > 0 && password === confirmPassword
  const canContinue = email.includes("@") && password.length >= 6 && passwordsMatch && !loading

  return (
    <motion.section {...fadeUp} className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-[34px] border border-[#e0e6ef] bg-white shadow-[0_20px_70px_rgba(15,23,42,0.1)]"
      >
        <div className="px-5 pb-4 pt-5">
          <button
            type="button"
            onClick={onBack}
            className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#dce3ee] text-[#111318]"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="overflow-hidden rounded-[28px] bg-[#fbfaf8]">
            <img
              src="/images/onboarding-all-set.png"
              alt="SnapScout creatives ready to collaborate"
              className="h-auto w-full object-cover"
            />
          </div>
          <div className="px-2 pb-2 pt-5">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ff111b]">Final step</p>
            <h1 className="mt-2 text-[34px] font-black leading-none tracking-tight">You are all set.</h1>
            <p className="mt-3 text-[16px] leading-6 text-[#667085]">
              Create your login and keep your SnapScout setup ready.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[#edf1f6] pt-4">
              {[
                { icon: Users, value: "40K+", label: "Creatives" },
                { icon: BriefcaseBusiness, value: "135K+", label: "Clients" },
                { icon: Building2, value: "68", label: "Studios" },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="text-center">
                    <Icon className="mx-auto h-5 w-5 text-[#667085]" />
                    <p className="mt-1 text-[18px] font-black text-[#111318]">{item.value}</p>
                    <p className="text-[11px] font-semibold text-[#667085]">{item.label}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-[30px] border border-[#e0e6ef] bg-white p-5 shadow-sm"
      >
        <h2 className="text-[22px] font-black leading-tight text-[#111318]">Create your account</h2>
        <p className="mt-1 text-[14px] leading-5 text-[#667085]">Join SnapScout as a {roleLabel}.</p>

        <div className="mt-5 space-y-4">
          <label className="block space-y-2">
            <span className="text-[13px] font-extrabold text-[#344054]">Email address</span>
            <Input
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              autoComplete="email"
              className="h-[52px] rounded-full border-[#dce3ee] px-5 text-[15px]"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-[13px] font-extrabold text-[#344054]">Password</span>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                autoComplete="new-password"
                minLength={6}
                className="h-[52px] rounded-full border-[#dce3ee] px-5 pr-12 text-[15px]"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </label>

          <label className="block space-y-2">
            <span className="text-[13px] font-extrabold text-[#344054]">Verify password</span>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => onConfirmPasswordChange(event.target.value)}
                autoComplete="new-password"
                minLength={6}
                className="h-[52px] rounded-full border-[#dce3ee] px-5 pr-12 text-[15px]"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {confirmPassword && !passwordsMatch ? (
              <span className="block text-[12px] font-semibold text-[#ff111b]">Passwords must match.</span>
            ) : null}
          </label>

          <div className="grid grid-cols-4 gap-1.5">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className={`h-1.5 rounded-full ${item <= strength ? "bg-[#ff111b]" : "bg-[#e8edf4]"}`} />
            ))}
          </div>
        </div>

        {error ? <p className="mt-4 rounded-[18px] bg-[#fff1f2] px-4 py-3 text-[13px] font-semibold text-[#ff111b]">{error}</p> : null}

        <Button
          disabled={!canContinue}
          className="mt-5 h-14 w-full rounded-full bg-[#ff111b] text-[16px] font-extrabold text-white shadow-[0_18px_36px_rgba(255,17,27,0.22)] hover:bg-[#e60012]"
          onClick={onSubmit}
        >
          {loading ? "Creating account..." : "Create my account"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <p className="mt-3 text-center text-[12px] leading-5 text-[#667085]">
          By joining you agree to SnapScout&apos;s Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </motion.section>
  )
}
