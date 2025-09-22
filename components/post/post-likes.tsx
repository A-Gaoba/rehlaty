"use client"

import { useInfiniteQuery } from '@tanstack/react-query'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export function PostLikes({ postId }: { postId: string }) {
  const query = useInfiniteQuery({
    queryKey: ['post-likes', postId],
    queryFn: async ({ pageParam }) => {
      const qs = new URLSearchParams()
      if (pageParam) qs.set('cursor', pageParam as string)
      const res = await fetch(`/api/posts/${postId}/likes?${qs.toString()}`, { credentials: 'include' })
      return await res.json()
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  })

  const items = query.data?.pages.flatMap((p: any) => p.items) ?? []

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground">لا توجد إعجابات بعد</div>
      ) : (
        <ul className="space-y-2">
          {items.map((u: any) => (
            <li key={u.id} className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={u.avatar || '/placeholder.svg'} alt={u.displayName} />
                <AvatarFallback>{u.displayName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <div className="font-medium">{u.displayName}</div>
                <div className="text-muted-foreground">@{u.username}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {query.hasNextPage && (
        <Button size="sm" variant="outline" onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage}>
          {query.isFetchingNextPage ? 'جاري التحميل…' : 'تحميل المزيد'}
        </Button>
      )}
    </div>
  )
}


