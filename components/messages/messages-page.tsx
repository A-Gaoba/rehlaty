"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/components/language-provider"
import { Search, Edit } from "lucide-react"
import { ChatWindow } from "./chat-window"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { listConversations } from "@/lib/api/messages"
import { useAppStore } from "@/lib/store"

export function MessagesPage() {
  const { t } = useLanguage()
  const { currentUser } = useAppStore()
  const { data } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => listConversations(),
    refetchInterval: 15000,
    enabled: !!currentUser,
  })
  const conversations = data?.items || []
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conversation: any) =>
    conversation.participants.some((participant) =>
      participant.displayName.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  )

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString("ar-SA", {
        hour: "2-digit",
        minute: "2-digit",
      })
    } else if (diffInHours < 168) {
      // Less than a week
      return date.toLocaleDateString("ar-SA", { weekday: "short" })
    } else {
      return date.toLocaleDateString("ar-SA", {
        month: "short",
        day: "numeric",
      })
    }
  }

  const getOtherParticipant = (conversation: any) => {
    return conversation.participants.find((p) => p.id !== currentUser?.id)
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="grid md:grid-cols-5 gap-6 h-[calc(100vh-8rem)]">
        {/* Conversations List */}
        <div className={cn("md:col-span-2", selectedConversation && "hidden md:block")}>
          <Card className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold">{t("messages")}</h1>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="البحث في المحادثات"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>لا توجد محادثات</p>
                  <p className="text-sm">ابدأ محادثة جديدة مع المسافرين</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredConversations.map((conversation: any) => {
                    const otherParticipant = getOtherParticipant(conversation)
                    if (!otherParticipant) return null

                    return (
                      <div
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={cn(
                          "flex items-center gap-3 p-4 hover:bg-muted/50 cursor-pointer transition-colors",
                          selectedConversation?.id === conversation.id && "bg-muted",
                        )}
                      >
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={otherParticipant.avatar || "/placeholder.svg"}
                              alt={otherParticipant.displayName}
                            />
                            <AvatarFallback>{otherParticipant.displayName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {/* Online indicator */}
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm truncate">{otherParticipant.displayName}</span>
                              {otherParticipant.isVerified && (
                                <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                  <span className="text-primary-foreground text-xs">✓</span>
                                </div>
                              )}
                            </div>
                            {conversation.lastMessage && (
                              <span className="text-xs text-muted-foreground">
                                {formatTime(conversation.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage?.content || ""}</p>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Chat Window */}
        <div className={cn("md:col-span-3", !selectedConversation && "hidden md:block")}>
          {selectedConversation ? (
            <ChatWindow conversation={selectedConversation} onBack={() => setSelectedConversation(null)} />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <Edit className="h-8 w-8" />
                </div>
                <p className="text-lg font-medium">اختر محادثة</p>
                <p className="text-sm">اختر محادثة من القائمة لبدء المراسلة</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
