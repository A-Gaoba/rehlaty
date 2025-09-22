"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useLanguage } from "@/components/language-provider"
import { Heart, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { listComments, createComment, likeComment } from "@/lib/api/comments"
import { useAppStore } from "@/lib/store"

interface CommentsSectionProps {
  postId: string
}

export function CommentsSection({ postId }: CommentsSectionProps) {
  const { t } = useLanguage()
  const { currentUser } = useAppStore()
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")
  const qc = useQueryClient()

  const rootQuery = useInfiniteQuery({
    queryKey: ["comments", postId, "root"],
    queryFn: async ({ pageParam }) => listComments(postId, { cursor: pageParam as string | undefined, limit: 20 }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })

  const rootComments = useMemo(() => rootQuery.data?.pages.flatMap((p) => p.items) ?? [], [rootQuery.data])

  // Child component to fetch and render replies to satisfy hooks rules
  function Replies({ parentId }: { parentId: string }) {
    const { data: replies } = useQuery({
      queryKey: ["comments", postId, parentId],
      queryFn: async () => (await listComments(postId, { parentId, limit: 50 })).items,
      enabled: true,
    })
    if (!replies?.length) return null
    return (
      <div className="pl-8 space-y-3">
        {replies.map((reply: any) => (
          <div key={reply.id} className="flex gap-3">
            <Avatar className="h-7 w-7">
              <AvatarImage src={reply.user.avatar || "/placeholder.svg"} alt={reply.user.displayName} />
              <AvatarFallback>{reply.user.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-muted rounded-lg px-3 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-xs">{reply.user.displayName}</span>
                </div>
                <p className="text-sm">{reply.content}</p>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLikeComment(reply.id)}
                  className="p-0 h-auto text-xs"
                >
                  <Heart
                    className={cn(
                      "h-3 w-3 mr-1",
                      reply.isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground",
                    )}
                  />
                  {reply.likesCount > 0 && reply.likesCount}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const addMutation = useMutation({
    mutationFn: (vars: { content: string; parentId?: string }) => createComment(postId, vars),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["comments", postId] })
      const prevRoot = qc.getQueryData<any>(["comments", postId, "root"])
      const prevParent = vars.parentId ? qc.getQueryData<any>(["comments", postId, vars.parentId]) : null
      // optimistic insert at top
      if (vars.parentId) {
        qc.setQueryData<any>(["comments", postId, vars.parentId], (data: any[] | undefined) => {
          const optimistic = {
            id: `tmp-${Date.now()}`,
            postId,
            userId: currentUser?.id,
            user: currentUser,
            content: vars.content,
            likesCount: 0,
            isLiked: false,
            createdAt: new Date().toISOString(),
            parentId: vars.parentId,
          }
          return [optimistic, ...(data || [])]
        })
      } else {
        qc.setQueryData<any>(["comments", postId, "root"], (data: any) => {
          const optimistic = {
            id: `tmp-${Date.now()}`,
            postId,
            userId: currentUser?.id,
            user: currentUser,
            content: newComment.trim(),
            likesCount: 0,
            isLiked: false,
            createdAt: new Date().toISOString(),
          }
          if (!data) return data
          const copy = {
            ...data,
            pages: [{ items: [optimistic, ...(data.pages?.[0]?.items || [])], nextCursor: data.pages?.[0]?.nextCursor }, ...data.pages.slice(1)],
          }
          return copy
        })
      }
      // increment post commentsCount in posts cache
      qc.setQueryData<any>(["posts"], (data: any) => {
        if (!data) return data
        const copy = { ...data, pages: data.pages.map((p: any) => ({ ...p, items: p.items.map((it: any) => ({ ...it })) })) }
        for (const page of copy.pages) {
          const item = page.items.find((i: any) => i.id === postId)
          if (item) {
            item.commentsCount = (item.commentsCount || 0) + 1
            break
          }
        }
        return copy
      })
      return { prevRoot, prevParent }
    },
    onError: (_e, vars, ctx) => {
      if (vars.parentId) qc.setQueryData(["comments", postId, vars.parentId], ctx?.prevParent)
      else qc.setQueryData(["comments", postId, "root"], ctx?.prevRoot)
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: ["comments", postId] })
      setNewComment("")
      setReplyTo(null)
      setReplyText("")
    },
  })

  const likeMutation = useMutation({
    mutationFn: (id: string) => likeComment(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["comments", postId] })
      const allKeys = qc.getQueryCache().findAll().map((q) => q.queryKey)
      const related = allKeys.filter((k) => k[0] === "comments" && k[1] === postId)
      const prevs = related.map((k) => ({ key: k, data: qc.getQueryData<any>(k) }))
      for (const { key, data } of prevs) {
        if (!data) continue
        if (Array.isArray(data)) {
          qc.setQueryData<any>(key, data.map((c: any) => (c.id === id ? { ...c, isLiked: true, likesCount: c.likesCount + 1 } : c)))
        } else if (data.pages) {
          const copy = { ...data, pages: data.pages.map((p: any) => ({ ...p, items: p.items.map((c: any) => (c.id === id ? { ...c, isLiked: true, likesCount: c.likesCount + 1 } : c)) })) }
          qc.setQueryData<any>(key, copy)
        }
      }
      return { prevs }
    },
    onError: (_e, _id, ctx) => {
      ctx?.prevs?.forEach(({ key, data }: any) => qc.setQueryData(key, data))
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["comments", postId] })
    },
  })

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !currentUser) return
    addMutation.mutate({ content: newComment.trim(), parentId: replyTo || undefined })
  }

  const handleLikeComment = (commentId: string) => {
    likeMutation.mutate(commentId)
  }

  return (
    <div className="border-t bg-muted/30">
      {/* Comments List */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {rootComments.map((comment: any) => (
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto text-xs text-muted-foreground"
                  onClick={() => {
                    const next = replyTo === comment.id ? null : comment.id
                    setReplyTo(next)
                    if (next) setReplyText("")
                  }}
                >
                  رد
                </Button>
              </div>

              {/* Replies */}
              <Replies parentId={comment.id} />

              {/* Reply input under selected parent */}
              {replyTo === comment.id && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!replyText.trim() || !currentUser) return
                    addMutation.mutate({ content: replyText.trim(), parentId: comment.id })
                  }}
                  className="flex gap-2 mt-2"
                >
                  <Input
                    type="text"
                    placeholder="اكتب ردًا..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="sm" disabled={!replyText.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        ))}
        {rootQuery.hasNextPage && (
          <div className="text-center">
            <Button variant="outline" size="sm" onClick={() => rootQuery.fetchNextPage()} disabled={rootQuery.isFetchingNextPage}>
              {rootQuery.isFetchingNextPage ? "جاري التحميل..." : "تحميل المزيد"}
            </Button>
          </div>
        )}
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
