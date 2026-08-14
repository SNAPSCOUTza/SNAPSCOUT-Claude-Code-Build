"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import AccountTypeSelection from "./account-type-selection"
import FilmCrewRoleSelection from "./film-crew-role-selection"
import ContentCreatorSpecializationSelection from "./content-creator-specialization-selection"
import type { OnboardingData, AccountType } from "@/types/onboarding"

interface RoleSpecializationStepProps {
  onNext: () => void
  onPrev: () => void
  data: OnboardingData
  updateData: (updates: Partial<OnboardingData>) => void
  selectedAccountType: AccountType | null
  onAccountTypeSelect: (accountType: AccountType) => void
}

export default function RoleSpecializationStep({
  onNext,
  onPrev,
  data,
  updateData,
  selectedAccountType,
  onAccountTypeSelect,
}: RoleSpecializationStepProps) {
  const canProceed = () => {
    if (!selectedAccountType) return false

    if (selectedAccountType === "film_crew") {
      return data.selectedRoles.length > 0
    } else if (selectedAccountType === "content_creator") {
      return data.specializations.length > 0
    }

    return false
  }

  return (
    <div className="space-y-8">
      {!selectedAccountType ? (
        <AccountTypeSelection
          onNext={() => {}} // We handle navigation here
          onPrev={onPrev}
          selectedAccountType={selectedAccountType}
          onAccountTypeSelect={onAccountTypeSelect}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {selectedAccountType === "film_crew"
                ? "Select Your Film Crew Roles"
                : "Choose Your Creative Specializations"}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {selectedAccountType === "film_crew"
                ? "Select the film and TV production roles that match your expertise. You can choose multiple roles."
                : "Pick the photography and videography specializations you offer. Select all that apply to your services."}
            </p>
          </div>

          {selectedAccountType === "film_crew" ? (
            <FilmCrewRoleSelection
              selectedRoles={data.selectedRoles}
              onRolesChange={(roles) => updateData({ selectedRoles: roles })}
            />
          ) : (
            <ContentCreatorSpecializationSelection
              selectedSpecializations={data.specializations}
              onSpecializationsChange={(specializations) => updateData({ specializations })}
            />
          )}

          {canProceed() && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center pt-8"
            >
              <Button
                onClick={onNext}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                Continue to Location & Availability
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-gray-500 text-sm mt-3">
                {selectedAccountType === "film_crew"
                  ? `${data.selectedRoles.length} role${data.selectedRoles.length !== 1 ? "s" : ""} selected`
                  : `${data.specializations.length} specialization${data.specializations.length !== 1 ? "s" : ""} selected`}
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  )
}
