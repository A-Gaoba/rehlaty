"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LanguageToggle } from "@/components/ui/language-toggle"
import { useLanguage } from "@/components/language-provider"
import { useAppStore } from "@/lib/store"
import { Search, Bell, MessageCircle, Settings } from "lucide-react"
import { useState } from "react"

export function TopNavbar() {
  const { t } = useLanguage()
  const { activeTab, setActiveTab, notifications, conversations, currentUser } = useAppStore()
  const [searchQuery, setSearchQuery] = useState("")

  const unreadNotifications = notifications.filter((n) => n.userId === currentUser?.id && !n.isRead).length
  const unreadMessages = conversations.reduce((total, conv) => total + conv.unreadCount, 0)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-primary">رحلتي</h1>
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
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative" onClick={() => setActiveTab("notifications")}>
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                {unreadNotifications}
              </Badge>
            )}
          </Button>

          {/* Messages */}
          <Button variant="ghost" size="sm" className="relative" onClick={() => setActiveTab("messages")}>
            <MessageCircle className="h-5 w-5" />
            {unreadMessages > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                {unreadMessages}
              </Badge>
            )}
          </Button>

          {/* Language Toggle */}
          <LanguageToggle />

          {/* Settings - Desktop only */}
          <Button variant="ghost" size="sm" className="hidden md:flex">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
