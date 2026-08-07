// app/page.tsx
import prisma from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import Hero from "@/components/Hero";
import HeroSlider from "@/components/HeroSlider";
import Marquee from "@/components/Marquee";
import EditorialCarousel from "@/components/EditorialCarousel";
import { InfoMarquee } from "@/components/InfoMarquee";
import { TrustBadges } from "@/components/TrustBadges";
import Link from "next/link";

export const revalidate = 60;

export default async function Home() {
  // Fetch from Postgres
  const products = await prisma.product.findMany({
    include: {
      images: true,
      variants: true,
    },
    orderBy: {
      createdAt: 'desc',
    }
  });

  const printedAll = products.filter((p: any) => p.collection === 'PRINTED' || !p.collection);
  const womenPrinted = printedAll.filter((p: any) => p.handle.startsWith("women-"));
  const printedProducts = printedAll.filter((p: any) => !p.handle.startsWith("women-"));
  const monochromeProducts = products.filter((p: any) => p.collection === 'MONOCHROME');
  const womenMono = monochromeProducts.filter((p: any) => p.handle.startsWith("women-"));
  const menMono = monochromeProducts.filter((p: any) => !p.handle.startsWith("women-"));

  // Sort printed products with both Men and Women versions to the top
  const sortedPrintedProducts = [...printedProducts].sort((a, b) => {
    const aBaseName = a.handle.replace("-heavyweight-tee", "");
    const aHasWomen = womenPrinted.some((wp: any) => wp.handle.includes(aBaseName));
    const bBaseName = b.handle.replace("-heavyweight-tee", "");
    const bHasWomen = womenPrinted.some((wp: any) => wp.handle.includes(bBaseName));

    if (aHasWomen && !bHasWomen) return -1;
    if (!aHasWomen && bHasWomen) return 1;
    return 0;
  });

  // Swap positions of Kung Fu Panda Tee and Sunflower Tee for all catalog grids (within the sorted list)
  const sunflowerIdx = sortedPrintedProducts.findIndex(p => p.handle.includes("sunflower"));
  const pandaIdx = sortedPrintedProducts.findIndex(p => p.handle.includes("panda"));
  if (sunflowerIdx !== -1 && pandaIdx !== -1) {
    const temp = sortedPrintedProducts[sunflowerIdx];
    sortedPrintedProducts[sunflowerIdx] = sortedPrintedProducts[pandaIdx];
    sortedPrintedProducts[pandaIdx] = temp;
  }

  // Hide trailing items to keep the grid perfectly filled/even on both mobile (2 columns) and desktop (4 columns)
  const printedGridCount = sortedPrintedProducts.length - (sortedPrintedProducts.length % 4);
  const printedGridProducts = sortedPrintedProducts.slice(0, printedGridCount);

  // Sort monochrome products with both Men and Women versions to the top, filtering out White Tee from homepage
  const sortedMenMono = [...menMono]
    .filter((p: any) => p.handle !== "monochrome-white-heavyweight-tee")
    .sort((a, b) => {
      const aBaseColor = a.handle.replace("monochrome-", "").replace("-heavyweight-tee", "");
      const aHasWomen = womenMono.some((wp: any) => wp.handle.includes(aBaseColor));
      const bBaseColor = b.handle.replace("monochrome-", "").replace("-heavyweight-tee", "");
      const bHasWomen = womenMono.some((wp: any) => wp.handle.includes(bBaseColor));

      if (aHasWomen && !bHasWomen) return -1;
      if (!aHasWomen && bHasWomen) return 1;
      return 0;
    });

  // Construct alternating list for homepage editorial carousel:
  // Sunflower (Man) -> Year of Dragon (Woman) -> Kung Fu Panda (Man) -> Love Peace Patience (Woman)
  const sunflowerMan = printedProducts.find(p => p.handle === "sunflower-heavyweight-tee");
  const dragonWoman = womenPrinted.find(p => p.handle === "women-year-of-dragon-heavyweight-tee");
  const pandaMan = printedProducts.find(p => p.handle === "kung-fu-panda-heavyweight-tee");
  const lovePeaceWoman = womenPrinted.find(p => p.handle === "women-love-peace-patience-heavyweight-tee");

  const carouselProducts = [];
  if (sunflowerMan) carouselProducts.push(sunflowerMan);
  if (dragonWoman) carouselProducts.push(dragonWoman);
  if (pandaMan) carouselProducts.push(pandaMan);
  if (lovePeaceWoman) carouselProducts.push(lovePeaceWoman);

  const finalCarouselProducts = carouselProducts.length === 4 ? carouselProducts : printedProducts;

  return (
    <main className="min-h-screen bg-white text-black">

      {/* Hero Slider Banner */}
      <HeroSlider />

      {/* Homepage Collections Section */}
      <section className="py-12 bg-white text-black max-w-[1600px] mx-auto px-4 md:px-8 border-b border-neutral-100">
        <div className="text-center mb-10">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Our Catalog</span>
          <h2 className="text-3xl font-black uppercase tracking-widest text-black mt-2">Collections</h2>
          <div className="h-[2px] w-12 bg-black mx-auto mt-4"></div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* 1. Men's Collection Card */}
          <Link href="/shop?gender=men" className="group block relative">
            <div className="relative aspect-[3/4] w-full rounded-[24px] overflow-hidden bg-neutral-50 border border-neutral-100 shadow-sm transition-all duration-500 group-hover:shadow-md">
              <img
                src="/sunflower-back.png"
                alt="Men's Collection"
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-90"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <span className="text-[9px] font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                  BOLD & GRAPHIC
                </span>
                <h3 className="text-2xl font-black uppercase tracking-wider mt-3">Men</h3>
                <p className="text-xs text-neutral-300 font-medium mt-1 uppercase tracking-wider">
                  Browse Men's Collection
                </p>
              </div>
            </div>
          </Link>

          {/* 2. Women's Collection Card */}
          <Link href="/shop?gender=women" className="group block relative">
            <div className="relative aspect-[3/4] w-full rounded-[24px] overflow-hidden bg-neutral-50 border border-neutral-100 shadow-sm transition-all duration-500 group-hover:shadow-md">
              <img
                src="/women-sunflower-1.png"
                alt="Women's Collection"
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-90"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <span className="text-[9px] font-bold uppercase tracking-widest bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                  Clean & Minimalist
                </span>
                <h3 className="text-2xl font-black uppercase tracking-wider mt-3">Women</h3>
                <p className="text-xs text-neutral-300 font-medium mt-1 uppercase tracking-wider">
                  Browse Women's Collection
                </p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Editorial Carousel */}
      <EditorialCarousel products={finalCarouselProducts} />

      {/* Latest Drops Section */}
      <section className="py-10 px-4 md:px-8 max-w-[1600px] mx-auto space-y-12">
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-[20px] lg:text-[20px] font-black uppercase tracking-widest text-neutral-600">Latest Drops</h2>
          </div>

          {/* Printed Collection */}
          <div className="space-y-4">
            <div className="text-[11px] font-normal text-black uppercase tracking-widest pl-0.5">
              Printed
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-2 gap-y-8">
              {printedGridProducts.map((product) => {
                const baseName = product.handle.replace("-heavyweight-tee", "");
                const womenProduct = womenPrinted.find((wp: any) => wp.handle.includes(baseName));
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    womenProduct={womenProduct}
                    defaultGender="men"
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Monochrome Collection */}
        {sortedMenMono.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-neutral-100">
            <div className="text-[11px] font-normal text-black uppercase tracking-widest pl-0.5">
              Monochrome
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-2 gap-y-8">
              {sortedMenMono.map((product) => {
                const baseColor = product.handle.replace("monochrome-", "").replace("-heavyweight-tee", "");
                const womenProduct = womenMono.find((wp: any) => wp.handle.includes(baseColor));
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    womenProduct={womenProduct}
                    defaultGender="men"
                  />
                );
              })}
            </div>
          </div>
        )}
      </section>

      <InfoMarquee />
      <TrustBadges />

    </main>
  );
}