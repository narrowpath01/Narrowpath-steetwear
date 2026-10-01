import Link from "next/link";
import Image from "next/image";

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-neutral-100 py-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center text-black">
      <div className="max-w-6xl w-full bg-white rounded-[32px] p-6 md:p-12 shadow-xl border border-neutral-200/60">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Our Catalog</span>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-black mt-2">Collections</h1>
          <div className="h-[2px] w-12 bg-black mx-auto mt-4"></div>
        </div>

        {/* Collections Grid */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12">

          {/* 1. Printed Collection Card */}
          <Link href="/shop?type=printed" className="group block relative">
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-100 shadow-sm transition-all duration-500 group-hover:shadow-md">
              <Image
                src="https://res.cloudinary.com/lhqxzevt/image/upload/v1790840509/sunflower-back.png"
                alt="Printed Tee Collection"
                fill
                className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 500px"
                priority
              />
              {/* Overlay Layer */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-90 transition-opacity duration-300"></div>

              {/* Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <span className="text-[9px] font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                  Bold & Graphic
                </span>
                <h2 className="text-2xl font-black uppercase tracking-wider mt-3">Printed Tees</h2>
                <p className="text-xs text-neutral-300 font-medium mt-1 uppercase tracking-wider">
                  Browse Graphic Collections
                </p>
              </div>
            </div>
          </Link>

          {/* 2. Monochrome Collection Card */}
          <Link href="/shop?type=monochrome" className="group block relative">
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-neutral-50 border border-neutral-100 shadow-sm transition-all duration-500 group-hover:shadow-md">
              <Image
                src="https://res.cloudinary.com/lhqxzevt/image/upload/v1790840404/monochrome-red-front.png"
                alt="Monochrome Tee Collection"
                fill
                className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 500px"
              />
              {/* Overlay Layer */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-90 transition-opacity duration-300"></div>

              {/* Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <span className="text-[9px] font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                  Clean & Minimalist
                </span>
                <h2 className="text-2xl font-black uppercase tracking-wider mt-3">Monochrome Tees</h2>
                <p className="text-xs text-neutral-300 font-medium mt-1 uppercase tracking-wider">
                  Browse Plain & Heavy Solids
                </p>
              </div>
            </div>
          </Link>

        </div>

      </div>
    </div>
  );
}
