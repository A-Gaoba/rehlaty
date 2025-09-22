"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { useAppStore } from "@/lib/store"
import { Home, Compass, Map, Plus, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNavigation() {
  const { t } = useLanguage()
  const { activeTab, setActiveTab } = useAppStore()

  const navItems = [
    { id: "home", icon: Home, label: t("home") },
    { id: "discover", icon: Compass, label: t("discover") },
    { id: "create", icon: Plus, label: t("create"), isSpecial: true },
    { id: "map", icon: Map, label: t("map") },
    { id: "profile", icon: User, label: t("profile") },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex flex-col items-center gap-1 h-auto py-2 px-3",
                  item.isSpecial && "bg-primary text-primary-foreground hover:bg-primary/90",
                  isActive && !item.isSpecial && "text-primary",
                )}
              >
                <Icon className={cn("h-5 w-5", item.isSpecial && "h-6 w-6")} />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
