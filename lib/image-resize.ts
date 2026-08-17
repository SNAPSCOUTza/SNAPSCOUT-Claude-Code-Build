export async function resizeImageFile(
  file: File,
  options: { maxDimension?: number; quality?: number } = {},
): Promise<File> {
  const { maxDimension = 512, quality = 0.85 } = options

  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      bitmap.close()
      return file
    }

    ctx.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality))
    if (!blob) return file

    const name = file.name.replace(/\.[^/.]+$/, "") + ".jpg"
    return new File([blob], name, { type: "image/jpeg" })
  } catch {
    return file
  }
}
