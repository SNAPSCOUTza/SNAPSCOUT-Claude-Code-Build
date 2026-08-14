"use client"
import type React from "react"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface MessageButtonProps {
  recipientId: string
  recipientName: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children?: React.ReactNode
}

export function MessageButton({
  recipientId,
  recipientName,
  variant = "outline",
  size = "icon",
  className,
  children,
}: MessageButtonProps) {
  const router = useRouter()

  const handleStartConversation = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.preventDefault()
    event?.stopPropagation()
    router.push(`/messages?recipient=${recipientId}`)
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleStartConversation}
      className={cn(
        "border border-[#e1e7f1] bg-white text-[#111318] shadow-sm transition-[transform,box-shadow,background-color,color] duration-200 ease-out hover:border-[#ffd0d2] hover:bg-[#fff4f4] hover:text-[#f20d14] hover:shadow-[0_10px_24px_rgba(242,13,20,0.12)] active:scale-95",
        size === "icon" ? "h-11 w-11 min-w-11 rounded-full p-0" : "rounded-full px-4",
        className,
      )}
      aria-label={`Message ${recipientName}`}
    >
      <MessageCircle className="h-4 w-4" />
      {children || (size !== "icon" && <span className="ml-2">Message</span>)}
    </Button>
  )
}
