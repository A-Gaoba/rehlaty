"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppStore } from "@/lib/store"
import { useLanguage } from "@/components/language-provider"
import { getMockCommentsForPost } from "@/lib/mock-data"
import { Heart, Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface CommentsSectionProps {
  postId: string
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const { t } = useLanguage()
  const { addComment, likeComment, currentUser } = useAppStore()
  const [newComment, setNewComment] = useState("")
  const comments = getMockCommentsForPost(postId)

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !currentUser) return

    addComment({
      postId,
      userId: currentUser.id,
      user: currentUser,
      content: newComment.trim(),
    })
    setNewComment("")
  }

  const handleLikeComment = (commentId: string) => {
    likeComment(commentId)
  }

  return (
    <div className="border-t bg-muted/30">
      {/* Comments List */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.displayName} />
              <AvatarFallback>{comment.user.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="bg-muted rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{comment.user.displayName}</span>
                  {comment.user.isVerified && (
                    <div className="w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-xs">✓</span>
                    </div>
                  )}
                </div>
                <p className="text-sm">{comment.content}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>
                  {new Date(comment.createdAt).toLocaleDateString("ar-SA", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLikeComment(comment.id)}
                  className="p-0 h-auto text-xs"
                >
                  <Heart
                    className={cn(
                      "h-3 w-3 mr-1",
                      comment.isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground",
                    )}
                  />
                  {comment.likesCount > 0 && comment.likesCount}
                </Button>
                <Button variant="ghost" size="sm" className="p-0 h-auto text-xs text-muted-foreground">
                  رد
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Comment */}
      <div className="p-4 border-t">
        <form onSubmit={handleAddComment} className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentUser?.avatar || "/placeholder.svg"} alt={currentUser?.displayName} />
            <AvatarFallback>{currentUser?.displayName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 flex gap-2">
            <Input
              type="text"
              placeholder="اكتب تعليقاً..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={!newComment.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
