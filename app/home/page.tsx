"use client"

import { useAppStore } from "@/lib/store"
import { AuthPage } from "@/components/auth/auth-page"
import { MainLayout } from "@/components/layout/main-layout"
import { HomeFeed } from "@/components/feed/home-feed"

export default function HomePage() {
  const currentUser = useAppStore((state) => state.currentUser)

  if (!currentUser) {
    return <AuthPage />
  }

  return (
    <MainLayout>
      <HomeFeed />
    </MainLayout>
  )
}


