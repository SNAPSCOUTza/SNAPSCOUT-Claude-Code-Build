import { updateSession } from "@/lib/supabase/middleware"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const IPAD_UA_REGEX = /iPad/i
const MOBILE_UA_REGEX = /Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i

function detectDeviceType(userAgent: string): "mobile" | "desktop" {
  // iPads get the desktop experience per product decision, checked first
  // since some iPad UAs also include a "Mobile" token that would otherwise
  // match MOBILE_UA_REGEX below.
  if (IPAD_UA_REGEX.test(userAgent)) return "desktop"
  return MOBILE_UA_REGEX.test(userAgent) ? "mobile" : "desktop"
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/signup" || request.nextUrl.pathname === "/auth/signup" || request.nextUrl.pathname === "/join") {
    return NextResponse.redirect(new URL("/onboarding", request.url))
  }

  const deviceType = detectDeviceType(request.headers.get("user-agent") || "")
  request.headers.set("x-device-type", deviceType)

  const response = await updateSession(request)
  response.headers.set("x-device-type", deviceType)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
