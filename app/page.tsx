// app/page.tsx
import prisma from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import EditorialCarousel from "@/components/EditorialCarousel";

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

  return (
    <main className="min-h-screen bg-white text-black">

      {/* 1. Restore the Framer Motion Hero Section */}
      <Hero />

      {/* 2. Restore the Scrolling Marquee */}
      {/* <Marquee text="" /> */}

      {/* 4. Restore the Editorial Carousel */}
      <EditorialCarousel />

      {/* 3. The Live Database Product Grid */}
      <section className="py-10 px-4 md:px-8 max-w-[1600px] mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-[20px] lg:text-[20px] font-black uppercase tracking-widest text-neutral-600">Latest Drops</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-2 gap-y-8">        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        </div>
      </section>


    </main>
  );
}