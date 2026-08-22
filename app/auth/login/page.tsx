import { headers } from "next/headers"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  const deviceType = headers().get("x-device-type")
  return <LoginForm isDesktop={deviceType === "desktop"} />
}
