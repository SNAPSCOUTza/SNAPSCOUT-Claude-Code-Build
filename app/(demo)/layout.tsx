"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import Image from "next/image"

function DemoHeader() {
  const pathname = usePathname()
  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "Live Preview" },
  ]

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/images/snapscout-circular-logo.png" alt="SnapScout Logo" width={32} height={32} />
            <span className="font-bold text-lg">SnapScout</span>
            <span className="text-sm text-red-600 font-semibold border border-red-200 bg-red-50 px-2 py-0.5 rounded-full">
              Demo Mode
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  pathname === link.href ? "text-primary" : "text-muted-foreground hover:text-primary",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 text-white">Publish Profile</Button>
      </div>
    </header>
  )
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DemoHeader />
      <main className="container mx-auto p-4 md:p-8">{children}</main>
    </div>
  )
}
