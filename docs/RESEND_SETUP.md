# Resend Email Setup for SnapScout

This guide explains how to set up Resend for sending auth emails (confirmation, password reset, etc.) with Supabase.

## Environment Variables Required

Add these to your Vercel project (Settings > Environment Variables):

| Variable | Description | Example |
|----------|-------------|---------|
| `RESEND_API_KEY` | Your Resend API key | `re_xxxxxxxx` |
| `SENDER_EMAIL` | Verified sender email | `noreply@snapscout.co.za` |
| `SEND_EMAIL_HOOK_SECRET` | Secret for Supabase webhook auth | `your-random-secret-here` |

## Setup Steps

### 1. Create Resend Account & Verify Domain

1. Go to [resend.com](https://resend.com) and create an account
2. Add your domain (e.g., `snapscout.co.za`)
3. Add the DNS records Resend provides (SPF, DKIM, DMARC)
4. Wait for domain verification (usually a few minutes)

### 2. Get Your API Key

1. Go to Resend Dashboard > API Keys
2. Create a new API key with "Full Access"
3. Copy the key (starts with `re_`)
4. Add it to Vercel as `RESEND_API_KEY`

### 3. Configure Sender Email

1. Once domain is verified, you can use any email @yourdomain
2. Set `SENDER_EMAIL` to `noreply@snapscout.co.za` (or similar)

### 4. Generate Webhook Secret

1. Generate a random string: `openssl rand -hex 32`
2. Add it to Vercel as `SEND_EMAIL_HOOK_SECRET`

### 5. Configure Supabase Auth Hook (Optional - for automatic emails)

If you want Supabase to call your API automatically on auth events:

1. Go to Supabase Dashboard > Authentication > Hooks
2. Add a new hook for "Send Email" events
3. URL: `https://your-app.vercel.app/api/auth/send-email`
4. Secret: The same value as `SEND_EMAIL_HOOK_SECRET`

### 6. Disable Supabase Default Emails (Optional)

If using the hook approach:
1. Go to Supabase Dashboard > Authentication > Email Templates
2. You can customize or disable the default templates

## Testing

1. Sign up with a new email
2. Check if the branded SnapScout confirmation email arrives
3. Test password reset flow
4. Test password change notification

## Email Templates

The current implementation uses inline HTML templates in `lib/resend/send-email.ts`. 

For production, consider using Resend's visual template editor:
1. Create templates in Resend Dashboard
2. Use template IDs instead of inline HTML
3. Update the `sendEmail` function to use `template_id` parameter

## Troubleshooting

- **Emails not sending**: Check `RESEND_API_KEY` is correct
- **Emails going to spam**: Ensure domain DNS records are set up
- **Webhook failing**: Verify `SEND_EMAIL_HOOK_SECRET` matches in Supabase and Vercel
