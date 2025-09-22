import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="relative h-40 md:h-56 rounded-xl overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1526779259212-939e64788e3c?q=80&w=2070&auto=format&fit=crop"
          alt="Travel banner"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1E88E5]/60 to-[#00BFA5]/60" />
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <h1 className="text-2xl md:text-3xl font-bold">من نحن</h1>
        </div>
      </div>

      <section className="mt-8 grid md:grid-cols-2 gap-8 items-start">
        <div>
          <h2 className="text-xl font-semibold text-[#1E293B]">منصة للسياح العرب في روسيا</h2>
          <p className="mt-3 text-[#475569] leading-7">
            بنينا هذه المنصة لنساعد المسافرين العرب على استكشاف روسيا بسهولة، عبر مجتمع عربي يقدم نصائح حقيقية وصور وتقييمات للأماكن.
          </p>
          <h3 className="mt-6 text-lg font-semibold text-[#1E293B]">رؤيتنا</h3>
          <p className="mt-2 text-[#475569]">
            التوسع إلى وجهات عالمية مع الحفاظ على جودة التجربة، وتعزيز الروابط الثقافية بين المسافرين والمجتمعات المحلية.
          </p>
        </div>
        <div className="relative h-56 rounded-xl overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2070&auto=format&fit=crop"
            alt="Team illustration"
            fill
            className="object-cover"
          />
        </div>
      </section>

      <section className="mt-10">
        <h3 className="text-lg font-semibold text-[#1E293B] mb-4">فريقنا</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border bg-white p-5">
              <div className="relative h-24 w-24 rounded-full overflow-hidden mx-auto">
                <Image src={`https://i.pravatar.cc/150?img=${i}`} alt="Member" fill className="object-cover" />
              </div>
              <h4 className="text-center mt-3 font-semibold text-[#1E293B]">عضو الفريق {i}</h4>
              <p className="text-center text-sm text-[#64748B]">دور الفريق</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}


