import { DeleteObjectsCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import { getR2BucketName, getR2Client, getR2PublicUrl } from "./client"

export async function uploadToR2(key: string, body: Buffer | Uint8Array, contentType: string) {
  const client = getR2Client()
  const bucket = getR2BucketName()

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      // Immutable filenames (random UUID per upload) - safe to cache forever.
      CacheControl: "public, max-age=31536000, immutable",
    }),
  )

  return getR2PublicUrl(key)
}

export async function deleteFromR2(keys: string[]) {
  if (!keys.length) return
  const client = getR2Client()
  const bucket = getR2BucketName()

  await client.send(
    new DeleteObjectsCommand({
      Bucket: bucket,
      Delete: { Objects: keys.map((Key) => ({ Key })) },
    }),
  )
}
