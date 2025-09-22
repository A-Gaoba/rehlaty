"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"
import type { User } from "@/lib/types"
import { UserPlus, MessageCircle } from "lucide-react"
import { isFollowing, hasPendingFollowRequest } from "@/lib/mock-data"

interface UserCardProps {
  user: User
}

export function UserCard({ user }: UserCardProps) {
  const { currentUser, followUser, unfollowUser } = useAppStore()

  const isCurrentUser = currentUser?.id === user.id
  const isFollowingUser = currentUser ? isFollowing(currentUser.id, user.id) : false
  const hasPendingRequest = currentUser ? hasPendingFollowRequest(currentUser.id, user.id) : false

  const handleFollowClick = () => {
    if (!currentUser) return

    if (isFollowingUser) {
      unfollowUser(user.id)
    } else {
      followUser(user.id)
    }
  }

  const getFollowButtonText = () => {
    if (hasPendingRequest) return "طلب مرسل"
    if (isFollowingUser) return "إلغاء المتابعة"
    return "متابعة"
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.displayName} />
            <AvatarFallback className="text-lg">{user.displayName.charAt(0)}</AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{user.displayName}</h3>
              {user.isVerified && (
                <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground text-xs">✓</span>
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-2">@{user.username}</p>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{user.bio}</p>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <span>{user.postsCount} منشور</span>
              <span>{user.followersCount} متابع</span>
              <span>{user.followingCount} يتابع</span>
            </div>

            {/* Interests */}
            <div className="flex flex-wrap gap-1 mb-3">
              {user.interests.slice(0, 3).map((interest, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {interest}
                </Badge>
              ))}
            </div>

            {/* Action Buttons */}
            {!isCurrentUser && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={isFollowingUser ? "outline" : "default"}
                  onClick={handleFollowClick}
                  disabled={hasPendingRequest}
                  className="flex-1"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {getFollowButtonText()}
                </Button>
                <Button size="sm" variant="outline">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
