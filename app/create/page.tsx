"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { CreatePost } from "@/components/create/create-post"
import { useAppStore } from "@/lib/store"
import { AuthPage } from "@/components/auth/auth-page"

export default function Page() {
  const currentUser = useAppStore((s) => s.currentUser)
  if (!currentUser) return <AuthPage />
  return (
    <MainLayout>
      <CreatePost />
    </MainLayout>
  )
}


