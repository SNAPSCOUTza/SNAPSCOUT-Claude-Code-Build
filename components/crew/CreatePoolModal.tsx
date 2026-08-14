"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CrewPool } from "@/types/crew-pool"

const colorOptions = ["#FF5C00", "#2563EB", "#D8A100", "#16A34A", "#7C3AED", "#EF1218"]

type CreatePoolModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (pool: CrewPool) => void
}

export function CreatePoolModal({ open, onOpenChange, onCreated }: CreatePoolModalProps) {
  const [name, setName] = useState("")
  const [color, setColor] = useState(colorOptions[0])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const submit = async () => {
    const trimmed = name.trim()
    if (!trimmed) {
      setError("Give this pool a name first.")
      return
    }

    setSubmitting(true)
    setError("")
    try {
      const response = await fetch("/api/crew-pools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: trimmed, color }),
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Could not create pool")

      setName("")
      setColor(colorOptions[0])
      onCreated?.(payload.pool)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create pool")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-[28px] border-[#e7edf5] bg-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create crew pool</DialogTitle>
          <DialogDescription>Save crew into a named folder for future shoots.</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="pool-name">Pool name</Label>
            <Input
              id="pool-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={50}
              placeholder="Cape Town campaign crew"
              className="h-12 rounded-2xl bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label>Colour</Label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((option) => (
                <motion.button
                  key={option}
                  type="button"
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setColor(option)}
                  className={`h-11 w-11 rounded-full border-2 ${
                    color === option ? "border-[#0b0d12]" : "border-transparent"
                  }`}
                  style={{ backgroundColor: option }}
                  aria-label={`Use colour ${option}`}
                />
              ))}
            </div>
          </div>

          {error && <p className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <Button
            type="button"
            disabled={submitting}
            onClick={submit}
            className="h-12 w-full rounded-full bg-[#ef1218] text-white hover:bg-[#d90d12]"
          >
            <Plus className="h-4 w-4" />
            {submitting ? "Creating..." : "Create pool"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
