"use client"
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listFollowers, listFollowing } from '@/lib/api/users'
import { follow, unfollowByUserId } from '@/lib/api/follows'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

export function FollowersModal({ username, type, open, onClose }: { username: string; type: 'followers' | 'following'; open: boolean; onClose: () => void }) {
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q.trim()), 300)
    return () => clearTimeout(id)
  }, [q])

  const query = useInfiniteQuery({
    queryKey: ['user-list', username, type, debouncedQ],
    queryFn: async ({ pageParam }) => (type === 'followers' ? listFollowers(username, pageParam as string | undefined, 20, debouncedQ) : listFollowing(username, pageParam as string | undefined, 20, debouncedQ)),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: open,
  })

  const items = query.data?.pages.flatMap((p) => p.items) ?? []

  const toggleFollow = useMutation({
    mutationFn: async (userId: string) => {
      const isFollowing = false
      if (isFollowing) return unfollowByUserId(userId)
      return follow(userId)
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: ['user-list', username] })
    },
  })

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-4 py-3 border-b font-semibold flex items-center gap-2">
          <span>{type === 'followers' ? 'المتابِعون' : 'يتابع'} (@{username})</span>
          <input
            className="ml-auto w-40 border rounded px-2 py-1 text-sm"
            placeholder="بحث"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="p-4 overflow-y-auto divide-y">
          {items.map((u: any) => (
            <div key={u.id} className="flex items-center gap-3 py-3">
              <div className="relative h-10 w-10 rounded-full overflow-hidden">
                <Image src={u.avatar} alt={u.username} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <div className="font-medium">{u.displayName}</div>
                <div className="text-xs text-muted-foreground">@{u.username}</div>
              </div>
              <button className="rounded-full border px-3 py-1 text-sm hover:bg-[#F8FAFC]" onClick={() => toggleFollow.mutate(u.id)}>
                متابعة
              </button>
            </div>
          ))}
          {query.hasNextPage && (
            <div className="text-center pt-3">
              <button className="text-sm text-[#1E88E5]" onClick={() => query.fetchNextPage()} disabled={query.isFetchingNextPage}>
                {query.isFetchingNextPage ? 'جاري التحميل...' : 'تحميل المزيد'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


