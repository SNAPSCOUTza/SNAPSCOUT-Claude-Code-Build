"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Home } from "lucide-react"
import { GoalSelect, type OnboardingGoal } from "@/components/onboarding/GoalSelect"
import { RoleSelect } from "@/components/onboarding/RoleSelect"
import { BranchSelect } from "@/components/onboarding/BranchSelect"
import { QuestionScreen } from "@/components/onboarding/QuestionScreen"
import { StudioStoreIntro } from "@/components/onboarding/StudioStoreIntro"
import { AhaMoment } from "@/components/onboarding/AhaMoment"
import { SignupForm } from "@/components/onboarding/SignupForm"
import { FeatureTour } from "@/components/onboarding/FeatureTour"
import { CompleteScreen } from "@/components/onboarding/CompleteScreen"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getPersonaLine, getTrack, roleTheme } from "@/lib/onboarding-config"
import type { OnboardingAnswers, OnboardingBranch, OnboardingRole } from "@/types/onboarding"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"
import type { OnboardingData as LegacyOnboardingData } from "@/types/onboarding"

type Screen = "goal" | "role" | "studio_store_intro" | "branch" | "questions" | "aha" | "signup" | "tour" | "complete"
export type OnboardingData = LegacyOnboardingData

function ProgressBar({ total, current }: { total: number; current: number }) {
  return (
    <div className="mb-5 mt-2 grid gap-2 px-1" style={{ gridTemplateColumns: `repeat(${Math.max(total, 1)}, minmax(0, 1fr))` }}>
      {Array.from({ length: total }).map((_, index) => {
        const done = index < current
        const active = index === current
        return (
          <div
            key={index}
            className={`h-1.5 rounded-full ${done ? "bg-[#ff111b]" : active ? "bg-[#111318]" : "bg-[#e4e8ef]"}`}
          />
        )
      })}
    </div>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const { signUp, isAuthenticated, user } = useAuth()
  const [screen, setScreen] = useState<Screen>("goal")
  const [goal, setGoal] = useState<OnboardingGoal | null>(null)
  const [role, setRole] = useState<OnboardingRole | null>(null)
  const [branch, setBranch] = useState<OnboardingBranch | null>(null)
  const [answers, setAnswers] = useState<OnboardingAnswers>({})
  const [questionIndex, setQuestionIndex] = useState(0)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [signupError, setSignupError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [verifyingAuth, setVerifyingAuth] = useState(false)
  const [tourStep, setTourStep] = useState(0)

  const supabase = useMemo(() => createClient(), [])
  const track = useMemo(() => getTrack(role, branch), [role, branch])
  const currentQuestion = track?.questions[questionIndex]
  const primaryClass = role ? roleTheme[role].primary : roleTheme.creator.primary
  const selectionClass = role ? roleTheme[role].selection : roleTheme.creator.selection

  const totalProgressSteps = track ? track.questions.length + 4 : 5
  const progressCurrent =
    screen === "goal"
      ? 0
      : screen === "role"
        ? 1
        : screen === "studio_store_intro" || screen === "branch"
          ? 2
          : screen === "questions"
            ? questionIndex + 3
            : screen === "aha"
              ? totalProgressSteps - 2
              : totalProgressSteps - 1

  const canContinueQuestion = useMemo(() => {
    if (!currentQuestion) return false
    const value = answers[currentQuestion.id]
    if (currentQuestion.mode === "multi") return Array.isArray(value) && value.length > 0
    return typeof value === "string" && value.length > 0
  }, [answers, currentQuestion])

  const handleRoleSelect = (nextRole: OnboardingRole) => {
    setRole(nextRole)
    setBranch(null)
    setAnswers((prev) => ({ goal: prev.goal || goal || "" }))
    setQuestionIndex(0)
    setScreen(nextRole === "scout" ? "questions" : nextRole === "studio_store" ? "studio_store_intro" : "branch")
  }

  const handleBranchSelect = (nextBranch: OnboardingBranch) => {
    setBranch(nextBranch)
    setAnswers((prev) => ({ goal: prev.goal || goal || "" }))
    setQuestionIndex(0)
    setScreen("questions")
  }

  const handleQuestionContinue = () => {
    if (!track) return
    if (questionIndex < track.questions.length - 1) {
      setQuestionIndex((prev) => prev + 1)
      return
    }
    setScreen("aha")
  }

  const handleQuestionBack = () => {
    if (questionIndex > 0) {
      setQuestionIndex((prev) => prev - 1)
      return
    }
    if (role === "scout") {
      setScreen("role")
      return
    }
    setScreen("branch")
  }

  const handleAhaContinue = async () => {
    setVerifyingAuth(true)
    try {
      // isAuthenticated from context can be stale (based on a locally cached
      // session that was never revalidated). Confirm with the auth server
      // before skipping account creation, otherwise an expired/invalid
      // session silently skips straight past SignupForm.
      const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } }
      setScreen(data.user ? "tour" : "signup")
    } finally {
      setVerifyingAuth(false)
    }
  }

  const handleSignup = async () => {
    if (!role) return
    setSignupError("")
    if (password !== confirmPassword) {
      setSignupError("Passwords do not match yet.")
      return
    }
    setSubmitting(true)
    try {
      const accountType =
        role === "scout"
          ? roleTheme.scout.accountType
          : role === "creator"
            ? roleTheme.creator.accountType
            : roleTheme.studio_store.accountType
      const displayName = email.split("@")[0] || "SnapScout User"

      if (!isAuthenticated) {
        const { error } = await signUp(email, password, displayName, accountType)
        if (error) {
          setSignupError(error.message || "Failed to create account")
          setSubmitting(false)
          return
        }

        // signUp() creates the account but its internal auto-sign-in can
        // fail silently. Confirm a real session exists before moving on -
        // otherwise the account exists but the user isn't signed in, and
        // they'll get bounced to login at the very end of the flow.
        const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } }
        if (!data.user) {
          setSignupError("Your account was created, but we couldn't sign you in automatically. Please sign in.")
          setSubmitting(false)
          return
        }
      }

      await fetch("/api/profile/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.id,
          display_name: displayName,
          full_name: displayName,
          account_type: accountType,
          onboarding_data: {
            goal,
            role,
            branch,
            answers,
            completed_at: new Date().toISOString(),
          },
        }),
      }).catch(() => null)

      setScreen("tour")
    } finally {
      setSubmitting(false)
    }
  }

  const topSpecialisations = useMemo(() => {
    const possible = answers.q2
    if (Array.isArray(possible)) return possible.slice(0, 3).map((value) => value.replace(/_/g, " "))
    return []
  }, [answers])

  return (
    <main className="min-h-screen bg-[#f5f2ee] text-[#111318]">
      <div className="mx-auto flex min-h-screen w-full max-w-[460px] flex-col px-4 py-5 md:max-w-3xl md:py-8">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#dce3ee] bg-white text-[#111318] shadow-sm"
            aria-label="Home"
          >
            <Home className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="text-[20px] font-black leading-none">
              <span className="text-[#ff111b]">Snap</span>Scout
            </p>
            <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8a94a6]">Onboarding</p>
          </div>
          <div className="h-11 w-11" />
        </div>

        {screen !== "goal" ? <ProgressBar total={totalProgressSteps} current={progressCurrent} /> : null}

        <AnimatePresence mode="wait">
          <motion.div
            key={`${screen}-${questionIndex}-${branch || "none"}`}
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            {screen === "goal" ? (
              <GoalSelect
                value={goal}
                onSelect={(nextGoal) => {
                  setGoal(nextGoal)
                  setAnswers((prev) => ({ ...prev, goal: nextGoal }))
                }}
                onContinue={() => setScreen("role")}
              />
            ) : null}

            {screen === "role" ? (
              <RoleSelect
                selectedGoal={goal}
                onSelect={handleRoleSelect}
                onBack={() => setScreen("goal")}
              />
            ) : null}

            {screen === "studio_store_intro" ? (
              <StudioStoreIntro onContinue={() => setScreen("branch")} onBack={() => setScreen("role")} />
            ) : null}

            {screen === "branch" && role && role !== "scout" ? (
              <BranchSelect
                role={role}
                onSelect={handleBranchSelect}
                onBack={() => setScreen(role === "studio_store" ? "studio_store_intro" : "role")}
              />
            ) : null}

            {screen === "questions" && currentQuestion ? (
              <QuestionScreen
                question={currentQuestion}
                value={answers[currentQuestion.id]}
                onChange={(value) => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))}
                onContinue={handleQuestionContinue}
                onBack={handleQuestionBack}
                canContinue={canContinueQuestion}
                primaryButtonClass={primaryClass}
                roleSelectionClass={selectionClass}
              />
            ) : null}

            {screen === "aha" ? (
              <AhaMoment
                personaLine={getPersonaLine(role, branch, answers)}
                primaryButtonClass={primaryClass}
                onContinue={handleAhaContinue}
                onBack={() => setScreen("questions")}
                loading={verifyingAuth}
              />
            ) : null}

            {screen === "signup" && isAuthenticated ? (
              <Card className="rounded-[30px] border border-[#e0e6ef] bg-white shadow-sm">
                <CardHeader>
                  <CardTitle>You are already signed in</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    We&apos;ll skip account creation and continue to your personalised tour.
                  </p>
                  <Button className={`w-full rounded-full ${primaryClass}`} onClick={() => setScreen("tour")}>
                    Continue
                  </Button>
                  <Button variant="ghost" className="w-full rounded-full" onClick={() => setScreen("aha")}>
                    Back
                  </Button>
                </CardContent>
              </Card>
            ) : null}

            {screen === "signup" && !isAuthenticated ? (
              <SignupForm
                roleLabel={role ? roleTheme[role].label : "Member"}
                primaryButtonClass={primaryClass}
                email={email}
                password={password}
                confirmPassword={confirmPassword}
                onEmailChange={setEmail}
                onPasswordChange={setPassword}
                onConfirmPasswordChange={setConfirmPassword}
                onSubmit={handleSignup}
                onBack={() => setScreen("aha")}
                loading={submitting}
                error={signupError}
              />
            ) : null}

            {screen === "tour" ? (
              <FeatureTour
                step={tourStep}
                onNext={() => {
                  if (tourStep >= 3) {
                    setScreen("complete")
                    return
                  }
                  setTourStep((prev) => prev + 1)
                }}
                onSkip={() => setScreen("complete")}
              />
            ) : null}

            {screen === "complete" && role ? (
              <CompleteScreen
                role={role}
                firstName={(email.split("@")[0] || "there").replace(/[._-]/g, " ")}
                topSpecialisations={topSpecialisations}
                primaryButtonClass={primaryClass}
                onDone={() => router.push("/dashboard")}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  )
}
