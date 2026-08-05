// app/shop/page.tsx
import prisma from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

interface ShopPageProps {
  searchParams: Promise<{ type?: string; gender?: string }>;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const { type, gender } = await searchParams;
  const activeGender = gender?.toLowerCase() || "all";

  const products = await prisma.product.findMany({
    include: {
      images: true,
      variants: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  const printedAll = products.filter((p: any) => p.collection === 'PRINTED' || !p.collection);
  const womenPrinted = printedAll.filter((p: any) => p.handle.startsWith("women-"));
  const printedProducts = printedAll.filter((p: any) => !p.handle.startsWith("women-"));

  const monochromeProducts = products.filter((p: any) => p.collection === 'MONOCHROME');

  const womenMono = monochromeProducts.filter((p: any) => p.handle.startsWith("women-"));
  const menMono = monochromeProducts.filter((p: any) => !p.handle.startsWith("women-"));

  // Swap positions of Kung Fu Panda Tee and Sunflower Tee for all catalog grids
  const sunflowerIdx = printedProducts.findIndex(p => p.handle.includes("sunflower"));
  const pandaIdx = printedProducts.findIndex(p => p.handle.includes("panda"));
  if (sunflowerIdx !== -1 && pandaIdx !== -1) {
    const temp = printedProducts[sunflowerIdx];
    printedProducts[sunflowerIdx] = printedProducts[pandaIdx];
    printedProducts[pandaIdx] = temp;
  }

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
          {(type || gender) && (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full">
              Filtered: {type || ""} {gender ? `Gender: ${gender}` : ""}
            </span>
          )}
        </div>

        {/* 1. Printed Collection Section */}
        {showPrinted && (activeGender === "women" ? womenPrinted.length > 0 : printedProducts.length > 0) && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-black uppercase tracking-wider text-black">
                {activeGender === "women"
                  ? "Women's Printed Tees"
                  : activeGender === "men"
                  ? "Men's Printed Tees"
                  : "Printed Tees"}
              </h2>
              <div className="h-[1px] flex-1 bg-neutral-100"></div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
              {activeGender === "women"
                ? womenPrinted.map((womenProd) => {
                    const baseName = womenProd.handle
                      .replace("women-", "")
                      .replace("-heavyweight-tee", "");
                    const menProduct = printedProducts.find((mp: any) => mp.handle.includes(baseName));
                    return (
                      <ProductCard 
                        key={womenProd.id} 
                        product={menProduct || womenProd} 
                        womenProduct={menProduct ? womenProd : undefined}
                        defaultGender="women"
                      />
                    );
                  })
                : printedProducts.map((product) => {
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
        )}

        {/* Spacer if both are shown */}
        {!type && (activeGender === "women" ? womenPrinted.length > 0 && womenMono.length > 0 : printedProducts.length > 0 && menMono.length > 0) && (
          <div className="h-6"></div>
        )}

        {/* 2. Plain/Monochrome Collection Section */}
        {showMonochrome && (activeGender === "women" ? womenMono.length > 0 : menMono.length > 0) && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-black uppercase tracking-wider text-black">
                {activeGender === "women"
                  ? "Women's Plain Tees"
                  : activeGender === "men"
                  ? "Men's Plain Tees"
                  : "Monochrome Tees"}
              </h2>
              <div className="h-[1px] flex-1 bg-neutral-100"></div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
              {activeGender === "women"
                ? womenMono.map((womenProd) => {
                    const baseColor = womenProd.handle
                      .replace("women-monochrome-", "")
                      .replace("-heavyweight-tee", "");
                    const menProduct = menMono.find((mp: any) => mp.handle.includes(baseColor));
                    return (
                      <ProductCard 
                        key={womenProd.id} 
                        product={menProduct || womenProd} 
                        womenProduct={menProduct ? womenProd : undefined}
                        defaultGender="women"
                      />
                    );
                  })
                : menMono.map((product) => {
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

        {/* No Products Fallback */}
        {((showPrinted && (activeGender === "women" ? womenPrinted.length === 0 : printedProducts.length === 0)) || 
          (showMonochrome && (activeGender === "women" ? womenMono.length === 0 : menMono.length === 0))) && 
         (activeGender === "women" ? (womenPrinted.length === 0 && womenMono.length === 0) : (printedProducts.length === 0 && menMono.length === 0)) && (
          <div className="text-center py-20">
            <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">No products found in this category.</p>
          </div>
        )}

      </div>
    </main>
  );
}