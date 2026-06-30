// app/shop/[handle]/page.tsx
import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import Image from "next/image";
import AddToCartForm from "./AddToCartForm"; 

const prisma = new PrismaClient();

// In Next.js 15+, params is an async promise. We await it.
export default async function ProductPage({ params }: { params: Promise<{ handle: string }> }) {
  const resolvedParams = await params;
  
  const product = await prisma.product.findUnique({
    where: { handle: resolvedParams.handle },
    include: {
      images: true,
      variants: true, // Pulls all S, M, L sizes
    }
  });

  if (!product) {
    notFound(); // Triggers the Next.js 404 page if the URL handle is wrong
  }

  return (
    <main className="pt-32 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
        
        {/* Massive Brutalist Image Container */}
        <div className="relative aspect-[4/5] bg-neutral-100 border border-neutral-200 w-full sticky top-32">
          {product.images[0] && (
            <Image 
              src={product.images[0].url} 
              alt={product.title} 
              fill 
              className="object-cover" 
              priority
            />
          )}
        </div>

        {/* Product Details & Selection */}
        <div className="flex flex-col justify-center py-12">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-black mb-4 leading-none">
            {product.title}
          </h1>
          <p className="text-xl font-medium text-neutral-500 mb-8">
            ₹{product.variants[0]?.price}
          </p>
          <div className="w-12 h-1 bg-black mb-8"></div>
          <p className="text-sm text-neutral-600 mb-12 leading-relaxed max-w-md">
            {product.description}
          </p>

          {/* Inject the Client Component for interactivity */}
          <AddToCartForm product={product} />
        </div>

      </div>
    </main>
  );
}