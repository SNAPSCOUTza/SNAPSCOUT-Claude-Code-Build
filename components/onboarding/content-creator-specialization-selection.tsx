"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Camera, Video, Check } from "lucide-react"
import { PHOTOGRAPHY_SPECIALIZATIONS, VIDEOGRAPHY_SPECIALIZATIONS } from "@/types/onboarding"
import { useState } from "react"

interface ContentCreatorSpecializationSelectionProps {
  selectedSpecializations: string[]
  onSpecializationsChange: (specializations: string[]) => void
}

export default function ContentCreatorSpecializationSelection({
  selectedSpecializations,
  onSpecializationsChange,
}: ContentCreatorSpecializationSelectionProps) {
  const [activeCategory, setActiveCategory] = useState<"photography" | "videography" | "both">("both")

  const toggleSpecialization = (specializationId: string) => {
    const isSelected = selectedSpecializations.includes(specializationId)
    if (isSelected) {
      onSpecializationsChange(selectedSpecializations.filter((id) => id !== specializationId))
    } else {
      onSpecializationsChange([...selectedSpecializations, specializationId])
    }
  }

  const selectAllInCategory = (category: "photography" | "videography") => {
    const categorySpecializations =
      category === "photography" ? PHOTOGRAPHY_SPECIALIZATIONS : VIDEOGRAPHY_SPECIALIZATIONS
    const categoryIds = categorySpecializations.map((spec) => spec.id)
    const newSelections = [...new Set([...selectedSpecializations, ...categoryIds])]
    onSpecializationsChange(newSelections)
  }

  const clearCategory = (category: "photography" | "videography") => {
    const categorySpecializations =
      category === "photography" ? PHOTOGRAPHY_SPECIALIZATIONS : VIDEOGRAPHY_SPECIALIZATIONS
    const categoryIds = categorySpecializations.map((spec) => spec.id)
    const newSelections = selectedSpecializations.filter((id) => !categoryIds.includes(id))
    onSpecializationsChange(newSelections)
  }

  const photographyCount = selectedSpecializations.filter((id) =>
    PHOTOGRAPHY_SPECIALIZATIONS.some((spec) => spec.id === id),
  ).length

  const videographyCount = selectedSpecializations.filter((id) =>
    VIDEOGRAPHY_SPECIALIZATIONS.some((spec) => spec.id === id),
  ).length

  const filteredPhotographySpecs = activeCategory === "videography" ? [] : PHOTOGRAPHY_SPECIALIZATIONS
  const filteredVideographySpecs = activeCategory === "photography" ? [] : VIDEOGRAPHY_SPECIALIZATIONS

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-lg flex space-x-1">
          <Button
            variant={activeCategory === "both" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveCategory("both")}
            className={activeCategory === "both" ? "bg-red-600 text-white" : "text-gray-600"}
          >
            Both Categories
          </Button>
          <Button
            variant={activeCategory === "photography" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveCategory("photography")}
            className={activeCategory === "photography" ? "bg-red-600 text-white" : "text-gray-600"}
          >
            <Camera className="w-4 h-4 mr-2" />
            Photography ({photographyCount})
          </Button>
          <Button
            variant={activeCategory === "videography" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveCategory("videography")}
            className={activeCategory === "videography" ? "bg-red-600 text-white" : "text-gray-600"}
          >
            <Video className="w-4 h-4 mr-2" />
            Videography ({videographyCount})
          </Button>
        </div>
      </div>

      {/* Photography Specializations */}
      {filteredPhotographySpecs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Camera className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Photography Specializations</h3>
                <p className="text-gray-600 text-sm">
                  {photographyCount} of {PHOTOGRAPHY_SPECIALIZATIONS.length} selected
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectAllInCategory("photography")}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearCategory("photography")}
                className="text-gray-600 border-gray-200 hover:bg-gray-50"
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PHOTOGRAPHY_SPECIALIZATIONS.map((specialization, index) => {
              const isSelected = selectedSpecializations.includes(specialization.id)

              return (
                <motion.div
                  key={specialization.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200"
                        : "border-gray-200 bg-white hover:border-blue-300"
                    }`}
                    onClick={() => toggleSpecialization(specialization.id)}
                  >
                    <CardContent className="p-4 text-center space-y-3">
                      <div className="text-2xl">{specialization.icon}</div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{specialization.name}</h4>
                        <p className="text-gray-600 text-xs mt-1">{specialization.description}</p>
                      </div>
                      {isSelected && (
                        <div className="flex justify-center">
                          <Badge className="bg-blue-500 text-white border-blue-500">
                            <Check className="w-3 h-3 mr-1" />
                            Selected
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Videography Specializations */}
      {filteredVideographySpecs.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Video className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Videography Specializations</h3>
                <p className="text-gray-600 text-sm">
                  {videographyCount} of {VIDEOGRAPHY_SPECIALIZATIONS.length} selected
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => selectAllInCategory("videography")}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearCategory("videography")}
                className="text-gray-600 border-gray-200 hover:bg-gray-50"
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {VIDEOGRAPHY_SPECIALIZATIONS.map((specialization, index) => {
              const isSelected = selectedSpecializations.includes(specialization.id)

              return (
                <motion.div
                  key={specialization.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                      isSelected
                        ? "border-red-500 bg-red-50 shadow-md ring-2 ring-red-200"
                        : "border-gray-200 bg-white hover:border-red-300"
                    }`}
                    onClick={() => toggleSpecialization(specialization.id)}
                  >
                    <CardContent className="p-4 text-center space-y-3">
                      <div className="text-2xl">{specialization.icon}</div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{specialization.name}</h4>
                        <p className="text-gray-600 text-xs mt-1">{specialization.description}</p>
                      </div>
                      {isSelected && (
                        <div className="flex justify-center">
                          <Badge className="bg-red-500 text-white border-red-500">
                            <Check className="w-3 h-3 mr-1" />
                            Selected
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Selection Summary */}
      {selectedSpecializations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-50 rounded-lg p-6 text-center"
        >
          <h4 className="font-semibold text-gray-900 mb-2">Your Selected Specializations</h4>
          <p className="text-gray-600 text-sm mb-4">
            You've selected {selectedSpecializations.length} specialization
            {selectedSpecializations.length !== 1 ? "s" : ""} across{" "}
            {photographyCount > 0 && videographyCount > 0
              ? "both photography and videography"
              : photographyCount > 0
                ? "photography"
                : "videography"}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {selectedSpecializations.slice(0, 6).map((id) => {
              const spec = [...PHOTOGRAPHY_SPECIALIZATIONS, ...VIDEOGRAPHY_SPECIALIZATIONS].find((s) => s.id === id)
              return (
                <Badge key={id} variant="secondary" className="text-xs">
                  {spec?.name}
                </Badge>
              )
            })}
            {selectedSpecializations.length > 6 && (
              <Badge variant="secondary" className="text-xs">
                +{selectedSpecializations.length - 6} more
              </Badge>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
