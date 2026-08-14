"use client"

import type React from "react"
import { useState } from "react"
import AvailabilityTravelStep from "./availability-travel-step"

interface OnboardingData {
  availabilityStatus?: string
  travelWillingness?: string
  remoteCapable?: boolean
  maxTravelDistance?: string
  availableStartDate?: string
  weekendWork?: boolean
}

const AvailabilityTravelStepExample: React.FC = () => {
  const [formData, setFormData] = useState<OnboardingData>({})
  const [currentStep, setCurrentStep] = useState(1)

  const handleUpdate = (data: OnboardingData) => {
    console.log("Parent: Received updated data:", data)
    setFormData(data)
  }

  const handleNext = () => {
    console.log("Parent: Moving to next step")
    setCurrentStep((prev) => prev + 1)
  }

  const handlePrevious = () => {
    console.log("Parent: Moving to previous step")
    setCurrentStep((prev) => prev - 1)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Onboarding Example</h1>
        <p className="text-gray-600">Step {currentStep} of 5</p>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
          <div
            className="bg-red-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>
      </div>

      {currentStep === 1 && (
        <AvailabilityTravelStep
          data={formData}
          onUpdate={handleUpdate}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}

      {currentStep === 2 && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Next Step</h2>
          <p className="text-gray-600 mb-6">This would be the next onboarding step</p>
          <button onClick={handlePrevious} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Back to Availability Step
          </button>
        </div>
      )}

      {/* Debug info */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Current Form Data:</h3>
        <pre className="text-sm overflow-auto">{JSON.stringify(formData, null, 2)}</pre>
      </div>
    </div>
  )
}

export default AvailabilityTravelStepExample
