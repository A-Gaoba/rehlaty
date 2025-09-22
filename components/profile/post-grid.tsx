"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Post } from "@/lib/types"
import { Heart, MessageCircle, Star } from "lucide-react"
import { PostModal } from "./post-modal"

interface PostGridProps {
  posts: Post[]
}

export function PostGrid({ posts }: PostGridProps) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <Star className="h-8 w-8" />
          </div>
          <p>لا توجد منشورات بعد</p>
          <p className="text-sm">ابدأ بمشاركة تجاربك السياحية!</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1 md:gap-4">
        {posts.map((post) => (
          <Card
            key={post.id}
            className="aspect-square overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setSelectedPost(post)}
          >
            <CardContent className="p-0 relative h-full">
              <img src={post.image || "/placeholder.svg"} alt={post.caption} className="w-full h-full object-cover" />

              {/* Overlay with stats */}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
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

              {/* Rating Badge */}
              <div className="absolute top-2 left-2">
                <Badge className="bg-black/70 text-white border-0 gap-1 text-xs">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{post.rating}</span>
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Post Modal */}
      {selectedPost && <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
    </>
  )
}
