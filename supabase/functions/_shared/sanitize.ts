// Ported verbatim from lib/utils/sanitize.ts - Edge Functions can't import
// from the Next.js app's lib/ directory, so this is kept as an intentional
// duplicate. Keep both in sync if the sanitization rules change.
const CONTROL_CHARACTERS = new RegExp("[\\u0000-\\u0008\\u000B-\\u001F\\u007F]", "g")

export function sanitizeTextInput(value: unknown, maxLength = 500) {
  if (typeof value !== "string") return ""

  return value
    .replace(/\r\n?/g, "\n")
    .replace(CONTROL_CHARACTERS, "")
    .trim()
    .slice(0, maxLength)
}

export function sanitizeSingleLineInput(value: unknown, maxLength = 120) {
  return sanitizeTextInput(value, maxLength)
    .replace(/[\n\t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
}

export function sanitizeOptionalUrl(value: unknown, maxLength = 500) {
  const sanitized = sanitizeSingleLineInput(value, maxLength)
  if (!sanitized) return null
  return sanitized
}
