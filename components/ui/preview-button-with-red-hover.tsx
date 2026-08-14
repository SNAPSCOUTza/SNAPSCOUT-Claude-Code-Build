"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface PreviewButtonWithRedHoverProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

const PreviewButtonWithRedHover = React.forwardRef<HTMLButtonElement, PreviewButtonWithRedHoverProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(
          "relative isolate px-8 py-3 rounded-full",
          "text-white font-semibold text-base leading-6",
          "cursor-pointer overflow-hidden",
          "flex items-center justify-center", // Center the text
          className,
        )}
        initial={{ backgroundColor: "#1f2937" }} // bg-gray-800
        whileHover={{ backgroundColor: "#dc2626" }} // bg-red-600
        transition={{ duration: 0.3 }}
        {...props}
      >
        <span className="text-center">{children}</span>
      </motion.button>
    )
  },
)

PreviewButtonWithRedHover.displayName = "PreviewButtonWithRedHover"

export { PreviewButtonWithRedHover }
