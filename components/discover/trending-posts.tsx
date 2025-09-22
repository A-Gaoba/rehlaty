"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Post } from "@/lib/types"
import { Heart, MessageCircle, Star, MapPin, TrendingUp } from "lucide-react"
import { PostModal } from "@/components/profile/post-modal"

interface TrendingPostsProps {
  posts: Post[]
}

export function TrendingPosts({ posts }: TrendingPostsProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  // Sort posts by engagement (likes + comments)
  const trendingPosts = [...posts]
    .sort((a, b) => b.likesCount + b.commentsCount - (a.likesCount + a.commentsCount))
    .slice(0, 12)

  if (trendingPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <TrendingUp className="h-8 w-8" />
          </div>
          <p>لا توجد منشورات شائعة</p>
          <p className="text-sm">ابدأ بمشاركة تجاربك!</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            المنشورات الأكثر شعبية
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trendingPosts.map((post, index) => (
              <Card
                key={post.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                onClick={() => setSelectedPost(post)}
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt={post.caption}
                      className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Trending Badge */}
                    {index < 3 && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-orange-500 text-white border-0 gap-1">
                          <TrendingUp className="h-3 w-3" />#{index + 1}
                        </Badge>
                      </div>
                    )}

                    {/* Rating Badge */}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-black/70 text-white border-0 gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{post.rating}</span>
                      </Badge>
                    </div>

                    {/* Engagement Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex items-center gap-4 text-white">
                        <div className="flex items-center gap-1">
                          <Heart className="h-5 w-5" />
                          <span className="text-sm font-medium">{post.likesCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">{post.commentsCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Post Info */}
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.displayName} />
                        <AvatarFallback className="text-xs">{post.user.displayName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium truncate">{post.user.displayName}</span>
                      {post.user.isVerified && (
                        <div className="w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground text-xs">✓</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate">
                        {post.location.name}, {post.location.city}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">{post.caption}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Post Modal */}
      {selectedPost && <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
    </>
  )
}
