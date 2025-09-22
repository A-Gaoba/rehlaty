"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"
import { useLanguage } from "@/components/language-provider"
import { getMockPostsByUserId, getMockFollowersCount, getMockFollowingCount } from "@/lib/mock-data"
import { Settings, Calendar, Grid3X3, Map, Star, UserPlus, MessageCircle } from "lucide-react"
import { FollowersModal } from './followers-modal'
import { EditProfileModal } from './edit-profile-modal'
import { apiFetch } from "@/lib/api/client"
import { PostGrid } from "./post-grid"
import { VisitedMap } from "./visited-map"
import { RatingsList } from "./ratings-list"

export function ProfilePage() {
  const { t } = useLanguage()
  const { currentUser } = useAppStore()
  const [activeTab, setActiveTab] = useState("posts")
  const [followersOpen, setFollowersOpen] = useState(false)
  const [followingOpen, setFollowingOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  if (!currentUser) return null

  const userPosts = getMockPostsByUserId(currentUser.id)
  const followersCount = getMockFollowersCount(currentUser.id)
  const followingCount = getMockFollowingCount(currentUser.id)

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-0">
          {/* Cover Photo */}
          <div className="relative h-48 bg-gradient-to-r from-primary/20 to-accent/20 overflow-hidden">
            <img
              src={currentUser.coverPhoto || "/placeholder.svg"}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4">
              <Button variant="secondary" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Profile Info */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="h-24 w-24 -mt-12 border-4 border-background">
                  <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.displayName} />
                  <AvatarFallback className="text-2xl">{currentUser.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-center md:text-right mt-4">
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <h1 className="text-2xl font-bold">{currentUser.displayName}</h1>
                    {currentUser.isVerified && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-foreground text-sm">✓</span>
                      </div>
                    )}
                  </div>
                  <p className="text-muted-foreground">@{currentUser.username}</p>
                </div>
              </div>

              {/* Stats and Actions */}
              <div className="flex-1">
                <div className="flex justify-center md:justify-start gap-6 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{userPosts.length}</div>
                    <div className="text-sm text-muted-foreground">{t("posts")}</div>
                  </div>
                  <button className="text-center" onClick={() => setFollowersOpen(true)}>
                    <div className="text-2xl font-bold">{followersCount}</div>
                    <div className="text-sm text-muted-foreground">{t("followers")}</div>
                  </button>
                  <button className="text-center" onClick={() => setFollowingOpen(true)}>
                    <div className="text-2xl font-bold">{followingCount}</div>
                    <div className="text-sm text-muted-foreground">{t("following")}</div>
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 justify-center md:justify-start">
                  <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                    تعديل الملف الشخصي
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    title="Follow"
                    onClick={async () => {
                      // Example follow by username lookup; in production, pass userId
                      try {
                        await apiFetch(`/api/follows`, { method: 'POST', body: JSON.stringify({ followingId: currentUser.id }) })
                      } catch { }
                    }}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    title="Message"
                    onClick={async () => {
                      try {
                        await apiFetch(`/api/conversations`, { method: 'POST', body: JSON.stringify({ userId: currentUser.id }) })
                      } catch { }
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6 space-y-3">
              <p className="text-sm leading-relaxed">{currentUser.bio}</p>

              {/* Interests */}
              <div className="flex flex-wrap gap-2">
                {currentUser.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>

              {/* Join Date */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  انضم في{" "}
                  {new Date(currentUser.joinedAt).toLocaleDateString('en-GB', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            <span className="hidden sm:inline">{t("posts")}</span>
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            <span className="hidden sm:inline">{t("visited")}</span>
          </TabsTrigger>
          <TabsTrigger value="ratings" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">{t("ratings")}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          <PostGrid posts={userPosts} />
        </TabsContent>

        <TabsContent value="map" className="mt-6">
          <VisitedMap posts={userPosts} />
        </TabsContent>

        <TabsContent value="ratings" className="mt-6">
          <RatingsList posts={userPosts} />
        </TabsContent>
      </Tabs>
      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
      <FollowersModal username={currentUser.username} type="followers" open={followersOpen} onClose={() => setFollowersOpen(false)} />
      <FollowersModal username={currentUser.username} type="following" open={followingOpen} onClose={() => setFollowingOpen(false)} />
    </div>
  )
}
