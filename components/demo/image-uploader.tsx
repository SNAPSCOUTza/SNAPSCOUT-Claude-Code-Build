"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { UploadCloud, X } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

interface ImageUploaderProps {
  onUpload: (base64: string) => void
  currentImage?: string
  label: string
}

export function ImageUploader({ onUpload, currentImage, label }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const base64 = event.target?.result as string
          onUpload(base64)
          setPreview(base64)
        }
        reader.readAsDataURL(file)
      }
    },
    [onUpload],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".png", ".gif", ".webp"] },
    multiple: false,
  })

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview(null)
    onUpload("")
  }

  if (preview) {
    return (
      <div className="relative group w-full h-48 rounded-lg overflow-hidden">
        <Image src={preview || "/placeholder.svg"} alt="Upload preview" layout="fill" objectFit="cover" />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="destructive" size="icon" onClick={handleRemoveImage}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
        isDragActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary"
      }`}
    >
      <input {...getInputProps()} />
      <UploadCloud className="h-8 w-8 text-gray-400 mb-2" />
      <p className="text-gray-600 font-semibold">{label}</p>
      <p className="text-sm text-gray-500">Drag & drop or click to upload</p>
    </div>
  )
}
