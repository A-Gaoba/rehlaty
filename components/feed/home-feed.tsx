"use client"

import { PostCard } from "./post-card"
import { useAppStore } from "@/lib/store"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useState } from "react"

export function HomeFeed() {
  const { t } = useLanguage()
  const posts = useAppStore((state) => state.posts)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    // Simulate refresh delay
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("home")}</h1>
          <p className="text-muted-foreground">اكتشف تجارب المسافرين العرب في روسيا</p>
        </div>
        <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Stories/Highlights Section */}
      <div className="mb-6">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[
            { name: "موسكو", image: "/red-square-moscow.jpg" },
            { name: "سانت بطرسبرغ", image: "/hermitage-museum.png" },
            { name: "سوتشي", image: "/siberian-mountains.jpg" },
            { name: "قازان", image: "/bolshoi-theatre.jpg" },
          ].map((city, index) => (
            <div key={index} className="flex flex-col items-center gap-2 min-w-fit">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-accent p-0.5">
                <div className="w-full h-full rounded-full bg-background p-0.5">
                  <img
                    src={city.image || "/placeholder.svg"}
                    alt={city.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
              <span className="text-xs text-muted-foreground">{city.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {/* Load More */}
      <div className="text-center py-8">
        <Button variant="outline" className="w-full bg-transparent">
          تحميل المزيد من المنشورات
        </Button>
      </div>
    </div>
  )
}
