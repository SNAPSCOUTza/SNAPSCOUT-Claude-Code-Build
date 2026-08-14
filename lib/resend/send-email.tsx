import { RESEND_CONFIG, type EMAIL_TEMPLATES } from "./config"

interface SendEmailOptions {
  to: string
  subject: string
  template?: keyof typeof EMAIL_TEMPLATES
  variables?: Record<string, string>
  html?: string
}

interface ResendResponse {
  id?: string
  error?: string
}

export async function sendEmail(options: SendEmailOptions): Promise<ResendResponse> {
  const { to, subject, template, variables, html } = options

  if (!RESEND_CONFIG.apiKey) {
    console.error("[Resend] API key not configured")
    return { error: "Resend API key not configured" }
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_CONFIG.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${RESEND_CONFIG.senderName} <${RESEND_CONFIG.senderEmail}>`,
        to: [to],
        subject,
        ...(html ? { html } : {}),
        // If using Resend templates with variables
        ...(template
          ? {
              // Resend uses template aliases or IDs
              tags: [{ name: "template", value: template }],
            }
          : {}),
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[Resend] Error sending email:", data)
      return { error: data.message || "Failed to send email" }
    }

    return { id: data.id }
  } catch (error) {
    console.error("[Resend] Exception sending email:", error)
    return { error: "Failed to send email" }
  }
}

// Pre-built email functions for auth flows
export async function sendConfirmationEmail(email: string, confirmationUrl: string) {
  return sendEmail({
    to: email,
    subject: "Confirm your SnapScout account",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc2626; margin: 0;">SnapScout</h1>
            <p style="color: #666; margin-top: 5px;">Your Local Companion</p>
          </div>
          
          <h2 style="color: #1a1a1a;">Confirm your email address</h2>
          
          <p>Thanks for signing up for SnapScout! Please confirm your email address by clicking the button below:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" style="background-color: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Confirm Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If you didn't create an account with SnapScout, you can safely ignore this email.
          </p>
          
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this URL into your browser:<br>
            <a href="${confirmationUrl}" style="color: #dc2626; word-break: break-all;">${confirmationUrl}</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} SnapScout. All rights reserved.
          </p>
        </body>
      </html>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  return sendEmail({
    to: email,
    subject: "Reset your SnapScout password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc2626; margin: 0;">SnapScout</h1>
            <p style="color: #666; margin-top: 5px;">Your Local Companion</p>
          </div>
          
          <h2 style="color: #1a1a1a;">Reset your password</h2>
          
          <p>We received a request to reset your password. Click the button below to choose a new password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
          
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this URL into your browser:<br>
            <a href="${resetUrl}" style="color: #dc2626; word-break: break-all;">${resetUrl}</a>
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} SnapScout. All rights reserved.
          </p>
        </body>
      </html>
    `,
  })
}

export async function sendPasswordChangedEmail(email: string) {
  return sendEmail({
    to: email,
    subject: "Your SnapScout password was changed",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc2626; margin: 0;">SnapScout</h1>
            <p style="color: #666; margin-top: 5px;">Your Local Companion</p>
          </div>
          
          <h2 style="color: #1a1a1a;">Password Changed</h2>
          
          <p>Your SnapScout account password was recently changed.</p>
          
          <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; color: #991b1b;">
              <strong>If you didn't make this change</strong>, please contact us immediately or reset your password.
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If you made this change, you can safely ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} SnapScout. All rights reserved.
          </p>
        </body>
      </html>
    `,
  })
}

export async function sendWelcomeEmail(email: string, name: string) {
  return sendEmail({
    to: email,
    subject: "Welcome to SnapScout!",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc2626; margin: 0;">SnapScout</h1>
            <p style="color: #666; margin-top: 5px;">Your Local Companion</p>
          </div>
          
          <h2 style="color: #1a1a1a;">Welcome to SnapScout, ${name}!</h2>
          
          <p>Your email has been confirmed and your account is now active. Here's what you can do next:</p>
          
          <ul style="padding-left: 20px;">
            <li><strong>Complete your profile</strong> - Add your skills, portfolio, and availability</li>
            <li><strong>Browse opportunities</strong> - Find film crew gigs and creative projects</li>
            <li><strong>Connect with others</strong> - Message studios, creators, and crew members</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://snapscout.co.za"}/dashboard" style="background-color: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
          
          <p>If you have any questions, feel free to reach out to our support team.</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          
          <p style="color: #999; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} SnapScout. All rights reserved.
          </p>
        </body>
      </html>
    `,
  })
}
