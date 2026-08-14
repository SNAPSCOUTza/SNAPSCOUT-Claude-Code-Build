"use client"

import {
  Aperture,
  AudioLines,
  Box,
  BriefcaseBusiness,
  Building2,
  Calendar,
  Camera,
  CheckCircle,
  Clock,
  DollarSign,
  HandCoins,
  Lightbulb,
  Mail,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  Truck,
  Users,
  Video,
  Wrench,
  Zap,
} from "lucide-react"

interface OnboardingOptionIconProps {
  label: string
  selected?: boolean
}

const brandMarks: Record<string, string> = {
  sony: "SONY",
  canon: "CANON",
  nikon: "NIKON",
  arri: "ARRI",
  red: "RED",
  dji: "DJI",
  aputure: "AP",
  rode: "RØDE",
}

function DroneGlyph({ className, strokeWidth = 2 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 9v6" />
      <path d="M9 12h6" />
      <path d="m7.5 7.5 3 3" />
      <path d="m16.5 7.5-3 3" />
      <path d="m7.5 16.5 3-3" />
      <path d="m16.5 16.5-3-3" />
      <circle cx="6" cy="6" r="2" />
      <circle cx="18" cy="6" r="2" />
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
      <circle cx="12" cy="12" r="1.5" />
    </svg>
  )
}

function getBrandMark(label: string) {
  const text = label.trim().toLowerCase()
  return brandMarks[text] ?? null
}

function getBaseIcon(label: string) {
  const text = label.toLowerCase()
  if (text.includes("rental only") || text.includes("rent")) return HandCoins
  if (text.includes("sales only") || text.includes("sales")) return Camera
  if (text.includes("camera bodies") || text.includes("lenses")) return Aperture
  if (text.includes("lighting") || text.includes("grip")) return Lightbulb
  if (text.includes("audio") || text.includes("sound")) return AudioLines
  if (text.includes("drone") || text.includes("dji")) return DroneGlyph
  if (text.includes("stabiliser") || text.includes("stabilizer") || text.includes("rig")) return SlidersHorizontal
  if (text.includes("small gear") || text.includes("accessories")) return Box
  if (text.includes("sony") || text.includes("canon") || text.includes("nikon")) return Aperture
  if (text.includes("arri") || text.includes("red")) return Video
  if (text.includes("aputure")) return Zap
  if (text.includes("rode")) return AudioLines
  if (text.includes("photographer") || text.includes("photography") || text.includes("portrait")) return Camera
  if (text.includes("video") || text.includes("film") || text.includes("production") || text.includes("music")) return Video
  if (text.includes("crew") || text.includes("team") || text.includes("collective")) return Users
  if (text.includes("studio") || text.includes("space") || text.includes("venue") || text.includes("residential")) return Building2
  if (text.includes("gear") || text.includes("store") || text.includes("equipment") || text.includes("accessories")) return Package
  if (text.includes("location") || text.includes("province") || text.includes("based") || text.includes("travel")) return MapPin
  if (text.includes("delivery") || text.includes("collection")) return Truck
  if (text.includes("hire") || text.includes("client") || text.includes("brand") || text.includes("business")) return BriefcaseBusiness
  if (text.includes("budget") || text.includes("price") || text.includes("deposit") || text.includes("rate")) return DollarSign
  if (text.includes("available") || text.includes("time") || text.includes("duration") || text.includes("hour") || text.includes("day")) return Clock
  if (text.includes("date") || text.includes("year") || text.includes("ongoing")) return Calendar
  if (text.includes("email")) return Mail
  if (text.includes("phone") || text.includes("whatsapp")) return Phone
  if (text.includes("review") || text.includes("quality") || text.includes("portfolio")) return Star
  if (text.includes("secure") || text.includes("reputation")) return ShieldCheck
  if (text.includes("shopping") || text.includes("product")) return ShoppingBag
  if (text.includes("yes") || text.includes("both")) return CheckCircle
  return Wrench
}

export function OnboardingOptionIcon({ label, selected = false }: OnboardingOptionIconProps) {
  const Icon = getBaseIcon(label)
  const text = label.toLowerCase()
  const brandMark = getBrandMark(label)
  const showPackageDot = text.includes("rental only")
  const showCameraDollar = text.includes("sales only")

  return (
    <span
      className={`relative mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
        selected ? "bg-[#ff111b] text-white" : "bg-white text-[#111318]"
      } shadow-sm ring-1 ring-[#e3e8f0]`}
      aria-hidden="true"
    >
      {brandMark ? (
        <span className="max-w-[30px] truncate text-center text-[8px] font-black leading-none tracking-[-0.03em]">
          {brandMark}
        </span>
      ) : (
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      )}
      {showPackageDot ? (
        <Package className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full bg-white p-[1px] text-[#ff111b]" />
      ) : null}
      {showCameraDollar ? (
        <DollarSign className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full bg-white p-[1px] text-[#ff111b]" />
      ) : null}
    </span>
  )
}
