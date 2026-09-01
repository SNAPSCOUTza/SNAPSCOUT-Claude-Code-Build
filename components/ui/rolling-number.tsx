"use client"

import { motion } from "framer-motion"

interface RollingDigitProps {
  digit: number
  height: number
  width: number
}

function RollingDigit({ digit, height, width }: RollingDigitProps) {
  return (
    <span className="relative inline-block overflow-hidden align-bottom" style={{ height, width }}>
      <motion.span
        className="absolute left-0 top-0 flex flex-col"
        style={{ width }}
        animate={{ y: -digit * height }}
        transition={{ type: "spring", stiffness: 280, damping: 26, mass: 0.9 }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="flex items-center justify-center tabular-nums" style={{ height, width }}>
            {i}
          </span>
        ))}
      </motion.span>
    </span>
  )
}

interface RollingNumberProps {
  value: number
  fontSize?: number
  className?: string
  prefix?: string
  suffix?: string
}

/** Odometer-style number that rolls each digit into place when `value` changes. */
export function RollingNumber({ value, fontSize = 16, className = "", prefix = "", suffix = "" }: RollingNumberProps) {
  const height = Math.round(fontSize * 1.25)
  const width = Math.round(fontSize * 0.64)
  const text = String(Math.round(value))

  return (
    <span
      className={`inline-flex items-center tabular-nums ${className}`}
      style={{ fontSize, lineHeight: `${height}px` }}
    >
      {prefix ? <span>{prefix}</span> : null}
      {text.split("").map((char, index) =>
        /\d/.test(char) ? (
          <RollingDigit key={index} digit={Number(char)} height={height} width={width} />
        ) : (
          <span key={index} style={{ width: width * 0.5 }} className="inline-flex justify-center">
            {char}
          </span>
        ),
      )}
      {suffix ? <span>{suffix}</span> : null}
    </span>
  )
}
