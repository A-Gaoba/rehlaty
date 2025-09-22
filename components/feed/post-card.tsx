"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"
import { useLanguage } from "@/components/language-provider"
import type { Post } from "@/lib/types"
import { Heart, MessageCircle, Share, Bookmark, MapPin, Star, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { CommentsSection } from "./comments-section"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const { t } = useLanguage()
  const { likePost, savePost, currentUser } = useAppStore()
  const [showComments, setShowComments] = useState(false)

  const handleLike = () => {
    likePost(post.id)
  }

  const handleSave = () => {
    savePost(post.id)
  }

  const handleShare = () => {
    // Mock share functionality
    if (navigator.share) {
      navigator.share({
        title: post.caption,
        text: `شاهد هذا المنشور من ${post.user.displayName}`,
        url: window.location.href,
      })
    }
  }

  return (
    <Card className="overflow-hidden">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.displayName} />
            <AvatarFallback>{post.user.displayName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{post.user.displayName}</span>
              {post.user.isVerified && (
                <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-xs">✓</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>
                {post.location.name}, {post.location.city}
              </span>
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Post Image */}
      <div className="relative">
        <img src={post.image || "/placeholder.svg"} alt={post.caption} className="w-full aspect-square object-cover" />
        {/* Rating Badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-black/70 text-white border-0 gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{post.rating}</span>
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleLike} className="p-0 h-auto">
              <Heart className={cn("h-6 w-6", post.isLiked ? "fill-red-500 text-red-500" : "text-foreground")} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowComments(!showComments)} className="p-0 h-auto">
              <MessageCircle className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare} className="p-0 h-auto">
              <Share className="h-6 w-6" />
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSave} className="p-0 h-auto">
            <Bookmark className={cn("h-6 w-6", post.isSaved ? "fill-foreground text-foreground" : "text-foreground")} />
          </Button>
        </div>

        {/* Likes Count */}
        <div className="mb-2">
          <span className="font-semibold text-sm">{post.likesCount} إعجاب</span>
        </div>

        {/* Caption */}
        <div className="mb-2">
          <span className="font-semibold text-sm">{post.user.displayName}</span>
          <span className="text-sm mr-2">{post.caption}</span>
        </div>

        {/* Hashtags */}
        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {post.hashtags.map((hashtag, index) => (
              <span key={index} className="text-primary text-sm">
                #{hashtag}
              </span>
            ))}
          </div>
        )}

        {/* Comments Preview */}
        {post.commentsCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="p-0 h-auto text-muted-foreground hover:text-foreground"
          >
            عرض جميع التعليقات ({post.commentsCount})
          </Button>
        )}

        {/* Time */}
        <div className="text-xs text-muted-foreground mt-2">
          {new Date(post.createdAt).toLocaleDateString("ar-SA", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </CardContent>

      {/* Comments Section */}
      {showComments && <CommentsSection postId={post.id} />}
    </Card>
  )
}
