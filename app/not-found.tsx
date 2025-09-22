export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-4 sm:p-6">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">الصفحة غير موجودة</h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-6">
          تأكد من الرابط أو عد إلى الصفحة الرئيسية.
        </p>
        <a
          href="/"
          className="inline-block w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-center"
        >
          العودة للرئيسية
        </a>
      </div>
    </div>
  )
}


