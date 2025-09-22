"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"
import { useLanguage } from "@/components/language-provider"
import { Heart, MessageCircle, UserPlus, UserCheck, Bell, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function NotificationsPage() {
  const { t } = useLanguage()
  const { notifications, currentUser, markNotificationAsRead, markAllNotificationsAsRead, acceptFollowRequest } =
    useAppStore()

  const userNotifications = notifications.filter((n) => n.userId === currentUser?.id)
  const unreadCount = userNotifications.filter((n) => !n.isRead).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="h-5 w-5 text-red-500" />
      case "comment":
        return <MessageCircle className="h-5 w-5 text-blue-500" />
      case "follow":
        return <UserCheck className="h-5 w-5 text-green-500" />
      case "follow_request":
        return <UserPlus className="h-5 w-5 text-orange-500" />
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />
    }
  }

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return "الآن"
    } else if (diffInHours < 24) {
      return `منذ ${Math.floor(diffInHours)} ساعة`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `منذ ${diffInDays} ${diffInDays === 1 ? "يوم" : "أيام"}`
    }
  }

  const handleNotificationClick = (notificationId: string) => {
    markNotificationAsRead(notificationId)
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t("notifications")}
              {unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllNotificationsAsRead}>
                <Check className="h-4 w-4 mr-2" />
                قراءة الكل
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {userNotifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-lg font-medium">لا توجد إشعارات</p>
              <p className="text-sm">ستظهر إشعاراتك هنا عند وصولها</p>
            </div>
          ) : (
            <div className="divide-y">
              {userNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification.id)}
                  className={cn(
                    "flex items-start gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors",
                    !notification.isRead && "bg-primary/5",
                  )}
                >
                  {/* Notification Icon */}
                  <div className="mt-1">{getNotificationIcon(notification.type)}</div>

                  {/* User Avatar */}
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={notification.fromUser.avatar || "/placeholder.svg"}
                      alt={notification.fromUser.displayName}
                    />
                    <AvatarFallback>{notification.fromUser.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm">
                          <span className="font-semibold">{notification.fromUser.displayName}</span>
                          <span className="mr-1">{notification.message}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatNotificationTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.isRead && <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>}
                    </div>

                    {/* Post Preview for like/comment notifications */}
                    {notification.post && (
                      <div className="mt-2 flex items-center gap-2 p-2 bg-muted/50 rounded">
                        <img
                          src={notification.post.image || "/placeholder.svg"}
                          alt=""
                          className="w-10 h-10 object-cover rounded"
                        />
                        <p className="text-xs text-muted-foreground truncate">{notification.post.caption}</p>
                      </div>
                    )}

                    {/* Follow Request Actions */}
                    {notification.type === "follow_request" && (
                      <div className="mt-3 flex gap-2">
                        <Button size="sm" onClick={() => acceptFollowRequest(notification.id)}>
                          قبول
                        </Button>
                        <Button variant="outline" size="sm">
                          رفض
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
