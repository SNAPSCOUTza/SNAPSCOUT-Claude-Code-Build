"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const greetings = [
  "Hello",
  "Hola",
  "Bonjour",
  "Guten Tag",
  "Ciao",
  "Olá",
  "Привет",
  "こんにちは",
  "안녕하세요",
  "مرحبا",
  "नमस्ते",
  "Hej",
]

interface RedPreloaderProps {
  onComplete?: () => void
  className?: string
}

const RedPreloader: React.FC<RedPreloaderProps> = ({ onComplete, className }) => {
  const [currentGreeting, setCurrentGreeting] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const [dimension, setDimension] = useState({ width: 0, height: 0 })

  useEffect(() => {
    setDimension({ width: window.innerWidth, height: window.innerHeight })
  }, [])

  useEffect(() => {
    const greetingInterval = setInterval(() => {
      setCurrentGreeting((prev) => (prev + 1) % greetings.length)
    }, 400)

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          clearInterval(greetingInterval)
          setTimeout(() => {
            setIsExiting(true)
            setTimeout(() => {
              onComplete?.()
            }, 800)
          }, 500)
          return 100
        }
        return prev + 1
      })
    }, 50)

    return () => {
      clearInterval(greetingInterval)
      clearInterval(progressInterval)
    }
  }, [onComplete])

  const slideUp = {
    initial: { top: 0 },
    exit: {
      top: "-100vh",
      transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 },
    },
  }

  const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${
    dimension.width / 2
  } ${dimension.height + 300} 0 ${dimension.height} L0 0`
  const targetPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${
    dimension.width / 2
  } ${dimension.height} 0 ${dimension.height} L0 0`

  const curve = {
    initial: {
      d: initialPath,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] },
    },
    exit: {
      d: targetPath,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: 0.3 },
    },
  }

  const textVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 },
    },
  }

  const dotVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 1,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }

  const progressBarVariants = {
    initial: { width: "0%" },
    animate: {
      width: `${progress}%`,
      transition: { duration: 0.1, ease: "easeOut" },
    },
  }

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      },
    },
  }

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      animate={isExiting ? "exit" : "initial"}
      className={cn(
        "fixed inset-0 w-screen h-screen flex flex-col items-center justify-center z-[99999]",
        "bg-gradient-to-br from-red-700 via-red-800 to-red-950",
        className,
      )}
    >
      {dimension.width > 0 && (
        <>
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-red-300 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  opacity: [0.2, 0.8, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
          {/* Main content container */}
          <motion.div
            className="relative z-10 flex flex-col items-center space-y-8"
            variants={pulseVariants}
            animate="animate"
          >
            {/* Greeting text with animated dot */}
            <div className="flex items-center space-x-4">
              <motion.div className="w-3 h-3 bg-white rounded-full" variants={dotVariants} animate="animate" />
              <motion.h1
                key={currentGreeting}
                variants={textVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-wide"
              >
                {greetings[currentGreeting]}
              </motion.h1>
            </div>
            {/* Loading text */}
            <motion.p
              className="text-xl md:text-2xl text-red-100 font-medium tracking-wider"
              animate={{
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            >
              Loading your experience...
            </motion.p>
          </motion.div>
          {/* Progress bar at bottom */}
          <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-80 md:w-96">
            <div className="flex items-center justify-between mb-2">
              <span className="text-red-100 text-sm font-medium">Progress</span>
              <span className="text-white text-sm font-bold">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-red-800 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-white via-red-100 to-white rounded-full shadow-lg"
                variants={progressBarVariants}
                animate="animate"
                style={{
                  boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                }}
              />
            </div>
          </div>
          {/* Animated SVG curve for exit */}
          <svg className="absolute top-0 w-full h-[calc(100%+300px)]">
            <motion.path variants={curve} initial="initial" animate={isExiting ? "exit" : "initial"} fill="#dc2626" />
          </svg>
        </>
      )}
    </motion.div>
  )
}

export default RedPreloader
