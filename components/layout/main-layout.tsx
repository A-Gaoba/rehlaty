"use client"

import { TopNavbar } from "./top-navbar"
import { BottomNavigation } from "./bottom-navigation"
import { HomeFeed } from "@/components/feed/home-feed"
import { DiscoverPage } from "@/components/discover/discover-page"
import { MapPage } from "@/components/map/map-page"
import { CreatePost } from "@/components/create/create-post"
import { ProfilePage } from "@/components/profile/profile-page"
import { MessagesPage } from "@/components/messages/messages-page"
import { NotificationsPage } from "@/components/notifications/notifications-page"
import { useAppStore } from "@/lib/store"

export function MainLayout() {
  const activeTab = useAppStore((state) => state.activeTab)

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomeFeed />
      case "discover":
        return <DiscoverPage />
      case "map":
        return <MapPage />
      case "create":
        return <CreatePost />
      case "profile":
        return <ProfilePage />
      case "messages":
        return <MessagesPage />
      case "notifications":
        return <NotificationsPage />
      default:
        return <HomeFeed />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNavbar />
      <main className="pb-16 pt-16">{renderContent()}</main>
      <BottomNavigation />
    </div>
  )
}
