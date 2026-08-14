const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B-\u001F\u007F]/g

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

export function sanitizeTextArray(value: unknown, maxLength = 80, limit = 24) {
  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeSingleLineInput(item, maxLength))
      .filter(Boolean)
      .slice(0, limit)
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => sanitizeSingleLineInput(item, maxLength))
      .filter(Boolean)
      .slice(0, limit)
  }

  return []
}
