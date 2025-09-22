import type React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'رحلتي | اكتشف وشارك رحلتك في روسيا',
  description: 'شبكة عربية للسياحة في روسيا: استكشف، شارك، تواصل',
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-[#F8FAFC] text-[#1E293B]" suppressHydrationWarning>
      <header className="sticky top-0 z-50 backdrop-blur bg-white/70 border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-extrabold tracking-tight text-[#1E88E5]">رحلتي</Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/" className="hover:text-[#1E88E5] transition">الرئيسية</Link>
            <Link href="/about" className="hover:text-[#1E88E5] transition">من نحن</Link>
            <Link href="/contact" className="hover:text-[#1E88E5] transition">اتصل بنا</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/auth?next=%2Fhome" className="rounded-md border px-3 py-1.5 text-sm">تسجيل الدخول</Link>
            <Link href="/auth?next=%2Fhome" className="rounded-md bg-[#1E88E5] text-white px-3 py-1.5 text-sm hover:bg-[#1876c7]">إنشاء حساب</Link>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-white/70">
        <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">© {new Date().getFullYear()} Arabic Tourism Social</p>
          <div className="flex items-center gap-4 text-sm">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#00BFA5]">Instagram</a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-[#00BFA5]">Twitter</a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-[#00BFA5]">YouTube</a>
          </div>
        </div>
      </footer>
    </div>
  )
}


