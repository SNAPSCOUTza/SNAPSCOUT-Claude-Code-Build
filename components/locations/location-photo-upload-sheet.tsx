"use client"

import { useState } from "react"
import Image from "next/image"
import { X } from "lucide-react"
import { LoadingDot } from "@/components/ui/loading-dot"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type LocationPhotoUploadSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  locationId: string
  onUploaded: () => void | Promise<void>
}

export function LocationPhotoUploadSheet({ open, onOpenChange, locationId, onUploaded }: LocationPhotoUploadSheetProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState("")
  const [shotAt, setShotAt] = useState("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setFile(null)
    setPreview(null)
    setCaption("")
    setShotAt("")
    setError(null)
  }

  const close = () => {
    onOpenChange(false)
    reset()
  }

  const onSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0]
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  const submit = async () => {
    if (!file) return
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      if (caption.trim()) formData.append("caption", caption.trim())
      if (shotAt.trim()) formData.append("shot_at", shotAt.trim())

      const response = await fetch(`/api/locations/${locationId}/photos`, { method: "POST", body: formData })
      const result = await response.json().catch(() => null)

      if (!response.ok) throw new Error(result?.error || "Could not share this photo")

      await onUploaded()
      close()
    } catch (uploadError: any) {
      setError(uploadError?.message || "Could not share this photo")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <DialogContent
        unstyled
        showCloseButton={false}
        overlayClassName="fixed inset-0 z-[169] bg-white/20 backdrop-blur-[12px]"
        className="fixed inset-x-0 bottom-0 top-auto z-[170] mx-0 w-full max-w-none gap-0 overflow-hidden rounded-b-none rounded-t-[30px] border-x-0 border-b-0 border-t border-[#e8dfd3] bg-white p-0 text-[#111318] shadow-[0_-24px_64px_rgba(15,23,42,0.18)]"
      >
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-[#d7dce6]" />
        <div className="flex items-center justify-between border-b border-[#e8dfd3] px-5 pb-4 pt-4">
          <p className="text-[18px] font-semibold text-[#111318]">Share Photos</p>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="grid h-10 w-10 place-items-center rounded-full border border-[#e7e0d6] bg-white"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="max-h-[75dvh] overflow-y-auto px-5 py-5">
          {preview ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#f3f5f8]">
              <Image src={preview} alt="Selected photo" fill className="object-cover" unoptimized />
              <button
                type="button"
                onClick={() => {
                  setFile(null)
                  setPreview(null)
                }}
                className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white"
                aria-label="Remove photo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#e7e0d6] bg-[#fbfcfe] text-[#6d7480]">
              <span className="text-[14px] font-semibold">Choose Images</span>
              <span className="text-[12px]">Tap to select a photo from this shoot</span>
              <input type="file" accept="image/*" className="sr-only" onChange={onSelectFile} />
            </label>
          )}

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6d7480]">
                Add Caption
              </label>
              <Input
                value={caption}
                onChange={(event) => setCaption(event.target.value)}
                placeholder="Golden hour lighting was perfect today."
                className="mt-2 h-12 rounded-full"
              />
            </div>

            <div>
              <label className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#6d7480]">
                What time did you shoot? <span className="normal-case text-[#9aa0ab]">(Optional)</span>
              </label>
              <Input
                value={shotAt}
                onChange={(event) => setShotAt(event.target.value)}
                placeholder="5:30 PM"
                className="mt-2 h-12 rounded-full"
              />
            </div>
          </div>

          {error && <p className="mt-4 text-[13px] text-[#c0161c]">{error}</p>}

          <Button
            type="button"
            onClick={submit}
            disabled={!file || uploading}
            className="mt-6 h-14 w-full rounded-full bg-[#f20d14] text-[16px] font-semibold text-white hover:bg-[#d80a10]"
          >
            {uploading ? <LoadingDot className="mr-2" /> : null}
            {uploading ? "Posting..." : "Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
