"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { MessagesPage } from "@/components/messages/messages-page"
import { useAppStore } from "@/lib/store"
import { AuthPage } from "@/components/auth/auth-page"

export default function Page() {
  const currentUser = useAppStore((s) => s.currentUser)
  if (!currentUser) return <AuthPage />
  // MessagesPage already handles selecting a conversation from the list.
  return (
    <MainLayout>
      <MessagesPage />
    </MainLayout>
  )
}
