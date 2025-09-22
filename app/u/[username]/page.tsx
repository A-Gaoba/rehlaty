"use client"

import * as React from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api/client'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MainLayout } from '@/components/layout/main-layout'
import { useAppStore } from '@/lib/store'
import { EditProfileModal } from '@/components/profile/edit-profile-modal'
import { follow, unfollow, unfollowByUserId } from '@/lib/api/follows'
import { useInfiniteQuery } from '@tanstack/react-query'
import { listPosts } from '@/lib/api/posts'
import { listFollowers, listFollowing } from '@/lib/api/users'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function ProfileByUsernamePage() {
  const { username } = useParams<{ username: string }>()
  const { currentUser } = useAppStore()
  const effectiveUsername = username === 'me' && currentUser?.username ? currentUser.username : username
  const isOwn = currentUser?.username === effectiveUsername

  const { data, isLoading } = useQuery({
    queryKey: ['profile', effectiveUsername],
    queryFn: async () => (await apiFetch(`/api/users/${effectiveUsername}`)) as any,
  })

  if (isLoading || !data) {
    return (
      <MainLayout>
        <div className="p-6">Loading…</div>
      </MainLayout>
    )
  }

  const { user, posts, relationship } = data as { user: any; posts: any[]; relationship?: any }

  return (
    <MainLayout>
      <ProfileView user={user} posts={posts} isOwn={isOwn} relationship={relationship} />
    </MainLayout>
  )
}
function UsersListModal({ kind, username, onClose }: { kind: 'followers' | 'following'; username: string; onClose: () => void }) {
  const [cursor, setCursor] = React.useState<string | undefined>(undefined)
  const [items, setItems] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(false)
  const [hasMore, setHasMore] = React.useState(true)
  const didInit = React.useRef(false)

  const load = React.useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const fn = kind === 'followers' ? listFollowers : listFollowing
      const res = await fn(username, cursor, 20)
      setItems((prev) => {
        const map = new Map<string, any>()
        for (const u of prev) map.set(u.id, u)
        for (const u of res.items) map.set(u.id, u)
        return Array.from(map.values())
      })
      setCursor(res.nextCursor || undefined)
      setHasMore(!!res.nextCursor)
    } finally {
      setLoading(false)
    }
  }, [kind, username, cursor, loading, hasMore])

  React.useEffect(() => {
    if (didInit.current) return
    didInit.current = true
    void load()
  }, [load])

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-3 border-b font-semibold flex items-center justify-between">
          <span>{kind === 'followers' ? 'المتابعون' : 'المتابَعون'}</span>
          <button className="rounded border px-2 py-1 text-sm" onClick={onClose} aria-label="إغلاق">إغلاق</button>
        </div>
        <div className="p-4">
          {items.length === 0 && !loading ? (
            <div className="text-sm text-muted-foreground">لا يوجد</div>
          ) : (
            <ul className="space-y-3">
              {items.map((u) => (
                <li key={u.id}>
                  <Link
                    href={`/u/${u.username}`}
                    className="flex items-center gap-3 rounded px-2 py-1 hover:bg-muted/50 focus:outline focus:outline-2 focus:outline-[#1E88E5]"
                    aria-label={`عرض ملف ${u.username}`}
                    onClick={onClose}
                  >
                    <span className="relative h-8 w-8 rounded-full overflow-hidden inline-block">
                      <Image src={u.avatar || '/placeholder-user.jpg'} alt={u.username} fill className="object-cover" />
                    </span>
                    <div className="text-sm">
                      <div className="font-medium">{u.displayName}</div>
                      <div className="text-muted-foreground">@{u.username}</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {hasMore && (
            <div className="text-center mt-4">
              <button className="rounded border px-3 py-1.5 text-sm" onClick={() => load()} disabled={loading} aria-label="تحميل المزيد">
                {loading ? 'جاري التحميل…' : 'تحميل المزيد'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function useHighlights(userId: string) {
  return useQuery({
    queryKey: ['highlights', userId],
    queryFn: async () => (await apiFetch<{ items: { id: string; title: string; cover: string | null }[] }>(`/api/highlights?userId=${userId}`)).items,
  })
}

function useStories(highlightId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['stories', highlightId],
    queryFn: async () => (await apiFetch<{ items: { id: string; image: string; createdAt: string }[] }>(`/api/highlights/${highlightId}/stories`)).items,
    enabled,
  })
}

function ProfileView({ user, posts, isOwn, relationship }: { user: any; posts: any[]; isOwn: boolean; relationship?: { isFollowing: boolean; isPending: boolean; followId?: string | null; canMessage?: boolean } }) {
  const qc = useQueryClient()
  const [editOpen, setEditOpen] = React.useState(false)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<'posts' | 'tagged' | 'highlights' | 'saved'>('posts')
  const [activeHighlight, setActiveHighlight] = React.useState<string | null>(null)
  const [followersOpen, setFollowersOpen] = React.useState(false)
  const [followingOpen, setFollowingOpen] = React.useState(false)

  const { data: highlights, isLoading: hlLoading, isError: hlError } = useHighlights(user.id)
  const stories = useStories(activeHighlight || '', !!activeHighlight)

  // ARIA-compliant tabs keyboard handling
  const tabs: Array<{ key: 'posts' | 'tagged' | 'highlights' | 'saved'; label: string }> = [
    { key: 'posts', label: 'المنشورات' },
    { key: 'tagged', label: 'الإشارات' },
    { key: 'highlights', label: 'القصص المميزة' },
    ...(isOwn ? [{ key: 'saved', label: 'المحفوظات' } as const] : []),
  ]
  const tabRefs = React.useRef<Array<HTMLButtonElement | null>>([])
  function onTabKeyDown(e: React.KeyboardEvent) {
    const idx = tabs.findIndex((t) => t.key === activeTab)
    if (e.key === 'ArrowRight') {
      const n = (idx + 1) % tabs.length
      setActiveTab(tabs[n].key)
      tabRefs.current[n]?.focus()
      e.preventDefault()
    } else if (e.key === 'ArrowLeft') {
      const n = (idx - 1 + tabs.length) % tabs.length
      setActiveTab(tabs[n].key)
      tabRefs.current[n]?.focus()
      e.preventDefault()
    } else if (e.key === 'Home') {
      setActiveTab(tabs[0].key)
      tabRefs.current[0]?.focus()
      e.preventDefault()
    } else if (e.key === 'End') {
      const n = tabs.length - 1
      setActiveTab(tabs[n].key)
      tabRefs.current[n]?.focus()
      e.preventDefault()
    }
  }

  const tagged = useInfiniteQuery({
    queryKey: ['tagged', user.id],
    queryFn: ({ pageParam }) => listPosts(pageParam as string | undefined, 24, user.id),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: activeTab === 'tagged',
  })
  const taggedItems = tagged.data?.pages.flatMap((p) => p.items) ?? []

  // Saved posts (owner)
  const saved = useQuery({
    queryKey: ['saved', user.username],
    queryFn: async () => (await apiFetch<{ items: any[] }>(`/api/users/${user.username}/saved`)).items,
    enabled: isOwn && activeTab === 'saved',
  })

  const isPrivate = !!(user.isPrivate || user.privacy === 'private')

  // Owner-only create/edit/delete highlight
  const createHighlight = useMutation({
    mutationFn: async (payload: { title: string; coverImageId?: string }) =>
      apiFetch(`/api/highlights`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }),
    onSuccess: async () => {
      toast.success('تم إنشاء مجموعة القصص')
      await qc.invalidateQueries({ queryKey: ['highlights', user.id] })
    },
    onError: () => toast.error('فشل إنشاء المجموعة'),
  })

  const updateHighlight = useMutation({
    mutationFn: async (payload: { id: string; title?: string; coverImageId?: string }) =>
      apiFetch(`/api/highlights/${payload.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: payload.title, coverImageId: payload.coverImageId }) }),
    onSuccess: async () => {
      toast.success('تم تحديث المجموعة')
      await qc.invalidateQueries({ queryKey: ['highlights', user.id] })
    },
    onError: () => toast.error('فشل تحديث المجموعة'),
  })

  const deleteHighlight = useMutation({
    mutationFn: async (id: string) => apiFetch(`/api/highlights/${id}`, { method: 'DELETE' }),
    onSuccess: async () => {
      toast.success('تم حذف المجموعة')
      await qc.invalidateQueries({ queryKey: ['highlights', user.id] })
    },
    onError: () => toast.error('فشل حذف المجموعة'),
  })

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Header user={user} isOwn={isOwn} onEditOpen={() => setEditOpen(true)} onSettingsOpen={() => setSettingsOpen(true)} relationship={relationship} />

      {/* Stats row */}
      <section className="mt-2">
        <div className="flex items-center gap-6 text-sm">
          <button className="hover:underline focus:outline focus:outline-2 focus:outline-[#1E88E5]" onClick={() => setFollowersOpen(true)} aria-label="عرض المتابعين">
            <span className="font-semibold">{user.followersCount ?? 0}</span> متابعون
          </button>
          <button className="hover:underline focus:outline focus:outline-2 focus:outline-[#1E88E5]" onClick={() => setFollowingOpen(true)} aria-label="عرض المتابَعين">
            <span className="font-semibold">{user.followingCount ?? 0}</span> متابَعون
          </button>
          <div>
            <span className="font-semibold">{posts?.length ?? 0}</span> منشورات
          </div>
        </div>
      </section>

      {/* Highlights row */}
      <section className="mt-4">
        <h3 className="sr-only">القصص المميزة</h3>
        {hlLoading && <div className="text-sm text-muted-foreground">جاري التحميل…</div>}
        {hlError && <div className="text-sm text-red-600">فشل تحميل القصص المميزة</div>}
        {!hlLoading && !hlError && (
          <div className="flex items-center gap-4 overflow-x-auto py-2">
            {highlights && highlights.length === 0 && <div className="text-sm text-muted-foreground">لا توجد قصص مميزة</div>}
            {highlights?.map((h) => (
              <button
                key={h.id}
                aria-label={`عرض مجموعة ${h.title}`}
                className="shrink-0 rounded-full outline-offset-2 focus:outline focus:outline-2 focus:outline-[#1E88E5]"
                onClick={() => setActiveHighlight(h.id)}
              >
                <Image src={h.cover || '/placeholder.svg'} alt={h.title} width={72} height={72} className="rounded-full object-cover" />
                <div className="text-xs mt-1 text-center max-w-[72px] truncate">{h.title}</div>
              </button>
            ))}
            {isOwn && (
              <button
                className="shrink-0 rounded-full border px-3 py-2 text-xs outline-offset-2 focus:outline focus:outline-2 focus:outline-[#1E88E5]"
                aria-label="إنشاء مجموعة قصص"
                onClick={() => {
                  const title = prompt('اسم المجموعة')?.trim()
                  if (!title) return
                  createHighlight.mutate({ title })
                }}
              >
                + إنشاء
              </button>
            )}
          </div>
        )}
      </section>

      {/* ARIA Tabs */}
      <div className="mt-6">
        <div role="tablist" aria-label="ملف المستخدم" className="flex gap-6 border-b" onKeyDown={onTabKeyDown}>
          {tabs.map((t, i) => (
            <button
              key={t.key}
              role="tab"
              ref={(el) => (tabRefs.current[i] = el)}
              {...(activeTab === t.key ? { 'aria-selected': true } : {})}
              aria-controls={`panel-${t.key}`}
              id={`tab-${t.key}`}
              tabIndex={activeTab === t.key ? 0 : -1}
              className={`py-2 outline-offset-2 focus:outline focus:outline-2 focus:outline-[#1E88E5] ${activeTab === t.key ? 'font-semibold border-b-2 border-[#1E88E5]' : 'text-muted-foreground'}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {isPrivate && (
          <div className="mt-4 rounded-md border bg-[#F8FAFC] p-4 text-sm">
            هذا الحساب خاص. لا يمكنك رؤية المنشورات إلا بعد قبول المتابعة.
          </div>
        )}

        <div
          role="tabpanel"
          id="panel-posts"
          aria-labelledby="tab-posts"
          hidden={activeTab !== 'posts'}
          className="mt-4"
        >
          {!isPrivate && (
            posts.length === 0 ? (
              <div className="text-sm text-muted-foreground">لا توجد منشورات</div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {posts.map((p: any) => (
                  <Link key={p.id} href={`/p/${p.id}`} aria-label="عرض تفاصيل المنشور" className="relative aspect-square rounded overflow-hidden focus:outline focus:outline-2 focus:outline-[#1E88E5]">
                    <Image src={p.image} alt={p.caption} fill sizes="33vw" className="object-cover" />
                  </Link>
                ))}
              </div>
            )
          )}
        </div>

        <div
          role="tabpanel"
          id="panel-tagged"
          aria-labelledby="tab-tagged"
          hidden={activeTab !== 'tagged'}
          className="mt-4"
        >
          {!isPrivate && (
            tagged.isLoading ? (
              <div className="text-sm text-muted-foreground">جاري التحميل…</div>
            ) : tagged.isError ? (
              <div className="text-sm text-red-600">تعذر تحميل الإشارات</div>
            ) : taggedItems.length === 0 ? (
              <div className="text-sm text-muted-foreground">لا توجد إشارات</div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {taggedItems.map((p: any) => (
                  <div key={p.id} className="relative aspect-square">
                    <Image src={p.image} alt={p.caption} fill sizes="33vw" className="object-cover rounded" />
                  </div>
                ))}
              </div>
            )
          )}
          {tagged.hasNextPage && (
            <div className="text-center mt-3">
              <Button size="sm" variant="outline" onClick={() => tagged.fetchNextPage()} disabled={tagged.isFetchingNextPage}>
                {tagged.isFetchingNextPage ? 'جاري التحميل…' : 'تحميل المزيد'}
              </Button>
            </div>
          )}
        </div>

        <div
          role="tabpanel"
          id="panel-highlights"
          aria-labelledby="tab-highlights"
          hidden={activeTab !== 'highlights'}
          className="mt-4"
        >
          {hlLoading ? (
            <div className="text-sm text-muted-foreground">جاري التحميل…</div>
          ) : hlError ? (
            <div className="text-sm text-red-600">تعذر تحميل القصص المميزة</div>
          ) : !highlights || highlights.length === 0 ? (
            <div className="text-sm text-muted-foreground">لا توجد قصص مميزة</div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {highlights.map((h) => (
                <div key={h.id} className="text-center">
                  <button className="rounded-full outline-offset-2 focus:outline focus:outline-2 focus:outline-[#1E88E5]" onClick={() => setActiveHighlight(h.id)} aria-label={`عرض مجموعة ${h.title}`}>
                    <Image src={h.cover || '/placeholder.svg'} alt={h.title} width={96} height={96} className="rounded-full object-cover" />
                  </button>
                  <div className="text-xs mt-1 truncate">{h.title}</div>
                  {isOwn && (
                    <div className="flex justify-center gap-2 mt-1 text-xs">
                      <button className="rounded border px-2 py-0.5" onClick={() => {
                        const title = prompt('اسم جديد', h.title)?.trim();
                        if (title) updateHighlight.mutate({ id: h.id, title })
                      }}>تعديل</button>
                      <button className="rounded border px-2 py-0.5" onClick={() => deleteHighlight.mutate(h.id)}>حذف</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          role="tabpanel"
          id="panel-saved"
          aria-labelledby="tab-saved"
          hidden={activeTab !== 'saved'}
          className="mt-4"
        >
          {saved.isLoading ? (
            <div className="text-sm text-muted-foreground">جاري التحميل…</div>
          ) : saved.isError ? (
            <div className="text-sm text-red-600">تعذر تحميل المحفوظات</div>
          ) : saved.data?.length === 0 ? (
            <div className="text-sm text-muted-foreground">لا توجد محفوظات</div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {saved.data?.map((p: any) => (
                <div key={p.id} className="relative aspect-square">
                  <Image src={p.image} alt={p.caption} fill sizes="33vw" className="object-cover rounded" />
                </div>
              ))}
            </div>
          )}
          {/* Saved list is finite in this view; use a dedicated page for infinite scroll if needed */}
        </div>
      </div>

      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
      {followersOpen && <UsersListModal kind="followers" username={user.username} onClose={() => setFollowersOpen(false)} />}
      {followingOpen && <UsersListModal kind="following" username={user.username} onClose={() => setFollowingOpen(false)} />}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} user={user} />}

      {/* Slideshow Modal */}
      <AnimatePresence>
        {activeHighlight && (
          <motion.div className="fixed inset-0 z-50 bg-black/90" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0" onClick={() => setActiveHighlight(null)} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              {stories.isLoading ? (
                <div className="text-white">جاري التحميل…</div>
              ) : stories.isError ? (
                <div className="text-red-300">تعذر تحميل القصص</div>
              ) : stories.data && stories.data.length > 0 ? (
                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="max-w-md w-full">
                  <div className="relative w-full" style={{ aspectRatio: '9 / 16' }}>
                    <Image src={stories.data[0].image} alt="story" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover rounded-md" />
                  </div>
                  <div className="text-center text-white mt-3 text-sm">
                    {stories.data.length} قصة
                  </div>
                </motion.div>
              ) : (
                <div className="text-white">لا توجد قصص</div>
              )}
              <button className="absolute top-4 left-4 rounded border border-white/40 text-white px-3 py-1" onClick={() => setActiveHighlight(null)} aria-label="إغلاق">إغلاق</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Header({ user, isOwn, onEditOpen, onSettingsOpen, relationship }: { user: any; isOwn: boolean; onEditOpen: () => void; onSettingsOpen: () => void; relationship?: { isFollowing: boolean; isPending: boolean; followId?: string | null; canMessage?: boolean } }) {
  const qc = useQueryClient()
  const router = useRouter()
  const [rel, setRel] = React.useState({
    isFollowing: !!relationship?.isFollowing,
    isPending: !!relationship?.isPending,
    followId: relationship?.followId || null,
  })

  React.useEffect(() => {
    setRel({
      isFollowing: !!relationship?.isFollowing,
      isPending: !!relationship?.isPending,
      followId: relationship?.followId || null,
    })
  }, [relationship?.isFollowing, relationship?.isPending, relationship?.followId])

  const followMutation = useMutation({
    mutationFn: async () => follow(user.id),
    onMutate: async () => {
      // Optimistically update
      setRel((r) => ({ ...r, isFollowing: !user.isPrivate, isPending: !!user.isPrivate }))
      await qc.cancelQueries({ queryKey: ['profile', user.username] })
      return { prev: qc.getQueryData(['profile', user.username]) }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['profile', user.username], ctx.prev as any)
      setRel({
        isFollowing: !!relationship?.isFollowing,
        isPending: !!relationship?.isPending,
        followId: relationship?.followId || null,
      })
    },
    onSuccess: (data: any) => {
      setRel((r) => ({ ...r, followId: data?.follow?.id || r.followId }))
      qc.invalidateQueries({ queryKey: ['profile', user.username] })
    },
  })

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (rel.followId) {
        await unfollow(rel.followId)
      } else {
        await unfollowByUserId(user.id)
      }
    },
    onMutate: async () => {
      setRel({ isFollowing: false, isPending: false, followId: null })
      await qc.cancelQueries({ queryKey: ['profile', user.username] })
      return { prev: qc.getQueryData(['profile', user.username]) }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['profile', user.username], ctx.prev as any)
      setRel({
        isFollowing: !!relationship?.isFollowing,
        isPending: !!relationship?.isPending,
        followId: relationship?.followId || null,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile', user.username] })
    },
  })

  const isActing = followMutation.isPending || unfollowMutation.isPending

  return (
    <>
      <div className="relative h-40 w-full rounded-lg overflow-hidden mb-4">
        <Image src={user.coverPhoto} alt={`${user.displayName} cover`} fill sizes="100vw" className="object-cover" />
        <button className="absolute top-2 left-2 rounded-full bg-white/80 px-3 py-1 text-sm outline-offset-2 focus:outline focus:outline-2 focus:outline-[#1E88E5]" aria-label="الإعدادات" onClick={onSettingsOpen}>⚙️</button>
      </div>
      <div className="flex items-center gap-4">
        <Image src={user.avatar} alt={user.displayName} width={80} height={80} className="rounded-full" />
        <div>
          <h1 className="text-xl font-bold">{user.displayName}</h1>
          <p className="text-muted-foreground">@{user.username}</p>
          <p className="text-sm mt-2">{user.bio}</p>
        </div>
        <div className="ml-auto flex gap-2">
          {isOwn ? (
            <Button onClick={onEditOpen} aria-label="تعديل الملف الشخصي">تعديل الملف الشخصي</Button>
          ) : (
            <>
              {!rel.isFollowing && !rel.isPending && (
                <Button
                  variant="outline"
                  onClick={() => followMutation.mutate()}
                  disabled={isActing}
                  aria-pressed={false}
                  aria-label="متابعة"
                >
                  {isActing ? '...' : 'متابعة'}
                </Button>
              )}
              {rel.isPending && (
                <Button variant="outline" disabled aria-pressed={true} aria-label="قيد الموافقة" title="قيد الموافقة">قيد الموافقة</Button>
              )}
              {rel.isFollowing && (
                <Button
                  variant="outline"
                  onClick={() => unfollowMutation.mutate()}
                  disabled={isActing}
                  aria-pressed={true}
                  aria-label="إلغاء المتابعة"
                  className="data-[hover=true]:bg-red-50"
                >
                  {isActing ? '...' : 'متابع'}
                </Button>
              )}
              {relationship?.canMessage && (
                <Button
                  aria-label="رسالة"
                  title="إرسال رسالة"
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ userId: user.id }) })
                      if (!res.ok) throw new Error('failed')
                      const data = await res.json()
                      router.push(`/messages/${data.id}`)
                    } catch (err) {
                      // Notify user if messaging is blocked
                      try { const { toast } = await import('sonner'); toast.error('لا يمكن إرسال رسالة إلى هذا المستخدم'); } catch (e) { }
                      // Fallback to messages list
                      router.push(`/messages`)
                    }
                  }}
                >
                  رسالة
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

function SettingsModal({ onClose, user }: { onClose: () => void; user: any }) {
  const [privacy, setPrivacy] = React.useState<'public' | 'private'>(user.privacy || (user.isPrivate ? 'private' : 'public'))
  const [likes, setLikes] = React.useState<boolean>(user.notificationPrefs?.likes ?? true)
  const [comments, setComments] = React.useState<boolean>(user.notificationPrefs?.comments ?? true)
  const [follows, setFollows] = React.useState<boolean>(user.notificationPrefs?.follows ?? true)
  const [messages, setMessages] = React.useState<boolean>(user.notificationPrefs?.messages ?? true)
  const [blocked, setBlocked] = React.useState<any[]>([])

  React.useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch<{ items: any[] }>(`/api/users/me/blocks`)
        setBlocked(res.items || [])
      } catch { }
    })()
  }, [])

  async function save() {
    try {
      await apiFetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ privacy, notificationPrefs: { likes, comments, follows, messages } }),
      })
      try { const { toast } = await import('sonner'); toast.success('تم حفظ الإعدادات'); } catch { }
      onClose()
    } catch (e) {
      try { const { toast } = await import('sonner'); toast.error('تعذر حفظ الإعدادات'); } catch (err) { }
    }
  }

  async function unblock(username: string) {
    await apiFetch(`/api/users/${username}/unblock`, { method: 'POST' })
    setBlocked((prev) => prev.filter((b) => b.username !== username))
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-3 border-b font-semibold flex items-center">الإعدادات</div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">الخصوصية</span>
            <label htmlFor="privacy" className="sr-only">الخصوصية</label>
            <select id="privacy" className="border rounded px-2 py-1 text-sm" value={privacy} onChange={(e) => setPrivacy(e.target.value as any)}>
              <option value="public">عام</option>
              <option value="private">خاص</option>
            </select>
          </div>
          <div>
            <div className="text-sm mb-2">إشعارات</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked={likes} onChange={(e) => setLikes(e.target.checked)} />الإعجابات</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={comments} onChange={(e) => setComments(e.target.checked)} />التعليقات</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={follows} onChange={(e) => setFollows(e.target.checked)} />المتابعة</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={messages} onChange={(e) => setMessages(e.target.checked)} />الرسائل</label>
            </div>
          </div>
          <div>
            <div className="text-sm mb-2">المستخدمون المحظورون</div>
            {blocked.length === 0 ? (
              <div className="text-sm text-muted-foreground">لا يوجد</div>
            ) : (
              <ul className="space-y-2 text-sm">
                {blocked.map((b) => (
                  <li key={b.id} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <span className="relative h-6 w-6 rounded-full overflow-hidden inline-block">
                        <Image src={b.avatar} alt={b.username} fill className="object-cover" />
                      </span>
                      @{b.username}
                    </span>
                    <button className="rounded border px-2 py-1" onClick={() => unblock(b.username)}>إلغاء الحظر</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="px-5 py-3 border-t flex justify-end gap-2">
          <button className="rounded-md border px-3 py-1.5 text-sm" onClick={onClose}>إلغاء</button>
          <button className="rounded-md bg-[#1E88E5] text-white px-3 py-1.5 text-sm" onClick={save}>حفظ</button>
        </div>
      </div>
    </div>
  )
}


