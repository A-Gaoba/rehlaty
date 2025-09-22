import Image from 'next/image'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative isolate">
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=2070&auto=format&fit=crop"
            alt="Moscow skyline"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1E88E5]/70 to-[#00BFA5]/70" />
        </div>
        <div className="container mx-auto px-4 py-16 sm:py-24 md:py-32 text-white">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold leading-tight max-w-2xl">اكتشف وشارك رحلتك في روسيا</h1>
          <p className="mt-4 max-w-xl text-white/90 text-sm sm:text-base">شبكة اجتماعية للسياح العرب: استكشف، قيّم، تفاعل، وتعرّف على أفضل الوجهات.</p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
            <Link href="/auth?next=%2Fhome" className="rounded-md bg-white text-[#1E293B] px-5 py-3 text-sm font-semibold text-center">
              ابدأ الآن
            </Link>
            <Link href="/auth?next=%2Fhome" className="rounded-md border border-white/80 px-5 py-3 text-sm font-semibold text-center">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </section>

      {/* About / Goal */}
      <section className="container mx-auto px-4 py-12 sm:py-16 grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
        <div className="relative h-48 sm:h-64 md:h-80 rounded-xl overflow-hidden order-2 md:order-1">
          <Image
            src="https://images.unsplash.com/photo-1470219556762-1771e7f9427d?q=80&w=2069&auto=format&fit=crop"
            alt="Travelers in Russia"
            fill
            className="object-cover"
          />
        </div>
        <div className="order-1 md:order-2">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#1E293B]">هدف المنصة</h2>
          <p className="mt-3 text-[#334155] leading-6 sm:leading-7 text-sm sm:text-base">
            ربط السياح العرب ببعضهم وتبادل التجارب الحقيقية وتبسيط التخطيط للرحلات عبر مراجعات وصور ونصائح موثوقة.
          </p>
        </div>
      </section>

      {/* Vision & Values */}
      <section className="bg-white py-10 sm:py-14">
        <div className="container mx-auto px-4">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1E293B] mb-4 sm:mb-6">رؤيتنا وقيمنا</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              { title: 'المجتمع', desc: 'مجتمع عربي موثوق.' },
              { title: 'الاكتشاف', desc: 'اكتشف أجمل الأماكن.' },
              { title: 'مراجعات صادقة', desc: 'قصص من مسافرين حقيقيين.' },
              { title: 'نمو مستقبلي', desc: 'التوسع لوجهات عالمية.' },
            ].map((c) => (
              <div key={c.title} className="rounded-xl border bg-[#F8FAFC] p-4 sm:p-5">
                <h4 className="font-semibold text-[#1E293B] text-sm sm:text-base">{c.title}</h4>
                <p className="text-xs sm:text-sm mt-2 text-[#475569]">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="container mx-auto px-4 py-10 sm:py-14">
        <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#1E293B] mb-4 sm:mb-6">كيف تعمل المنصة؟</h3>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: '1', text: 'تصفح المنشورات والتقييمات.' },
            { step: '2', text: 'أنشئ حساباً بسهولة.' },
            { step: '3', text: 'شارك رحلتك الخاصة.' },
          ].map((s) => (
            <li key={s.step} className="rounded-xl border bg-white p-4 sm:p-5">
              <div className="w-8 h-8 rounded-full bg-[#00BFA5] text-white flex items-center justify-center font-bold text-sm sm:text-base">{s.step}</div>
              <p className="mt-3 text-[#334155] text-sm sm:text-base">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-[#1E88E5] to-[#00BFA5] text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl sm:text-2xl font-bold">جاهز لبدء مغامرتك؟</h3>
          <Link href="/auth?next=%2Fhome" className="inline-block mt-4 rounded-md bg-white text-[#1E293B] px-6 py-3 text-sm font-semibold">
            أنشئ حسابًا الآن
          </Link>
        </div>
      </section>
    </>
  )
}


