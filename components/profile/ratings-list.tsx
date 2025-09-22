"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Post } from "@/lib/types"
import { MapPin, Star, Calendar } from "lucide-react"

interface RatingsListProps {
  posts: Post[]
}

export function RatingsList({ posts }: RatingsListProps) {
  // Sort posts by rating (highest first)
  const sortedPosts = [...posts].sort((a, b) => b.rating - a.rating)

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Star className="h-8 w-8" />
          </div>
          <p>لا توجد تقييمات بعد</p>
          <p className="text-sm">ابدأ بتقييم الأماكن التي زرتها!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sortedPosts.map((post) => (
        <Card key={post.id}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Post Image */}
              <img
                src={post.image || "/placeholder.svg"}
                alt={post.caption}
                className="w-20 h-20 object-cover rounded-lg"
              />

              {/* Post Details */}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">{post.location.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{post.location.city}</span>
                    </div>
                  </div>
                  <Badge className="gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{post.rating}</span>
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">{post.caption}</p>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(post.createdAt).toLocaleDateString("ar-SA", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
