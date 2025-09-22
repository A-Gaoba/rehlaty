"use client"

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2>حدث خطأ غير متوقع</h2>
        <button onClick={() => reset()} className="px-3 py-1 border rounded">إعادة المحاولة</button>
      </body>
    </html>
  )
}


