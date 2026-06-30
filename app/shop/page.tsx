// app/shop/page.tsx
import prisma from "@/lib/db";
import ProductCard from "@/components/ProductCard";

interface ShopPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { type } = await searchParams;

  const products = await prisma.product.findMany({
    include: {
      images: true,
      variants: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  const printedProducts = products.filter((p: any) => p.collection === 'PRINTED' || !p.collection);
  const monochromeProducts = products.filter((p: any) => p.collection === 'MONOCHROME');

  const showPrinted = !type || type.toLowerCase() === "printed";
  const showMonochrome = !type || type.toLowerCase() === "monochrome";

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      {/* The white container with rounded edges */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl p-6 md:p-12 shadow-sm border border-gray-100 space-y-12">
        
        {/* Title */}
        <div className="border-b border-neutral-100 pb-6 flex justify-between items-end">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Narrow Path</span>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-black mt-1">Shop Catalog</h1>
          </div>
          {type && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full">
              Filtered: {type}
            </span>
          )}
        </div>

        {/* 1. Printed Collection Section */}
        {showPrinted && printedProducts.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-black uppercase tracking-wider text-black">Printed Tees</h2>
              <div className="h-[1px] flex-1 bg-neutral-100"></div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
              {printedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* Spacer if both are shown */}
        {!type && printedProducts.length > 0 && monochromeProducts.length > 0 && (
          <div className="h-6"></div>
        )}

        {/* 2. Monochrome Collection Section */}
        {showMonochrome && monochromeProducts.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-black uppercase tracking-wider text-black">Monochrome Tees</h2>
              <div className="h-[1px] flex-1 bg-neutral-100"></div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
              {monochromeProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* No Products Fallback */}
        {((showPrinted && printedProducts.length === 0) || (showMonochrome && monochromeProducts.length === 0)) && 
         (printedProducts.length === 0 && monochromeProducts.length === 0) && (
          <div className="text-center py-20">
            <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">No products found in this category.</p>
          </div>
        )}

      </div>
    </main>
  );
}