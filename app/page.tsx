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

  const printedProducts = products.filter((p: any) => p.collection === 'PRINTED' || !p.collection);
  const monochromeProducts = products.filter((p: any) => p.collection === 'MONOCHROME');

  // Swap positions of Kung Fu Panda Tee and Sunflower Tee for all catalog grids
  const sunflowerIdx = printedProducts.findIndex(p => p.handle.includes("sunflower"));
  const pandaIdx = printedProducts.findIndex(p => p.handle.includes("panda"));
  if (sunflowerIdx !== -1 && pandaIdx !== -1) {
    const temp = printedProducts[sunflowerIdx];
    printedProducts[sunflowerIdx] = printedProducts[pandaIdx];
    printedProducts[pandaIdx] = temp;
  }

  return (
    <main className="min-h-screen bg-white text-black">

      {/* Hero Slider Banner */}
      <HeroSlider />

      {/* Editorial Carousel */}
      <EditorialCarousel products={printedProducts} />

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
              {printedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>

        {/* Monochrome Collection */}
        {monochromeProducts.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-neutral-100">
            <div className="text-[11px] font-normal text-black uppercase tracking-widest pl-0.5">
              Monochrome
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-2 gap-y-8">
              {monochromeProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </section>

      <InfoMarquee />
      <TrustBadges />

    </main>
  );
}