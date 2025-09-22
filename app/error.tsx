"use client"

export const dynamic = 'force-dynamic'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 sm:p-6" suppressHydrationWarning>
      <div className="text-center max-w-md mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">حدث خطأ غير متوقع</h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-6">
          نعتذر عن هذا الخطأ. يرجى المحاولة مرة أخرى.
        </p>
        <button
          onClick={() => reset()}
          className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
      {process.env.NODE_ENV !== 'production' && (
        <div className="w-full max-w-2xl">
          <pre className="text-xs sm:text-sm text-muted-foreground bg-muted p-4 rounded-lg overflow-auto whitespace-pre-wrap">{error?.message}</pre>
        </div>
      )}
    </div>
  )
}


