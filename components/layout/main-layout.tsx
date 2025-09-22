"use client"

import { TopNavbar } from "./top-navbar"
import { BottomNavigation } from "./bottom-navigation"
import type React from "react"

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <TopNavbar />
      <main className="pb-14 pt-14 sm:pb-16 sm:pt-16">{children}</main>
      <BottomNavigation />
    </div>
  )
}
