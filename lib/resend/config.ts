// Resend configuration for auth emails
export const RESEND_CONFIG = {
  apiKey: process.env.RESEND_API_KEY || "",
  senderEmail: process.env.SENDER_EMAIL || "noreply@updates.snapscout.co.za",
  senderName: "SnapScout",
}

// Email template IDs from Resend dashboard (you'll need to create these)
export const EMAIL_TEMPLATES = {
  confirmSignup: "confirm_signup", // Alias for confirmation email
  resetPassword: "reset_password", // Alias for password reset email
  passwordChanged: "password_changed", // Alias for password change notification
  welcomeEmail: "welcome_email", // Alias for welcome email after confirmation
}

// Validate Resend configuration
export function validateResendConfig() {
  if (!RESEND_CONFIG.apiKey) {
    console.error("[Resend] Missing RESEND_API_KEY environment variable")
    return false
  }
  return true
}

export const SITE_CONFIG = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://snapscout.co.za",
  callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://snapscout.co.za"}/api/auth/callback`,
}
