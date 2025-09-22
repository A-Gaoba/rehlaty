"use client"

import type React from "react"

import { useState, useRef, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"
import { useLanguage } from "@/components/language-provider"
import type { Conversation, Message } from "@/lib/types"
import { ArrowRight, Send, Phone, Video, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { listMessages, sendMessage } from "@/lib/api/messages"
import { realtime } from "@/lib/realtime"

interface ChatWindowProps {
  conversation: any
  onBack: () => void
}

export function ChatWindow({ conversation, onBack }: ChatWindowProps) {
  const { t } = useLanguage()
  const { currentUser, markConversationAsRead } = useAppStore()
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const qc = useQueryClient()

  const messagesQuery = useInfiniteQuery({
    queryKey: ["messages", conversation.id],
    queryFn: async ({ pageParam }) => listMessages(conversation.id, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    refetchInterval: 15000,
  })

  const messages = useMemo(() => {
    const items = messagesQuery.data?.pages.flatMap((p: any) => p.items) ?? []
    // API returns newest first; display oldest first
    return [...items].reverse() as Message[]
  }, [messagesQuery.data])

  const otherParticipant = conversation.participants.find((p) => p.id !== currentUser?.id)

  useEffect(() => {
    markConversationAsRead(conversation.id)
    scrollToBottom()
    const unsubscribe = realtime.subscribeToConversation(conversation.id, () => {
      messagesQuery.refetch()
    })
    return () => unsubscribe()
  }, [conversation.id, markConversationAsRead])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const sendMutation = useMutation({
    mutationFn: (content: string) => sendMessage(conversation.id, content),
    onMutate: async (content) => {
      await qc.cancelQueries({ queryKey: ["messages", conversation.id] })
      const prev = qc.getQueryData<any>(["messages", conversation.id])
      qc.setQueryData<any>(["messages", conversation.id], (data: any) => {
        if (!data) return data
        const optimistic: any = {
          id: `tmp-${Date.now()}`,
          conversationId: conversation.id,
          senderId: currentUser?.id,
          content,
          type: "text",
          isRead: false,
          createdAt: new Date().toISOString(),
        }
        const pages = data.pages.slice()
        // add to last page (oldest) for ascending display after reverse
        pages[pages.length - 1] = {
          ...pages[pages.length - 1],
          items: [...pages[pages.length - 1].items, optimistic],
        }
        return { ...data, pages }
      })
      return { prev }
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["messages", conversation.id], ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["messages", conversation.id] })
    },
  })

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUser) return
    const content = newMessage.trim()
    setNewMessage("")
    sendMutation.mutate(content)
  }

  const formatMessageTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!otherParticipant) return null

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="md:hidden">
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherParticipant.avatar || "/placeholder.svg"} alt={otherParticipant.displayName} />
              <AvatarFallback>{otherParticipant.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{otherParticipant.displayName}</span>
                {otherParticipant.isVerified && (
                  <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-xs">✓</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-green-600">متصل الآن</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => {
              const isOwn = message.senderId === currentUser?.id
              const sender = conversation.participants.find((p) => p.id === message.senderId)

              return (
                <div key={message.id} className={cn("flex gap-3", isOwn && "flex-row-reverse")}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={sender?.avatar || "/placeholder.svg"} alt={sender?.displayName} />
                    <AvatarFallback>{sender?.displayName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className={cn("flex flex-col gap-1", isOwn && "items-end")}>
                    <div
                      className={cn(
                        "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl",
                        isOwn
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md",
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>{formatMessageTime(message.createdAt)}</span>
                      {isOwn && (
                        <span className={cn("text-xs", message.isRead ? "text-primary" : "text-muted-foreground")}>
                          {message.isRead ? "تم القراءة" : "تم الإرسال"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={otherParticipant.avatar || "/placeholder.svg"} alt={otherParticipant.displayName} />
                  <AvatarFallback>{otherParticipant.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="bg-muted text-foreground px-4 py-2 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="اكتب رسالة..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="rounded-full"
                />
              </div>
              <Button type="submit" size="sm" disabled={!newMessage.trim()} className="rounded-full px-4">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
