"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { FILM_CREW_ROLES } from "@/types/onboarding"

interface FilmCrewRoleSelectionProps {
  selectedRoles: string[]
  onRolesChange: (roles: string[]) => void
}

export default function FilmCrewRoleSelection({ selectedRoles, onRolesChange }: FilmCrewRoleSelectionProps) {
  const toggleRole = (roleId: string) => {
    const isSelected = selectedRoles.includes(roleId)
    if (isSelected) {
      onRolesChange(selectedRoles.filter((id) => id !== roleId))
    } else {
      onRolesChange([...selectedRoles, roleId])
    }
  }

  const selectAllRoles = () => {
    const allRoleIds = FILM_CREW_ROLES.map((role) => role.id)
    onRolesChange(allRoleIds)
  }

  const clearAllRoles = () => {
    onRolesChange([])
  }

  // Group roles by department
  const rolesByDepartment = FILM_CREW_ROLES.reduce(
    (acc, role) => {
      if (!acc[role.department]) {
        acc[role.department] = []
      }
      acc[role.department].push(role)
      return acc
    },
    {} as Record<string, typeof FILM_CREW_ROLES>,
  )

  return (
    <div className="space-y-8">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Film & TV Production Roles</h3>
          <p className="text-gray-600 text-sm">
            {selectedRoles.length} of {FILM_CREW_ROLES.length} roles selected
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={selectAllRoles}
            className="text-slate-600 border-slate-200 hover:bg-slate-50 bg-transparent"
          >
            Select All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllRoles}
            className="text-gray-600 border-gray-200 hover:bg-gray-50 bg-transparent"
          >
            Clear All
          </Button>
        </div>
      </div>

      {/* Roles grouped by department */}
      <div className="space-y-8">
        {Object.entries(rolesByDepartment).map(([department, roles], departmentIndex) => (
          <motion.div
            key={department}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: departmentIndex * 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                <span className="text-slate-700 font-semibold text-sm">
                  {roles.filter((role) => selectedRoles.includes(role.id)).length}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{department}</h4>
                <p className="text-gray-600 text-sm">
                  {roles.filter((role) => selectedRoles.includes(role.id)).length} of {roles.length} selected
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map((role, roleIndex) => {
                const isSelected = selectedRoles.includes(role.id)

                return (
                  <motion.div
                    key={role.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: roleIndex * 0.05 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                        isSelected
                          ? "border-slate-500 bg-slate-50 shadow-md ring-2 ring-slate-200"
                          : "border-gray-200 bg-white hover:border-slate-300"
                      }`}
                      onClick={() => toggleRole(role.id)}
                    >
                      <CardContent className="p-4 text-center space-y-3">
                        <div className="text-2xl">{role.icon}</div>
                        <div>
                          <h5 className="font-semibold text-gray-900 text-sm">{role.name}</h5>
                          <p className="text-gray-600 text-xs mt-1">{role.description}</p>
                        </div>
                        {isSelected && (
                          <div className="flex justify-center">
                            <Badge className="bg-slate-600 text-white border-slate-600">
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
        ))}
      </div>

      {/* Selection Summary */}
      {selectedRoles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-50 rounded-lg p-6 text-center"
        >
          <h4 className="font-semibold text-gray-900 mb-2">Your Selected Roles</h4>
          <p className="text-gray-600 text-sm mb-4">
            You've selected {selectedRoles.length} role{selectedRoles.length !== 1 ? "s" : ""} across{" "}
            {
              Object.keys(rolesByDepartment).filter((dept) =>
                rolesByDepartment[dept].some((role) => selectedRoles.includes(role.id)),
              ).length
            }{" "}
            department{Object.keys(rolesByDepartment).length !== 1 ? "s" : ""}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {selectedRoles.slice(0, 6).map((id) => {
              const role = FILM_CREW_ROLES.find((r) => r.id === id)
              return (
                <Badge key={id} variant="secondary" className="text-xs">
                  {role?.name}
                </Badge>
              )
            })}
            {selectedRoles.length > 6 && (
              <Badge variant="secondary" className="text-xs">
                +{selectedRoles.length - 6} more
              </Badge>
            )}
          </div>
        </motion.div>
      )}
    </div>
  )
}
