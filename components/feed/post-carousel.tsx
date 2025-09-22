"use client"

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PostCarouselProps {
  images: string[] // array of fileIds -> build as /api/uploads/{id}
  alt: string
}

export function PostCarousel({ images, alt }: PostCarouselProps) {
  const [index, setIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const total = images.length
  const go = (dir: number) => setIndex((i) => (i + dir + total) % total)

  // Keyboard navigation when focused
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1) }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) }
      else if (e.key === 'Home') { e.preventDefault(); setIndex(0) }
      else if (e.key === 'End') { e.preventDefault(); setIndex(total - 1) }
    }
    el.addEventListener('keydown', onKey)
    return () => el.removeEventListener('keydown', onKey)
  }, [total])

  // Touch swipe (simple)
  const startX = useRef<number | null>(null)
  const onTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current == null) return
    const dx = e.changedTouches[0].clientX - startX.current
    if (Math.abs(dx) > 30) go(dx < 0 ? 1 : -1)
    startX.current = null
  }

  return (
    <div
      ref={containerRef}
      className="relative outline-offset-2 focus:outline focus:outline-2 focus:outline-[#1E88E5]"
      tabIndex={0}
      role="group"
      aria-roledescription="carousel"
      aria-label="صور المنشور"
    >
      <div className="relative">
        <Image
          src={`/api/uploads/${images[index]}`}
          alt={alt}
          width={1200}
          height={1200}
          className="w-full aspect-square object-cover"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          priority={index === 0}
        />
      </div>
      {total > 1 && (
        <>
          <Button aria-label="السابق" className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50" size="sm" variant="secondary" onClick={() => go(-1)}>
            ‹
          </Button>
          <Button aria-label="التالي" className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50" size="sm" variant="secondary" onClick={() => go(1)}>
            ›
          </Button>
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
            {images.map((_, i) => (
              <span key={i} aria-hidden className={cn('h-1.5 w-1.5 rounded-full', i === index ? 'bg-white' : 'bg-white/50')} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}


