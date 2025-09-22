export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">الصفحة غير موجودة</h1>
      <p className="text-muted-foreground">تأكد من الرابط أو عد إلى الصفحة الرئيسية.</p>
      <a href="/" className="rounded-md border px-3 py-1.5">العودة للرئيسية</a>
    </div>
  )
}


