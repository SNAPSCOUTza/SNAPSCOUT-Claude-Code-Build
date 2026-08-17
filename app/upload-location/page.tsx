"use client"

import { useEffect, useMemo, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Crown, Loader2, MapPin, Upload, ShieldCheck } from "lucide-react"
import {
  BATHROOM_ACCESS_OPTIONS,
  FOOD_NEARBY_OPTIONS,
  LOCATION_CITY_OPTIONS,
  LOCATION_PROVINCE_OPTIONS,
  LOCATION_TYPE_OPTIONS,
  POWER_ACCESS_OPTIONS,
} from "@/lib/locations/types"

export default function UploadLocationPage() {
  const { user } = useAuth()
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [canUpload, setCanUpload] = useState(false)

  const [photos, setPhotos] = useState<File[]>([])
  const [locationName, setLocationName] = useState("")
  const [locationDetails, setLocationDetails] = useState("")
  const [description, setDescription] = useState("")
  const [locationType, setLocationType] = useState("Studio")
  const [city, setCity] = useState("Cape Town")
  const [province, setProvince] = useState("Western Cape")
  const [safetyRating, setSafetyRating] = useState("Medium")
  const [securityLevel, setSecurityLevel] = useState("Standard")
  const [bestShootingTimes, setBestShootingTimes] = useState("Morning")
  const [parkingAvailability, setParkingAvailability] = useState("Limited")
  const [crowdLevels, setCrowdLevels] = useState("Moderate")
  const [indoorOutdoor, setIndoorOutdoor] = useState("Indoor")
  const [powerAccess, setPowerAccess] = useState("Unknown")
  const [bathroomAccess, setBathroomAccess] = useState("Unknown")
  const [foodNearby, setFoodNearby] = useState("Unknown")
  const [accessRules, setAccessRules] = useState("Permit required after 18:00")
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) {
      setCheckingAccess(false)
      return
    }

    let cancelled = false
    const supabase = createBrowserClient()

    supabase
      .from("user_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle()
      .then(({ data }: { data: { id: string } | null }) => {
        if (cancelled) return
        setCanUpload(Boolean(data))
        setCheckingAccess(false)
      })

    return () => {
      cancelled = true
    }
  }, [user])

  const photoPreviews = useMemo(
    () => photos.map((file) => ({ name: file.name, src: URL.createObjectURL(file) })),
    [photos],
  )

  const onFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (!fileList?.length) return
    setSaved(false)
    setPhotos(Array.from(fileList))
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setSaveError(null)

    try {
      const formData = new FormData()
      formData.append("name", locationName)
      formData.append("address", locationDetails)
      formData.append("description", description)
      formData.append("location_type", locationType)
      formData.append("city", city)
      formData.append("province", province)
      formData.append("safety_rating", safetyRating)
      formData.append("security_level", securityLevel)
      formData.append("best_shooting_times", bestShootingTimes)
      formData.append("parking_availability", parkingAvailability)
      formData.append("crowd_levels", crowdLevels)
      formData.append("indoor_outdoor", indoorOutdoor)
      formData.append("power_access", powerAccess)
      formData.append("bathroom_access", bathroomAccess)
      formData.append("food_nearby", foodNearby)
      formData.append("access_rules", accessRules)
      photos.forEach((file) => formData.append("photos", file))

      const response = await fetch("/api/locations", { method: "POST", body: formData })
      const result = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(result?.error || "Could not save this location")
      }

      setSaved(true)
      setPhotos([])
      setLocationName("")
      setLocationDetails("")
      setDescription("")
    } catch (error: any) {
      setSaveError(error?.message || "Could not save this location")
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <main className="min-h-[calc(100vh-110px)] bg-white py-8">
        <div className="container mx-auto max-w-3xl px-4">
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Upload Shoot Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Please sign in first to upload shoot locations.</p>
              <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  if (checkingAccess) {
    return (
      <main className="flex min-h-[calc(100vh-110px)] items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </main>
    )
  }

  if (!canUpload) {
    return (
      <main className="min-h-[calc(100vh-110px)] bg-white py-8">
        <div className="container mx-auto max-w-3xl px-4">
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl font-bold">
                <Crown className="h-6 w-6 text-red-600" />
                Premium Feature
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">Uploading shoot locations is available to active subscribers only.</p>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Creator Pro</Badge>
                <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">Studio / Store</Badge>
              </div>
              <Button asChild className="bg-red-600 hover:bg-red-700 text-white">
                <Link href="/subscribe/plans">Upgrade Plan</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[calc(100vh-110px)] bg-white py-8">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Upload Shoot Location</h1>
            <p className="mt-1 text-gray-600">
              Add discoverable locations for paid members with safety and production metadata.
            </p>
          </div>
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
            Premium Only
          </Badge>
        </div>

        <Card className="border border-gray-200">
          <CardContent className="p-6">
            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="photos">Upload photos</Label>
                <Input id="photos" type="file" accept="image/*" multiple onChange={onFilesSelected} />
              </div>

              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:col-span-2">
                  {photoPreviews.map((preview) => (
                    <div key={preview.name} className="overflow-hidden rounded-xl border border-gray-200">
                      <div className="relative aspect-[4/3] bg-gray-100">
                        <Image src={preview.src} alt={preview.name} fill className="object-cover" unoptimized />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="locationName">Location name</Label>
                <Input
                  id="locationName"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Urban Loft Studio"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="locationType">Location type</Label>
                <select
                  id="locationType"
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {LOCATION_TYPE_OPTIONS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.value}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <select
                  id="province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {LOCATION_PROVINCE_OPTIONS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <select
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {LOCATION_CITY_OPTIONS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="details">Location details</Label>
                <Input
                  id="details"
                  value={locationDetails}
                  onChange={(e) => setLocationDetails(e.target.value)}
                  placeholder="88 Sir Lowry Road, Woodstock, Cape Town"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the space, lighting conditions, noise levels, and production suitability."
                  className="min-h-28"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="safetyRating">Safety rating</Label>
                <select
                  id="safetyRating"
                  value={safetyRating}
                  onChange={(e) => setSafetyRating(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="securityLevel">Security level</Label>
                <select
                  id="securityLevel"
                  value={securityLevel}
                  onChange={(e) => setSecurityLevel(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option>Basic</option>
                  <option>Standard</option>
                  <option>High Security</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bestShootingTimes">Best shooting times</Label>
                <select
                  id="bestShootingTimes"
                  value={bestShootingTimes}
                  onChange={(e) => setBestShootingTimes(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option>Early Morning</option>
                  <option>Morning</option>
                  <option>Midday</option>
                  <option>Golden Hour</option>
                  <option>Night Shoots</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parkingAvailability">Parking availability</Label>
                <select
                  id="parkingAvailability"
                  value={parkingAvailability}
                  onChange={(e) => setParkingAvailability(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option>None</option>
                  <option>Limited</option>
                  <option>Ample</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="crowdLevels">Crowd levels</Label>
                <select
                  id="crowdLevels"
                  value={crowdLevels}
                  onChange={(e) => setCrowdLevels(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option>Quiet</option>
                  <option>Moderate</option>
                  <option>Busy</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="indoorOutdoor">Indoor / Outdoor</Label>
                <select
                  id="indoorOutdoor"
                  value={indoorOutdoor}
                  onChange={(e) => setIndoorOutdoor(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option>Indoor</option>
                  <option>Outdoor</option>
                  <option>Mixed</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="powerAccess">Power</Label>
                <select
                  id="powerAccess"
                  value={powerAccess}
                  onChange={(e) => setPowerAccess(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {POWER_ACCESS_OPTIONS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathroomAccess">Bathrooms</Label>
                <select
                  id="bathroomAccess"
                  value={bathroomAccess}
                  onChange={(e) => setBathroomAccess(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {BATHROOM_ACCESS_OPTIONS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="foodNearby">Food</Label>
                <select
                  id="foodNearby"
                  value={foodNearby}
                  onChange={(e) => setFoodNearby(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {FOOD_NEARBY_OPTIONS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="accessRules">Access rules</Label>
                <select
                  id="accessRules"
                  value={accessRules}
                  onChange={(e) => setAccessRules(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option>Open access during business hours</option>
                  <option>Permit required after 18:00</option>
                  <option>Pre-approval required for all shoots</option>
                  <option>Escort required on site</option>
                  <option>Members-only access</option>
                </select>
              </div>

              {saveError && (
                <div className="md:col-span-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{saveError}</div>
              )}

              <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-2">
                <Button type="submit" disabled={saving} className="bg-red-600 hover:bg-red-700 text-white">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  {saving ? "Saving..." : "Publish Location"}
                </Button>
                {saved && (
                  <p className="text-sm text-emerald-700">
                    Location published.{" "}
                    <Link href="/locations" className="font-semibold underline">
                      View it on the Locations page
                    </Link>
                    .
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-red-600" />
              Discoverability Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>Uploaded shoot locations go live on the Locations page immediately for everyone to browse.</p>
            <p>Only accounts with an active subscription can publish a new location listing.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
