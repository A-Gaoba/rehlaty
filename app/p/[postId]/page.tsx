import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/main-layout'
import { PostCarousel } from '@/components/feed/post-carousel'
import { PostLikes } from '@/components/post/post-likes'
import { CommentsSection } from '@/components/feed/comments-section'
import { ArrowRight, ArrowLeft, X } from 'lucide-react'
import { cookies } from 'next/headers'

async function getPost(postId: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const res = await fetch(`${base}/api/posts/${postId}`, { cache: 'no-store' })
  if (!res.ok) return null
  const data = await res.json()
  return data.post as any
}

export async function generateMetadata({ params }: { params: { postId: string } }): Promise<Metadata> {
  const post = await getPost(params.postId)
  if (!post) return { title: 'Post not found' }
  const title = `${post.user?.displayName || 'رحلتي'} — ${post.caption?.slice(0, 80) || 'Post'}`
  const description = post.caption || 'منشور على رحلتي'
  const image = post.image || (post.images?.[0] as string) || '/placeholder.svg'
  const url = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/p/${params.postId}`
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image }],
      url,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default async function PostPage({ params }: { params: { postId: string } }) {
  const post = await getPost(params.postId)
  if (!post) return <div className="p-6">Post not found</div>
  const images: string[] = Array.isArray(post.imageFileIds) && post.imageFileIds.length > 0 ? post.imageFileIds : (post.images || [])
  const firstImage = images[0] ? `/api/uploads/${images[0]}` : (post.image || '/placeholder.svg')
  // Get neighbors for prev/next navigation
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const neighRes = await fetch(`${base}/api/posts/${params.postId}/neighbors`, { cache: 'no-store', headers: { cookie: (await cookies()).toString() } as any })
  const neighbors = neighRes.ok ? ((await neighRes.json()) as { prevId: string | null; nextId: string | null }) : { prevId: null, nextId: null }
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        <div className="relative">
          {/* Close button top-right */}
          <Link href="/u/me" className="absolute top-2 right-2 z-10 rounded-full bg-white/80 hover:bg-white p-2 shadow" aria-label="إغلاق">
            <X className="h-4 w-4" />
          </Link>
          {/* Nav arrows centered vertically */}
          {neighbors.prevId && (
            <Link href={`/p/${neighbors.prevId}`} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/80 hover:bg-white p-2 shadow" aria-label="المنشور السابق">
              <ArrowRight className="h-5 w-5" />
            </Link>
          )}
          {neighbors.nextId && (
            <Link href={`/p/${neighbors.nextId}`} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/80 hover:bg-white p-2 shadow" aria-label="المنشور التالي">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}
          {images.length > 1 ? (
            <PostCarousel images={images} alt={post.caption} />
          ) : (
            <div className="relative w-full" style={{ aspectRatio: '1 / 1' }}>
              <Image src={firstImage} alt={post.caption} fill sizes="(max-width: 768px) 100vw, 800px" className="object-cover rounded-md" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/u/${post.user?.username || ''}`} className="rounded-full focus:outline focus:outline-2 focus:outline-[#1E88E5]">
            <div className="relative h-10 w-10 overflow-hidden rounded-full">
              <Image src={post.user?.avatar || '/placeholder-user.jpg'} alt={post.user?.displayName || ''} fill sizes="40px" className="object-cover" />
            </div>
          </Link>
          <div>
            <Link href={`/u/${post.user?.username || ''}`} className="font-semibold text-sm hover:underline">
              {post.user?.displayName}
            </Link>
            <div className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleDateString('ar-SA')}</div>
          </div>
        </div>

        {post.caption && (
          <div className="text-sm">
            <span className="font-semibold mr-2">{post.user?.displayName}</span>
            {post.caption}
          </div>
        )}

        {Array.isArray(post.hashtags) && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.hashtags.map((h: string, i: number) => (
              <span key={i} className="text-primary text-sm">#{h}</span>
            ))}
          </div>
        )}

        {post.location && (
          <div className="text-sm text-muted-foreground">
            📍 {post.location.name}, {post.location.city}
          </div>
        )}

        <div>
          <div className="font-semibold text-sm mb-2">الإعجابات</div>
          <PostLikes postId={params.postId} />
        </div>

        <div>
          <div className="font-semibold text-sm mb-2">التعليقات</div>
          <CommentsSection postId={params.postId} />
        </div>
      </div>
    </MainLayout>
  )
}


