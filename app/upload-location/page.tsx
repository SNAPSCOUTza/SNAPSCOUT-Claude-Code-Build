"use client"

import { useEffect, useMemo, useState } from "react"
import type { ChangeEvent, FormEvent } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { createBrowserClient } from "@/lib/supabase/client"
import MobileShell from "@/components/mobile/mobile-shell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Crown, ImagePlus, Loader2, MapPin, ShieldCheck, Sparkles, X } from "lucide-react"
import {
  BATHROOM_ACCESS_OPTIONS,
  FOOD_NEARBY_OPTIONS,
  LOCATION_CITY_OPTIONS,
  LOCATION_PROVINCE_OPTIONS,
  LOCATION_TYPE_OPTIONS,
  POWER_ACCESS_OPTIONS,
} from "@/lib/locations/types"

const fieldClass =
  "mt-2 h-12 w-full rounded-2xl border-[#e6ebf3] bg-white px-4 text-[15px] text-[#111318] shadow-none focus-visible:ring-[#f20d14]"

function FieldSelect({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (value: string) => void
  options: string[]
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={fieldClass}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export default function UploadLocationPage() {
  const { user } = useAuth()
  const router = useRouter()
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
    () => photos.map((file, index) => ({ index, name: file.name, src: URL.createObjectURL(file) })),
    [photos],
  )

  const onFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (!fileList?.length) return
    setSaved(false)
    setPhotos((current) => [...current, ...Array.from(fileList)])
    event.target.value = ""
  }

  const removePhoto = (index: number) => {
    setPhotos((current) => current.filter((_, i) => i !== index))
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
      <MobileShell title="Upload Location">
        <div className="px-4 pb-10 pt-6 md:mx-auto md:max-w-xl md:px-8">
          <div className="rounded-[32px] border border-[#eee6db] bg-white px-6 py-10 text-center shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff0f0] text-[#f20d14]">
              <MapPin className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-[22px] font-black tracking-[-0.02em] text-[#111318]">Sign in to upload</h1>
            <p className="mt-2 text-[14px] leading-relaxed text-[#6d7480]">
              Sign in first so we can confirm your subscription before you publish a location.
            </p>
            <Button asChild className="mt-6 h-12 w-full rounded-full bg-[#f20d14] text-[15px] font-semibold text-white hover:bg-[#d80a10]">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </MobileShell>
    )
  }

  if (checkingAccess) {
    return (
      <MobileShell title="Upload Location">
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#f20d14]" />
        </div>
      </MobileShell>
    )
  }

  if (!canUpload) {
    return (
      <MobileShell title="Upload Location">
        <div className="px-4 pb-10 pt-6 md:mx-auto md:max-w-xl md:px-8">
          <div className="rounded-[32px] border border-[#eee6db] bg-white px-6 py-10 text-center shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fff0f0] text-[#f20d14]">
              <Crown className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-[22px] font-black tracking-[-0.02em] text-[#111318]">Premium feature</h1>
            <p className="mt-2 text-[14px] leading-relaxed text-[#6d7480]">
              Uploading shoot locations is available to active Creator, Crew, Studio, or Store subscribers only.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Badge className="rounded-full bg-[#fff0f0] px-3 py-1 text-[12px] font-semibold text-[#f20d14] hover:bg-[#fff0f0]">
                Creator / Crew
              </Badge>
              <Badge className="rounded-full bg-[#f3eefc] px-3 py-1 text-[12px] font-semibold text-[#7c4fd1] hover:bg-[#f3eefc]">
                Studio / Store
              </Badge>
            </div>
            <Button asChild className="mt-6 h-12 w-full rounded-full bg-[#f20d14] text-[15px] font-semibold text-white hover:bg-[#d80a10]">
              <Link href="/subscribe/plans">Upgrade Plan</Link>
            </Button>
          </div>
        </div>
      </MobileShell>
    )
  }

  return (
    <MobileShell title="Upload Location">
      <div className="px-4 pb-12 pt-6 md:mx-auto md:max-w-3xl md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.2em] text-[#f20d14]">Share a Scout</p>
            <h1 className="mt-2 text-[30px] font-black leading-[1.02] tracking-[-0.03em] text-[#111318] md:text-[38px]">
              Upload Shoot Location
            </h1>
          </div>
          <Badge className="rounded-full bg-emerald-50 px-3 py-1.5 text-[12px] font-semibold text-emerald-700 hover:bg-emerald-50">
            <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
            Premium Only
          </Badge>
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          <section className="rounded-[32px] border border-[#eee6db] bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
            <Label className="text-[13px] font-semibold text-[#111318]">Photos</Label>
            <p className="mt-1 text-[13px] text-[#6d7480]">Add a few photos so scouts know what to expect.</p>

            <div className="mt-3 grid grid-cols-3 gap-2 md:grid-cols-4">
              {photoPreviews.map((preview) => (
                <div key={preview.index} className="group relative aspect-square overflow-hidden rounded-2xl bg-[#f3f5f8]">
                  <Image src={preview.src} alt={preview.name} fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={() => removePhoto(preview.index)}
                    aria-label="Remove photo"
                    className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-[#e6ebf3] bg-[#f9fafc] text-[#9aa0ab] transition-colors hover:border-[#f20d14] hover:text-[#f20d14]">
                <ImagePlus className="h-6 w-6" />
                <span className="text-[11px] font-semibold">Add photos</span>
                <input type="file" accept="image/*" multiple onChange={onFilesSelected} className="hidden" />
              </label>
            </div>
          </section>

          <section className="space-y-4 rounded-[32px] border border-[#eee6db] bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
            <div>
              <Label htmlFor="locationName" className="text-[13px] font-semibold text-[#111318]">
                Location name
              </Label>
              <Input
                id="locationName"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Urban Loft Studio"
                required
                className={fieldClass}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label className="text-[13px] font-semibold text-[#111318]">Location type</Label>
                <FieldSelect value={locationType} onChange={setLocationType} options={LOCATION_TYPE_OPTIONS.map((o) => o.value)} />
              </div>
              <div>
                <Label className="text-[13px] font-semibold text-[#111318]">Province</Label>
                <FieldSelect value={province} onChange={setProvince} options={[...LOCATION_PROVINCE_OPTIONS]} />
              </div>
              <div>
                <Label className="text-[13px] font-semibold text-[#111318]">City</Label>
                <FieldSelect value={city} onChange={setCity} options={[...LOCATION_CITY_OPTIONS]} />
              </div>
            </div>

            <div>
              <Label htmlFor="details" className="text-[13px] font-semibold text-[#111318]">
                Location details
              </Label>
              <Input
                id="details"
                value={locationDetails}
                onChange={(e) => setLocationDetails(e.target.value)}
                placeholder="88 Sir Lowry Road, Woodstock, Cape Town"
                className={fieldClass}
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-[13px] font-semibold text-[#111318]">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the space, lighting conditions, noise levels, and production suitability."
                className="mt-2 min-h-28 rounded-2xl border-[#e6ebf3] bg-white px-4 py-3 text-[15px] text-[#111318] shadow-none focus-visible:ring-[#f20d14]"
              />
            </div>
          </section>

          <section className="rounded-[32px] border border-[#eee6db] bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.07)]">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#f20d14]" />
              <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#6d7480]">Production notes</p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label className="text-[13px] font-semibold text-[#111318]">Safety rating</Label>
                <FieldSelect value={safetyRating} onChange={setSafetyRating} options={["Low", "Medium", "High"]} />
              </div>
              <div>
                <Label className="text-[13px] font-semibold text-[#111318]">Security level</Label>
                <FieldSelect value={securityLevel} onChange={setSecurityLevel} options={["Basic", "Standard", "High Security"]} />
              </div>
              <div>
                <Label className="text-[13px] font-semibold text-[#111318]">Best shooting times</Label>
                <FieldSelect
                  value={bestShootingTimes}
                  onChange={setBestShootingTimes}
                  options={["Early Morning", "Morning", "Midday", "Golden Hour", "Night Shoots"]}
                />
              </div>
              <div>
                <Label className="text-[13px] font-semibold text-[#111318]">Parking availability</Label>
                <FieldSelect value={parkingAvailability} onChange={setParkingAvailability} options={["None", "Limited", "Ample"]} />
              </div>
              <div>
                <Label className="text-[13px] font-semibold text-[#111318]">Crowd levels</Label>
                <FieldSelect value={crowdLevels} onChange={setCrowdLevels} options={["Quiet", "Moderate", "Busy"]} />
              </div>
              <div>
                <Label className="text-[13px] font-semibold text-[#111318]">Indoor / Outdoor</Label>
                <FieldSelect value={indoorOutdoor} onChange={setIndoorOutdoor} options={["Indoor", "Outdoor", "Mixed"]} />
              </div>
              <div>
                <Label className="text-[13px] font-semibold text-[#111318]">Power</Label>
                <FieldSelect value={powerAccess} onChange={setPowerAccess} options={[...POWER_ACCESS_OPTIONS]} />
              </div>
              <div>
                <Label className="text-[13px] font-semibold text-[#111318]">Bathrooms</Label>
                <FieldSelect value={bathroomAccess} onChange={setBathroomAccess} options={[...BATHROOM_ACCESS_OPTIONS]} />
              </div>
              <div>
                <Label className="text-[13px] font-semibold text-[#111318]">Food nearby</Label>
                <FieldSelect value={foodNearby} onChange={setFoodNearby} options={[...FOOD_NEARBY_OPTIONS]} />
              </div>
              <div>
                <Label className="text-[13px] font-semibold text-[#111318]">Access rules</Label>
                <FieldSelect
                  value={accessRules}
                  onChange={setAccessRules}
                  options={[
                    "Open access during business hours",
                    "Permit required after 18:00",
                    "Pre-approval required for all shoots",
                    "Escort required on site",
                    "Members-only access",
                  ]}
                />
              </div>
            </div>
          </section>

          {saveError && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700">
              {saveError}
            </div>
          )}

          <div className="space-y-3">
            <Button
              type="submit"
              disabled={saving}
              className="h-14 w-full rounded-full bg-[#f20d14] text-[16px] font-semibold text-white hover:bg-[#d80a10]"
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {saving ? "Publishing..." : "Publish Location"}
            </Button>
            {saved && (
              <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-center text-[14px] font-semibold text-emerald-700">
                Location published.{" "}
                <Link href="/locations" className="underline underline-offset-2" onClick={() => router.refresh()}>
                  View it on the Locations page
                </Link>
                .
              </div>
            )}
          </div>
        </form>

        <div className="mt-5 rounded-[28px] bg-[#f7f9fc] p-5">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#f20d14]" />
            <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#6d7480]">Discoverability rules</p>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-[#6d7480]">
            Uploaded shoot locations go live on the Locations page immediately for everyone to browse.
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-[#6d7480]">
            Only accounts with an active subscription can publish a new location listing.
          </p>
        </div>
      </div>
    </MobileShell>
  )
}
