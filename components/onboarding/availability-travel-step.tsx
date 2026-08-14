"use client"

import type React from "react"

// TypeScript interface for better type safety
interface AvailabilityTravelData {
  availabilityStatus?: string
  travelWillingness?: string
  remoteCapable?: boolean
  maxTravelDistance?: string
  availableStartDate?: string
  weekendWork?: boolean
}

interface AvailabilityTravelStepProps {
  onUpdate?: (data: AvailabilityTravelData) => void
  data?: AvailabilityTravelData
  onNext?: () => void
  onPrevious?: () => void
}

const AvailabilityTravelStep: React.FC<AvailabilityTravelStepProps> = ({ onUpdate, data = {}, onNext, onPrevious }) => {
  const handleUpdate = (field: keyof AvailabilityTravelData, value: any) => {
    try {
      // Validate that onUpdate exists and is a function
      if (typeof onUpdate !== "function") {
        console.warn("AvailabilityTravelStep: onUpdate prop is not a function or is undefined")
        return
      }

      const updatedData = {
        ...data,
        [field]: value,
      }

      console.log(`AvailabilityTravelStep: Updating ${field} with value:`, value)
      onUpdate(updatedData)
    } catch (error) {
      console.error("AvailabilityTravelStep: Error in handleUpdate:", error)
    }
  }

  const isFormValid = () => {
    return data.availabilityStatus && data.travelWillingness
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Availability & Travel</h2>
        <p className="text-gray-600 mb-6">Let clients know when you're available and how far you'll travel</p>
      </div>

      {/* Availability Status */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Availability Status <span className="text-red-500">*</span>
        </label>
        <select
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          value={data.availabilityStatus || ""}
          onChange={(e) => handleUpdate("availabilityStatus", e.target.value)}
        >
          <option value="">Select availability</option>
          <option value="available">Available Now</option>
          <option value="busy">Currently Busy</option>
          <option value="booking_ahead">Booking in Advance</option>
        </select>
      </div>

      {/* Available Start Date */}
      {data.availabilityStatus === "booking_ahead" && (
        <div>
          <label className="block text-sm font-medium mb-2">Available From</label>
          <input
            type="date"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={data.availableStartDate || ""}
            onChange={(e) => handleUpdate("availableStartDate", e.target.value)}
          />
        </div>
      )}

      {/* Travel Willingness */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Travel Willingness <span className="text-red-500">*</span>
        </label>
        <select
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          value={data.travelWillingness || ""}
          onChange={(e) => handleUpdate("travelWillingness", e.target.value)}
        >
          <option value="">Select travel preference</option>
          <option value="local">Local Only (within 50km)</option>
          <option value="provincial">Within Province</option>
          <option value="national">Nationwide</option>
          <option value="international">International</option>
        </select>
      </div>

      {/* Max Travel Distance */}
      {data.travelWillingness === "local" && (
        <div>
          <label className="block text-sm font-medium mb-2">Maximum Travel Distance</label>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            value={data.maxTravelDistance || ""}
            onChange={(e) => handleUpdate("maxTravelDistance", e.target.value)}
          >
            <option value="">Select distance</option>
            <option value="10km">Within 10km</option>
            <option value="25km">Within 25km</option>
            <option value="50km">Within 50km</option>
            <option value="100km">Within 100km</option>
          </select>
        </div>
      )}

      {/* Work Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Work Preferences</h3>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="remoteCapable"
            checked={data.remoteCapable || false}
            onChange={(e) => handleUpdate("remoteCapable", e.target.checked)}
            className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          />
          <label htmlFor="remoteCapable" className="text-sm font-medium">
            I can work remotely (editing, post-production, consultations)
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="weekendWork"
            checked={data.weekendWork || false}
            onChange={(e) => handleUpdate("weekendWork", e.target.checked)}
            className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          />
          <label htmlFor="weekendWork" className="text-sm font-medium">
            Available for weekend work
          </label>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <button
          type="button"
          onClick={() => {
            if (typeof onPrevious === "function") {
              onPrevious()
            } else {
              console.warn("AvailabilityTravelStep: onPrevious prop is not a function")
            }
          }}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>

        <button
          type="button"
          onClick={() => {
            if (typeof onNext === "function") {
              if (isFormValid()) {
                onNext()
              } else {
                alert("Please fill in all required fields before continuing.")
              }
            } else {
              console.warn("AvailabilityTravelStep: onNext prop is not a function")
            }
          }}
          disabled={!isFormValid()}
          className={`px-6 py-2 rounded-lg transition-colors ${
            isFormValid() ? "bg-red-600 text-white hover:bg-red-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Next Step
        </button>
      </div>
    </div>
  )
}

export default AvailabilityTravelStep
