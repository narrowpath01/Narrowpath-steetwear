// app/products/[handle]/page.tsx

import { notFound } from "next/navigation";
import prisma from "@/lib/db";
import ProductGalleryWrapper from "@/components/ProductGalleryWrapper";
import ProductForm from "@/components/ProductForm";
import PincodeChecker from "@/components/PincodeChecker";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {

  const resolvedParams = await params;
  const handle = resolvedParams.handle;

  const product = await prisma.product.findUnique({
    where: { handle: handle },
    include: {
      images: true,
      variants: true,
    }
  });

  if (!product) {
    return notFound();
  }

  const images = product.images;

  return (
    // FIX: Changed py-12 to explicitly use pt-24 (top padding) and pb-12 (bottom padding) for mobile. 
    // This forces the white box to start below the fixed navbar.
    <main className="min-h-screen w-full bg-neutral-100 pt-16 pb-12 md:pt-32 md:pb-24 px-4 md:px-8">

      <div className="max-w-7xl mx-auto bg-white p-6 md:p-12 rounded-3xl border border-neutral-200 shadow-sm flex flex-col lg:flex-row gap-12 lg:gap-24 relative">

        {/* Left Side: Scrolling Image Stack with Dots Indicator */}
        <div className="w-full lg:w-[60%] rounded-2xl overflow-hidden lg:h-auto lg:self-stretch lg:relative lg:min-h-[550px]">
          <div className="lg:absolute lg:inset-0">
            <ProductGalleryWrapper images={images} product={product} />
          </div>
        </div>

        {/* Right Side: Sticky Info Panel */}
        <div className="w-full lg:w-[40%] text-black">
          <div className="lg:sticky lg:top-32 z-30">
            <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter mb-6 leading-none">
              {product.title}
            </h1>

            <ProductForm product={product} />
            <PincodeChecker />
          </div>
        </div>

      </div>
    </main>
  );
}