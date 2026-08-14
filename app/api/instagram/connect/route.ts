import { NextResponse } from "next/server"
import { apiError, isApiErrorContext, requireUser } from "@/lib/crew-pools/api"
import { buildInstagramAuthUrl, getInstagramSetupStatus } from "@/lib/portfolio/instagram"

export const runtime = "nodejs"

function dashboardPortfolioRedirect(request: Request, message: string) {
  const url = new URL("/dashboard", request.url)
  url.searchParams.set("section", "portfolio")
  url.searchParams.set("instagram", "setup-required")
  url.searchParams.set("message", message)
  return NextResponse.redirect(url)
}

async function getConnectUrl(request: Request) {
  const context = await requireUser()
  if (isApiErrorContext(context)) return context
  const setup = getInstagramSetupStatus(request.url)
  if (!setup.configured) throw new Error(`Instagram OAuth is not configured: ${setup.missing.join(", ")}`)
  return buildInstagramAuthUrl(context.user.id, request.url)
}

export async function GET(request: Request) {
  try {
    const result = await getConnectUrl(request)
    if (result instanceof NextResponse) return result
    return NextResponse.redirect(result)
  } catch (error: any) {
    const message = error?.message || "Instagram connection could not be started"
    if (message.includes("INSTAGRAM_CLIENT_ID") || message.includes("Instagram OAuth is not configured")) {
      return dashboardPortfolioRedirect(
        request,
        "Instagram is not configured yet. Add your Meta app credentials before connecting an account.",
      )
    }

    return apiError(error?.message || "Instagram connection could not be started", 500, "INSTAGRAM_CONNECT_FAILED")
  }
}

export async function POST(request: Request) {
  try {
    const result = await getConnectUrl(request)
    if (result instanceof NextResponse) return result
    return NextResponse.json({ url: result })
  } catch (error: any) {
    return apiError(error?.message || "Instagram connection could not be started", 500, "INSTAGRAM_CONNECT_FAILED")
  }
}
