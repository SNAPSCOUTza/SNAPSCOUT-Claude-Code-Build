"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Camera, Video, Film, Users, Search, Check, Lightbulb, Eye } from "lucide-react"
import {
  PHOTOGRAPHY_SPECIALIZATIONS,
  VIDEOGRAPHY_SPECIALIZATIONS,
  FILM_CREW_ROLES,
  type AccountType,
} from "@/types/onboarding"

interface RoleManagementModalProps {
  isOpen: boolean
  onClose: () => void
  currentAccountType: AccountType
  currentRoles: string[]
  currentSpecializations: string[]
  onSave: (data: {
    accountType: AccountType
    roles: string[]
    specializations: string[]
  }) => void
}

export default function RoleManagementModal({
  isOpen,
  onClose,
  currentAccountType,
  currentRoles,
  currentSpecializations,
  onSave,
}: RoleManagementModalProps) {
  const [accountType, setAccountType] = useState<AccountType>(currentAccountType)
  const [selectedRoles, setSelectedRoles] = useState<string[]>(currentRoles)
  const [selectedSpecializations, setSelectedSpecializations] = useState<string[]>(currentSpecializations)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAccountTypeConfirm, setShowAccountTypeConfirm] = useState(false)
  const [pendingAccountType, setPendingAccountType] = useState<AccountType | null>(null)

  const handleAccountTypeChange = (newType: AccountType) => {
    if (newType !== accountType) {
      setPendingAccountType(newType)
      setShowAccountTypeConfirm(true)
    }
  }

  const confirmAccountTypeChange = () => {
    if (pendingAccountType) {
      setAccountType(pendingAccountType)
      setSelectedRoles([])
      setSelectedSpecializations([])
      setShowAccountTypeConfirm(false)
      setPendingAccountType(null)
    }
  }

  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) => (prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]))
  }

  const toggleSpecialization = (specializationId: string) => {
    setSelectedSpecializations((prev) =>
      prev.includes(specializationId) ? prev.filter((id) => id !== specializationId) : [...prev, specializationId],
    )
  }

  const selectAllInCategory = (category: "photography" | "videography" | "film_crew") => {
    if (category === "photography") {
      const photographyIds = PHOTOGRAPHY_SPECIALIZATIONS.map((spec) => spec.id)
      setSelectedSpecializations((prev) => [...new Set([...prev, ...photographyIds])])
    } else if (category === "videography") {
      const videographyIds = VIDEOGRAPHY_SPECIALIZATIONS.map((spec) => spec.id)
      setSelectedSpecializations((prev) => [...new Set([...prev, ...videographyIds])])
    } else if (category === "film_crew") {
      const filmCrewIds = FILM_CREW_ROLES.map((role) => role.id)
      setSelectedRoles((prev) => [...new Set([...prev, ...filmCrewIds])])
    }
  }

  const clearCategory = (category: "photography" | "videography" | "film_crew") => {
    if (category === "photography") {
      const photographyIds = PHOTOGRAPHY_SPECIALIZATIONS.map((spec) => spec.id)
      setSelectedSpecializations((prev) => prev.filter((id) => !photographyIds.includes(id)))
    } else if (category === "videography") {
      const videographyIds = VIDEOGRAPHY_SPECIALIZATIONS.map((spec) => spec.id)
      setSelectedSpecializations((prev) => prev.filter((id) => !videographyIds.includes(id)))
    } else if (category === "film_crew") {
      const filmCrewIds = FILM_CREW_ROLES.map((role) => role.id)
      setSelectedRoles((prev) => prev.filter((id) => !filmCrewIds.includes(id)))
    }
  }

  const getFilteredItems = () => {
    if (accountType === "film_crew") {
      return FILM_CREW_ROLES.filter(
        (role) =>
          role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          role.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
          role.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    } else {
      const allSpecs = [...PHOTOGRAPHY_SPECIALIZATIONS, ...VIDEOGRAPHY_SPECIALIZATIONS]
      return allSpecs.filter(
        (spec) =>
          spec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          spec.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
  }

  const getSuggestions = () => {
    // Simple suggestion logic based on current selections
    if (accountType === "content_creator") {
      const hasPhotography = selectedSpecializations.some((id) =>
        PHOTOGRAPHY_SPECIALIZATIONS.some((spec) => spec.id === id),
      )
      const hasVideography = selectedSpecializations.some((id) =>
        VIDEOGRAPHY_SPECIALIZATIONS.some((spec) => spec.id === id),
      )

      if (hasPhotography && !hasVideography) {
        return VIDEOGRAPHY_SPECIALIZATIONS.slice(0, 3).map((spec) => spec.id)
      } else if (hasVideography && !hasPhotography) {
        return PHOTOGRAPHY_SPECIALIZATIONS.slice(0, 3).map((spec) => spec.id)
      }
    }
    return []
  }

  const handleSave = () => {
    onSave({
      accountType,
      roles: selectedRoles,
      specializations: selectedSpecializations,
    })
    onClose()
  }

  const suggestions = getSuggestions()

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Manage Your Roles & Specializations</span>
            </DialogTitle>
            <DialogDescription>
              Update your professional roles and specializations to better match with relevant opportunities.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <Button
                    variant={accountType === "film_crew" ? "default" : "outline"}
                    onClick={() => handleAccountTypeChange("film_crew")}
                    className={`h-32 flex flex-col items-center justify-center space-y-2 ${
                      accountType === "film_crew"
                        ? "bg-primary text-primary-foreground"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    <Film className="w-8 h-8" />
                    <span className="text-lg font-medium">Film Crew</span>
                    <span className="text-xs opacity-80">Work on productions</span>
                  </Button>

                  <Button
                    variant={accountType === "content_creator" ? "default" : "outline"}
                    onClick={() => handleAccountTypeChange("content_creator")}
                    className={`h-32 flex flex-col items-center justify-center space-y-2 ${
                      accountType === "content_creator"
                        ? "bg-primary text-primary-foreground"
                        : "border-border hover:bg-accent"
                    }`}
                  >
                    <Camera className="w-8 h-8" />
                    <span className="text-lg font-medium">Creator</span>
                    <span className="text-xs opacity-80">Create content</span>
                  </Button>

                  <Button
                    variant={accountType === "studio" ? "default" : "outline"}
                    onClick={() => handleAccountTypeChange("studio")}
                    className={`h-32 flex flex-col items-center justify-center space-y-2 ${
                      accountType === "studio" ? "bg-primary text-primary-foreground" : "border-border hover:bg-accent"
                    }`}
                  >
                    <Film className="w-8 h-8" />
                    <span className="text-lg font-medium">Studio</span>
                    <span className="text-xs opacity-80">Hire talent</span>
                  </Button>

                  <Button
                    variant={accountType === "store" ? "default" : "outline"}
                    onClick={() => handleAccountTypeChange("store")}
                    className={`h-32 flex flex-col items-center justify-center space-y-2 ${
                      accountType === "store" ? "bg-primary text-primary-foreground" : "border-border hover:bg-accent"
                    }`}
                  >
                    <Users className="w-8 h-8" />
                    <span className="text-lg font-medium">Store</span>
                    <span className="text-xs opacity-80">Sell equipment</span>
                  </Button>

                  <Button
                    variant={accountType === "scout" ? "default" : "outline"}
                    onClick={() => handleAccountTypeChange("scout")}
                    className={`h-32 flex flex-col items-center justify-center space-y-2 ${
                      accountType === "scout" ? "bg-primary text-primary-foreground" : "border-border hover:bg-accent"
                    }`}
                  >
                    <Search className="w-8 h-8" />
                    <span className="text-lg font-medium">Scout</span>
                    <span className="text-xs opacity-80">Browse talent</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Search - Only show for Crew/Creator */}
            {(accountType === "film_crew" || accountType === "content_creator") && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={`Search ${accountType === "film_crew" ? "roles" : "specializations"}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center space-x-2 text-blue-800">
                    <Lightbulb className="w-4 h-4" />
                    <span>Suggested for You</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((id) => {
                      const spec = [...PHOTOGRAPHY_SPECIALIZATIONS, ...VIDEOGRAPHY_SPECIALIZATIONS].find(
                        (s) => s.id === id,
                      )
                      if (!spec) return null

                      return (
                        <Button
                          key={id}
                          variant="outline"
                          size="sm"
                          onClick={() => toggleSpecialization(id)}
                          className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                          <span className="mr-2">{spec.icon}</span>
                          {spec.name}
                        </Button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Role/Specialization Selection */}
            {accountType === "film_crew" ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Film className="w-5 h-5" />
                      <span>Film Crew Roles ({selectedRoles.length})</span>
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => selectAllInCategory("film_crew")}>
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => clearCategory("film_crew")}>
                        Clear All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {getFilteredItems().map((role: any) => {
                      const isSelected = selectedRoles.includes(role.id)
                      return (
                        <Card
                          key={role.id}
                          className={`cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? "border-primary bg-accent ring-2 ring-primary/20"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => toggleRole(role.id)}
                        >
                          <CardContent className="p-3 text-center">
                            <div className="text-lg mb-2">{role.icon}</div>
                            <h4 className="font-medium text-sm">{role.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{role.description}</p>
                            <Badge variant="outline" className="mt-2 text-xs">
                              {role.department}
                            </Badge>
                            {isSelected && (
                              <div className="mt-2">
                                <Badge className="bg-primary text-primary-foreground">
                                  <Check className="w-3 h-3 mr-1" />
                                  Selected
                                </Badge>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : accountType === "content_creator" ? (
              <div className="space-y-6">
                {/* Photography Specializations */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Camera className="w-5 h-5 text-blue-600" />
                        <span>
                          Photography Specializations (
                          {
                            selectedSpecializations.filter((id) =>
                              PHOTOGRAPHY_SPECIALIZATIONS.some((spec) => spec.id === id),
                            ).length
                          }
                          )
                        </span>
                      </CardTitle>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => selectAllInCategory("photography")}
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          Select All
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => clearCategory("photography")}>
                          Clear
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {PHOTOGRAPHY_SPECIALIZATIONS.filter(
                        (spec) =>
                          spec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          spec.description.toLowerCase().includes(searchTerm.toLowerCase()),
                      ).map((spec) => {
                        const isSelected = selectedSpecializations.includes(spec.id)
                        return (
                          <Card
                            key={spec.id}
                            className={`cursor-pointer transition-all duration-200 ${
                              isSelected
                                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                                : "border-gray-200 hover:border-blue-300"
                            }`}
                            onClick={() => toggleSpecialization(spec.id)}
                          >
                            <CardContent className="p-3 text-center">
                              <div className="text-lg mb-2">{spec.icon}</div>
                              <h4 className="font-medium text-sm">{spec.name}</h4>
                              <p className="text-xs text-gray-600 mt-1">{spec.description}</p>
                              {isSelected && (
                                <div className="mt-2">
                                  <Badge className="bg-blue-500 text-white">
                                    <Check className="w-3 h-3 mr-1" />
                                    Selected
                                  </Badge>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Videography Specializations */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Video className="w-5 h-5 text-red-600" />
                        <span>
                          Videography Specializations (
                          {
                            selectedSpecializations.filter((id) =>
                              VIDEOGRAPHY_SPECIALIZATIONS.some((spec) => spec.id === id),
                            ).length
                          }
                          )
                        </span>
                      </CardTitle>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => selectAllInCategory("videography")}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          Select All
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => clearCategory("videography")}>
                          Clear
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {VIDEOGRAPHY_SPECIALIZATIONS.filter(
                        (spec) =>
                          spec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          spec.description.toLowerCase().includes(searchTerm.toLowerCase()),
                      ).map((spec) => {
                        const isSelected = selectedSpecializations.includes(spec.id)
                        return (
                          <Card
                            key={spec.id}
                            className={`cursor-pointer transition-all duration-200 ${
                              isSelected
                                ? "border-red-500 bg-red-50 ring-2 ring-red-200"
                                : "border-gray-200 hover:border-red-300"
                            }`}
                            onClick={() => toggleSpecialization(spec.id)}
                          >
                            <CardContent className="p-3 text-center">
                              <div className="text-lg mb-2">{spec.icon}</div>
                              <h4 className="font-medium text-sm">{spec.name}</h4>
                              <p className="text-xs text-gray-600 mt-1">{spec.description}</p>
                              {isSelected && (
                                <div className="mt-2">
                                  <Badge className="bg-red-500 text-white">
                                    <Check className="w-3 h-3 mr-1" />
                                    Selected
                                  </Badge>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : accountType === "studio" || accountType === "store" ? (
              <Card className="border-primary/20 bg-accent">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-foreground">
                    {accountType === "studio" ? <Film className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                    <span>{accountType === "studio" ? "Studio" : "Store"} Account Features</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-primary/10 rounded-full text-primary mt-1">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Free Browsing</h4>
                      <p className="text-sm text-muted-foreground">
                        Browse unlimited profiles of film crew and creators without a subscription.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-primary/10 rounded-full text-primary mt-1">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Hire Talent</h4>
                      <p className="text-sm text-muted-foreground">
                        Contact and hire professionals directly for your projects.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-primary/10 rounded-full text-primary mt-1">
                      <Eye className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">
                        {accountType === "studio" ? "Studio Profile" : "Store Listing"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {accountType === "studio"
                          ? "Create a public studio profile to attract clients and showcase your facilities."
                          : "List your store and products to reach filmmakers and creators."}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              // Scout Info Card
              <Card className="border-primary/20 bg-accent">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-foreground">
                    <Search className="w-5 h-5" />
                    <span>Scout Account Features</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-primary/10 rounded-full text-primary mt-1">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Free Browsing</h4>
                      <p className="text-sm text-muted-foreground">
                        Browse unlimited profiles of film crew and creators without a subscription.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-primary/10 rounded-full text-primary mt-1">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Hire Talent</h4>
                      <p className="text-sm text-muted-foreground">
                        Contact and hire professionals directly for your projects.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-primary/10 rounded-full text-primary mt-1">
                      <Eye className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">Private Profile</h4>
                      <p className="text-sm text-muted-foreground">
                        Your profile will not be listed in public directories since you are hiring, not looking for
                        work.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-primary hover:bg-primary/90"
                disabled={
                  (accountType === "film_crew" && selectedRoles.length === 0) ||
                  (accountType === "content_creator" && selectedSpecializations.length === 0)
                }
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showAccountTypeConfirm} onOpenChange={setShowAccountTypeConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Account Type?</AlertDialogTitle>
            <AlertDialogDescription>
              Switching to{" "}
              <strong>
                {pendingAccountType === "film_crew"
                  ? "Film Crew"
                  : pendingAccountType === "content_creator"
                    ? "Creator"
                    : pendingAccountType === "studio"
                      ? "Studio"
                      : pendingAccountType === "store"
                        ? "Store"
                        : "Scout"}
              </strong>{" "}
              will clear your currently selected roles and specializations.
              {pendingAccountType === "scout" && (
                <div className="mt-2 p-2 bg-accent text-foreground rounded text-sm border border-border">
                  Note: Switching to Scout account will remove your profile from public search results and you won't
                  need a subscription.
                </div>
              )}
              {(pendingAccountType === "studio" || pendingAccountType === "store") && (
                <div className="mt-2 p-2 bg-accent text-foreground rounded text-sm border border-border">
                  Note: {pendingAccountType === "studio" ? "Studios" : "Stores"} can browse and hire talent for free. No
                  subscription required.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowAccountTypeConfirm(false)
                setPendingAccountType(null)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmAccountTypeChange} className="bg-primary hover:bg-primary/90">
              Confirm Change
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
