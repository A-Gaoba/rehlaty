"use client"
import { useState } from 'react'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Placeholder: log to console; could call /api/contact later
    console.log({ name, email, message })
    setSent(true)
  }

  return (
    <div className="container mx-auto px-4 py-12 grid lg:grid-cols-2 gap-10">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1E293B]">تواصل معنا</h1>
        <p className="mt-3 text-[#475569]">يسعدنا سماع رأيك أو استفسارك.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm text-[#334155]">الاسم</label>
            <input id="name" className="mt-1 w-full rounded-md border px-3 py-2" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm text-[#334155]">البريد الإلكتروني</label>
            <input id="email" type="email" className="mt-1 w-full rounded-md border px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm text-[#334155]">الرسالة</label>
            <textarea id="message" className="mt-1 w-full rounded-md border px-3 py-2 h-32" value={message} onChange={(e) => setMessage(e.target.value)} required />
          </div>
          <button type="submit" className="rounded-md bg-[#00BFA5] text-white px-4 py-2 font-semibold hover:bg-[#00a28d]">إرسال</button>
          {sent && <p className="text-sm text-[#0f5132]">تم إرسال رسالتك! سنرد عليك قريبًا.</p>}
        </form>
        <div className="mt-8 space-y-2 text-sm">
          <p>البريد: <a className="text-[#1E88E5]" href="mailto:hello@arabic-tourism.social">hello@arabic-tourism.social</a></p>
          <p>تيليجرام: <a className="text-[#1E88E5]" href="https://t.me/arabic_tourism_social" target="_blank" rel="noreferrer">@arabic_tourism_social</a></p>
          <p>إنستغرام: <a className="text-[#1E88E5]" href="https://instagram.com" target="_blank" rel="noreferrer">instagram.com</a></p>
        </div>
      </div>
      <div>
        <div className="relative rounded-xl overflow-hidden border aspect-video">
          <iframe
            title="Moscow"
            src="https://www.google.com/maps?q=Moscow&output=embed"
            className="w-full h-full"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  )
}


