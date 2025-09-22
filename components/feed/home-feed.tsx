"use client"

import { PostCard } from "./post-card"
import { useLanguage } from "@/components/language-provider"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useState, useMemo } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { listPosts } from "@/lib/api/posts"
import Image from "next/image"

export function HomeFeed() {
  const { t } = useLanguage()
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: async ({ pageParam }) => listPosts(pageParam as string | undefined, 10),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30_000,
  })

  const posts = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data])
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
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
                  <Image
                    src={city.image || "/placeholder.svg"}
                    alt={city.name}
                    width={64}
                    height={64}
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
        {isLoading && <div className="text-center text-sm text-muted-foreground py-8">جاري التحميل...</div>}
      </div>

      {/* Load More */}
      <div className="text-center py-8">
        {hasNextPage ? (
          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "جاري التحميل..." : "تحميل المزيد من المنشورات"}
          </Button>
        ) : (
          <div className="text-sm text-muted-foreground">لا مزيد من المنشورات</div>
        )}
      </div>
    </div>
  )
}
