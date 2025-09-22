"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { MapPage } from "@/components/map/map-page"
import { LeafletMap } from "@/components/map/leaflet-map"
import { useAppStore } from "@/lib/store"
import { AuthPage } from "@/components/auth/auth-page"

export default function Page() {
  const currentUser = useAppStore((s) => s.currentUser)
  if (!currentUser) return <AuthPage />
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <LeafletMap />
      </div>
    </MainLayout>
  )
}


