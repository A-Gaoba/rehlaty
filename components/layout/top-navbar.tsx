"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LanguageToggle } from "@/components/ui/language-toggle"
import { useLanguage } from "@/components/language-provider"
import { useAppStore } from "@/lib/store"
import { Search, Bell, MessageCircle, Settings } from "lucide-react"
import { useState } from "react"
import { logout } from "@/lib/api/auth"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { listNotifications } from "@/lib/api/notifications"
import Link from "next/link"

export function TopNavbar() {
  const { t } = useLanguage()
  const { activeTab, setActiveTab, notifications, conversations, currentUser, setCurrentUser } = useAppStore()
  const [searchQuery, setSearchQuery] = useState("")
  const qc = useQueryClient()

  const handleLogout = async () => {
    await logout()
    setCurrentUser(null)
    await qc.invalidateQueries({ queryKey: ["me"] })
  }

  // Poll notifications to show badge count
  const { data: notifData } = useQuery({
    queryKey: ["notifications", "poll"],
    queryFn: async () => listNotifications(),
    refetchInterval: 15000,
    enabled: !!currentUser,
  })
  const unreadNotifications = notifData?.items?.filter((n: any) => !n.isRead).length || 0
  const unreadMessages = conversations.reduce((total, conv) => total + conv.unreadCount, 0)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <h1 className="text-lg sm:text-xl font-bold text-primary">رحلتي</h1>
        </div>

        {/* Search Bar - Hidden on mobile */}
        <div className="hidden md:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t("search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Notifications */}
          <Link href="/notifications">
            <Button variant="ghost" size="sm" className="relative p-2 sm:p-2">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              {unreadNotifications > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 p-0 text-xs">
                  {unreadNotifications}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Messages */}
          <Link href="/messages">
            <Button variant="ghost" size="sm" className="relative p-2 sm:p-2">
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              {unreadMessages > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 p-0 text-xs">
                  {unreadMessages}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Language Toggle */}
          <LanguageToggle />

          {/* Settings - Desktop only */}
          <Button variant="ghost" size="sm" className="hidden md:flex" onClick={handleLogout} aria-label="logout">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
