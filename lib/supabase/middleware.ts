import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const publicRoutes = [
  "/",
  "/auth",
  "/api",
  "/creators",
  "/studios",
  "/stores",
  "/studios-stores",
  "/find-crew",
  "/crew",
  "/locations",
  "/explore",
  "/marketplace",
  "/onboarding",
  "/join",
  "/community",
  "/help",
  "/contact",
  "/safety",
  "/terms",
  "/privacy",
  "/profile-tips",
  "/rate-guidelines",
]

function isPublicPath(pathname: string) {
  // "/" must match exactly - matching it as a prefix would make every route
  // "public" since every pathname starts with "/".
  return publicRoutes.some((route) => (route === "/" ? pathname === "/" : pathname.startsWith(route)))
}

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase env is not configured, pass through without auth checks.
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("[v0] Supabase env not configured in middleware, skipping auth check")
    return NextResponse.next({
      request,
    })
  }

  const isPublicRoute = isPublicPath(request.nextUrl.pathname)

  // Supabase's SSR client always sets a "sb-<project-ref>-auth-token" cookie
  // (possibly chunked as "...-auth-token.0", "...-auth-token.1", etc.) for
  // any signed-in session. If it's absent, there is no session to validate -
  // skip the network round-trip to the Auth server entirely instead of
  // paying for it on every anonymous page view.
  const hasAuthCookie = request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("-auth-token"))

  if (!hasAuthCookie) {
    if (!isPublicRoute) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
      },
    },
  })

  // IMPORTANT: Do not run code between createServerClient and supabase.auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[v0] Middleware auth check - User:", user ? user.id : "none", "Path:", request.nextUrl.pathname)

  // Only redirect to login if user is NOT authenticated AND trying to access protected route
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    console.log("[v0] Redirecting to login from:", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  if (user && request.nextUrl.pathname !== "/account-suspended" && !request.nextUrl.pathname.startsWith("/api")) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("suspended, role")
      .eq("user_id", user.id)
      .maybeSingle()

    if (profile?.suspended && profile.role !== "super_admin") {
      const url = request.nextUrl.clone()
      url.pathname = "/account-suspended"
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
