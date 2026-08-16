// One-off migration: copy existing portfolio_uploads files from Supabase
// Storage to R2, then rewrite image_url/thumbnail_url to point at R2.
//
// Safety:
// - Does NOT delete the original Supabase Storage files. This is a copy,
//   not a move, so a bad run can't lose data - just re-run it or roll back
//   the DB rows manually from a backup.
// - Idempotent: rows whose image_url already points at R2_PUBLIC_URL are
//   skipped, so it's safe to re-run after a partial failure.
// - Defaults to --dry-run reporting only. Pass --execute to actually write.
//
// Usage:
//   node scripts/migrate-portfolio-to-r2.mjs           (dry run, default)
//   node scripts/migrate-portfolio-to-r2.mjs --execute  (actually migrates)
//
// Requires in the environment: NEXT_PUBLIC_SUPABASE_URL,
// SUPABASE_SERVICE_ROLE_KEY, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID,
// R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL.

import { createClient } from "@supabase/supabase-js"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { readFileSync, existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import path from "node:path"

// Load .env.local manually - this script runs outside Next.js.
const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env.local")
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim()
  }
}

const DRY_RUN = !process.argv.includes("--execute")

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_PUBLIC_URL",
]
const missing = required.filter((key) => !process.env[key])
if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(", ")}`)
  console.error("Add them to .env.local before running this script.")
  process.exit(1)
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
})
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL.replace(/\/$/, "")
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME

async function main() {
  console.log(DRY_RUN ? "DRY RUN - no changes will be written. Pass --execute to actually migrate.\n" : "EXECUTING - this will write to R2 and update the database.\n")

  const { data: rows, error } = await supabase
    .from("portfolio_uploads")
    .select("id, user_id, storage_path, image_url, thumbnail_url")
    .eq("source", "upload")
    .not("storage_path", "is", null)

  if (error) {
    console.error("Failed to load portfolio_uploads:", error.message)
    process.exit(1)
  }

  console.log(`Found ${rows.length} uploaded portfolio rows.\n`)

  let migrated = 0
  let skipped = 0
  let failed = 0

  for (const row of rows) {
    if (row.image_url?.startsWith(R2_PUBLIC_URL)) {
      skipped++
      continue
    }

    if (!row.image_url) {
      console.warn(`[skip] ${row.id} has no image_url`)
      skipped++
      continue
    }

    try {
      const response = await fetch(row.image_url)
      if (!response.ok) throw new Error(`Source fetch failed: ${response.status}`)
      const contentType = response.headers.get("content-type") || "image/jpeg"
      const buffer = Buffer.from(await response.arrayBuffer())

      const key = row.storage_path

      if (DRY_RUN) {
        console.log(`[would migrate] ${row.id}: ${row.image_url} -> ${R2_PUBLIC_URL}/${key} (${buffer.length} bytes)`)
      } else {
        await r2.send(
          new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: contentType,
            CacheControl: "public, max-age=31536000, immutable",
          }),
        )

        const newUrl = `${R2_PUBLIC_URL}/${key}`
        const { error: updateError } = await supabase
          .from("portfolio_uploads")
          .update({ image_url: newUrl, thumbnail_url: newUrl })
          .eq("id", row.id)

        if (updateError) throw updateError
        console.log(`[migrated] ${row.id} -> ${newUrl}`)
      }

      migrated++
    } catch (err) {
      failed++
      console.error(`[failed] ${row.id}: ${err.message}`)
    }
  }

  console.log(`\nDone. ${migrated} ${DRY_RUN ? "would migrate" : "migrated"}, ${skipped} skipped, ${failed} failed.`)
  if (DRY_RUN && migrated > 0) {
    console.log("Re-run with --execute to actually perform the migration.")
  }
}

main()
