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
        <div className="container mx-auto px-4 py-24 md:py-32 text-white">
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight max-w-2xl">اكتشف وشارك رحلتك في روسيا</h1>
          <p className="mt-4 max-w-xl text-white/90">شبكة اجتماعية للسياح العرب: استكشف، قيّم، تفاعل، وتعرّف على أفضل الوجهات.</p>
          <div className="mt-8 flex gap-3">
            <Link href="/auth?next=%2Fhome" className="rounded-md bg-white text-[#1E293B] px-5 py-2.5 text-sm font-semibold">
              ابدأ الآن
            </Link>
            <Link href="/auth?next=%2Fhome" className="rounded-md border border-white/80 px-5 py-2.5 text-sm font-semibold">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </section>

      {/* About / Goal */}
      <section className="container mx-auto px-4 py-16 grid md:grid-cols-2 gap-8 items-center">
        <div className="relative h-64 md:h-80 rounded-xl overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1470219556762-1771e7f9427d?q=80&w=2069&auto=format&fit=crop"
            alt="Travelers in Russia"
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#1E293B]">هدف المنصة</h2>
          <p className="mt-3 text-[#334155] leading-7">
            ربط السياح العرب ببعضهم وتبادل التجارب الحقيقية وتبسيط التخطيط للرحلات عبر مراجعات وصور ونصائح موثوقة.
          </p>
        </div>
      </section>

      {/* Vision & Values */}
      <section className="bg-white py-14">
        <div className="container mx-auto px-4">
          <h3 className="text-xl md:text-2xl font-bold text-[#1E293B] mb-6">رؤيتنا وقيمنا</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'المجتمع', desc: 'مجتمع عربي موثوق.' },
              { title: 'الاكتشاف', desc: 'اكتشف أجمل الأماكن.' },
              { title: 'مراجعات صادقة', desc: 'قصص من مسافرين حقيقيين.' },
              { title: 'نمو مستقبلي', desc: 'التوسع لوجهات عالمية.' },
            ].map((c) => (
              <div key={c.title} className="rounded-xl border bg-[#F8FAFC] p-5">
                <h4 className="font-semibold text-[#1E293B]">{c.title}</h4>
                <p className="text-sm mt-2 text-[#475569]">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="container mx-auto px-4 py-14">
        <h3 className="text-xl md:text-2xl font-bold text-[#1E293B] mb-6">كيف تعمل المنصة؟</h3>
        <ol className="grid md:grid-cols-3 gap-4">
          {[
            { step: '1', text: 'تصفح المنشورات والتقييمات.' },
            { step: '2', text: 'أنشئ حساباً بسهولة.' },
            { step: '3', text: 'شارك رحلتك الخاصة.' },
          ].map((s) => (
            <li key={s.step} className="rounded-xl border bg-white p-5">
              <div className="w-8 h-8 rounded-full bg-[#00BFA5] text-white flex items-center justify-center font-bold">{s.step}</div>
              <p className="mt-3 text-[#334155]">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#1E88E5] to-[#00BFA5] text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold">جاهز لبدء مغامرتك؟</h3>
          <Link href="/auth?next=%2Fhome" className="inline-block mt-4 rounded-md bg-white text-[#1E293B] px-6 py-2.5 text-sm font-semibold">
            أنشئ حسابًا الآن
          </Link>
        </div>
      </section>
    </>
  )
}


