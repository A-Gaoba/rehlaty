"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { NotificationsPage } from "@/components/notifications/notifications-page"
import { useAppStore } from "@/lib/store"
import { AuthPage } from "@/components/auth/auth-page"

export default function Page() {
  const currentUser = useAppStore((s) => s.currentUser)
  if (!currentUser) return <AuthPage />
  return (
    <MainLayout>
      <NotificationsPage />
    </MainLayout>
  )
}


