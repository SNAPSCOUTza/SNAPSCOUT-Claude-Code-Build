import { S3Client } from "@aws-sdk/client-s3"

const accountId = process.env.R2_ACCOUNT_ID
const accessKeyId = process.env.R2_ACCESS_KEY_ID
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

export function isR2Configured() {
  return Boolean(accountId && accessKeyId && secretAccessKey && process.env.R2_BUCKET_NAME && process.env.R2_PUBLIC_URL)
}

let client: S3Client | null = null

// R2 exposes an S3-compatible API at this per-account endpoint - no separate
// SDK needed, the standard S3 client works against it.
export function getR2Client(): S3Client {
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY.")
  }

  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    })
  }

  return client
}

export function getR2BucketName() {
  const bucket = process.env.R2_BUCKET_NAME
  if (!bucket) throw new Error("R2_BUCKET_NAME is not set")
  return bucket
}

export function getR2PublicUrl(key: string) {
  const base = process.env.R2_PUBLIC_URL
  if (!base) throw new Error("R2_PUBLIC_URL is not set")
  return `${base.replace(/\/$/, "")}/${key}`
}
