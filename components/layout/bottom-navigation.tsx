"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/language-provider"
import { Home, Compass, Map, Plus, User } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function BottomNavigation() {
  const { t } = useLanguage()
  const pathname = usePathname()

  const navItems = [
    { href: "/home", icon: Home, label: t("home") },
    { href: "/discover", icon: Compass, label: t("discover") },
    { href: "/create", icon: Plus, label: t("create"), isSpecial: true },
    { href: "/map", icon: Map, label: t("map") },
    { href: "/u/me", icon: User, label: t("profile") },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-around h-14 sm:h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link href={item.href} key={item.href} className="flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full flex flex-col items-center gap-1 h-auto py-1.5 sm:py-2 px-2 sm:px-3",
                    item.isSpecial && "bg-primary text-primary-foreground hover:bg-primary/90",
                    isActive && !item.isSpecial && "text-primary",
                  )}
                >
                  <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", item.isSpecial && "h-5 w-5 sm:h-6 sm:w-6")} />
                  <span className="text-xs font-medium leading-tight">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
