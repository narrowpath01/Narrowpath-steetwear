// app/shop/page.tsx
import prisma from "@/lib/db";
import ProductCard from "@/components/ProductCard";

export default async function ShopPage() {
  // Fetch all products, including images and variants for the ProductCard component
  const products = await prisma.product.findMany({
    include: {
      images: true,
      variants: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <main className="min-h-screen bg-gray-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      {/* The white container with rounded edges */}
      <div className="max-w-7xl mx-auto bg-white rounded-3xl p-6 md:p-12 shadow-sm border border-gray-100">
        
        {/* The Product Grid (matching the homepage column count and gap ratios) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-2 gap-y-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </main>
  );
}