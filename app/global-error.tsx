"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
          <h2>حدث خطأ غير متوقع</h2>
          <button onClick={() => reset()} className="px-3 py-1 border rounded">
            إعادة المحاولة
          </button>
          {process.env.NODE_ENV !== 'production' && (
            <pre className="text-xs text-muted-foreground mt-2 whitespace-pre-wrap">
              {error?.message}
            </pre>
          )}
        </div>
      </body>
    </html>
  )
}
