"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { Post } from "@/lib/types"
import { Heart, MessageCircle, Share, Bookmark, MapPin, Star, X } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"

interface PostModalProps {
  post: Post
  onClose: () => void
}

export function PostModal({ post, onClose }: PostModalProps) {
  const { likePost, savePost } = useAppStore()

  const handleLike = () => {
    likePost(post.id)
  }

  const handleSave = () => {
    savePost(post.id)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <div className="grid md:grid-cols-2 h-full">
          {/* Image */}
          <div className="relative bg-black">
            <img src={post.image || "/placeholder.svg"} alt={post.caption} className="w-full h-full object-contain" />
            <div className="absolute top-3 left-3">
              <Badge className="bg-black/70 text-white border-0 gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{post.rating}</span>
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={post.user.avatar || "/placeholder.svg"} alt={post.user.displayName} />
                  <AvatarFallback>{post.user.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
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
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Caption and Details */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              <div>
                <span className="font-semibold text-sm">{post.user.displayName}</span>
                <span className="text-sm mr-2">{post.caption}</span>
              </div>

              {/* Hashtags */}
              {post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.hashtags.map((hashtag, index) => (
                    <span key={index} className="text-primary text-sm">
                      #{hashtag}
                    </span>
                  ))}
                </div>
              )}

              {/* Time */}
              <div className="text-xs text-muted-foreground">
                {new Date(post.createdAt).toLocaleDateString("ar-SA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="border-t p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="sm" onClick={handleLike} className="p-0 h-auto">
                    <Heart className={cn("h-6 w-6", post.isLiked ? "fill-red-500 text-red-500" : "text-foreground")} />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    <MessageCircle className="h-6 w-6" />
                  </Button>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    <Share className="h-6 w-6" />
                  </Button>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSave} className="p-0 h-auto">
                  <Bookmark
                    className={cn("h-6 w-6", post.isSaved ? "fill-foreground text-foreground" : "text-foreground")}
                  />
                </Button>
              </div>

              <div className="text-sm font-semibold">{post.likesCount} إعجاب</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
