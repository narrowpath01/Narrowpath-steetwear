// components/ProductForm.tsx
"use client";

import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";

interface ProductFormProps {
  product: any;
}

export default function ProductForm({ product }: ProductFormProps) {
  const sizeOrder: Record<string, number> = { "Small": 1, "Medium": 2, "Large": 3, "XL": 4, "XXL": 5, "S": 1, "M": 2, "L": 3 };

  // Intercept the raw database array and force the sort before rendering
  const variants = [...(product.variants || [])].sort(
    (a: any, b: any) => (sizeOrder[a.title] || 99) - (sizeOrder[b.title] || 99)
  );
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const router = useRouter();

  const { addItem, toggleCart } = useCartStore();

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    addItem(selectedVariant.id, {
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      productTitle: product.title,
      image: product.images?.[0]?.url || "",
    });

    toggleCart();
  };

  return (
    <div className="flex flex-col">
      {/* Price section just above select sizes */}
      <div className="mb-6 flex items-baseline gap-2">
        <span className="text-2xl md:text-3xl font-black text-black">
          INR {selectedVariant?.price || 0}
        </span>
        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
          (incl. of all taxes)
        </span>
      </div>

      {/* Color Picker for Plain/Monochrome Tees */}
      {product.collection === "MONOCHROME" && (
        <div className="mb-8">
          <span className="text-sm font-bold uppercase tracking-widest text-black block mb-4">Select Color</span>
          <div className="flex gap-3">
            {(product.handle.startsWith("women-") 
              ? [
                  { name: "Black", color: "#171717", handle: "women-monochrome-black-heavyweight-tee" },
                  { name: "Off-White", color: "#FAF9F6", handle: "women-monochrome-off-white-heavyweight-tee" },
                  { name: "Red", color: "#B91C1C", handle: "women-monochrome-red-heavyweight-tee" },
                  { name: "Brown", color: "#78350F", handle: "women-monochrome-brown-heavyweight-tee" },
                  { name: "White", color: "#FFFFFF", handle: "women-monochrome-white-heavyweight-tee" },
                ]
              : [
                  { name: "Black", color: "#171717", handle: "monochrome-black-heavyweight-tee" },
                  { name: "Off-White", color: "#FAF9F6", handle: "monochrome-off-white-heavyweight-tee" },
                  { name: "Red", color: "#B91C1C", handle: "monochrome-red-heavyweight-tee" },
                  { name: "Brown", color: "#78350F", handle: "monochrome-brown-heavyweight-tee" },
                ]
            ).map((col) => (
              <button
                key={col.handle}
                onClick={() => {
                  if (product.handle !== col.handle) {
                    router.push(`/products/${col.handle}`);
                  }
                }}
                title={col.name}
                className={`w-9 h-9 rounded-full border transition-all duration-200 ${
                  product.handle === col.handle
                    ? "border-black scale-110 ring-2 ring-neutral-200"
                    : "border-neutral-200 hover:border-neutral-400"
                }`}
                style={{ backgroundColor: col.color }}
                aria-label={`Select ${col.name} color`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-bold uppercase tracking-widest text-black">Select Size</span>
          <button 
            type="button"
            onClick={() => setIsSizeChartOpen(true)}
            className="text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-black underline transition-colors"
          >
            Size Chart
          </button>
        </div>

        {/* Round buttons for sizes */}
        <div className="flex flex-wrap gap-2.5">
          {variants.map((variant: any) => (
            <button
              key={variant.id}
              onClick={() => setSelectedVariant(variant)}
              className={`w-11 h-11 flex items-center justify-center text-xs font-black transition-all duration-200 border rounded-full ${
                selectedVariant?.id === variant.id
                  ? "border-black bg-black text-white"
                  : "border-neutral-200 bg-white text-black hover:border-black"
              }`}
            >
              {variant.title}
            </button>
          ))}
        </div>
      </div>

      {/* Add to Cart button - rounded-full */}
      <button
        onClick={handleAddToCart}
        disabled={!selectedVariant}
        className="w-full bg-black text-white py-5 rounded-full font-black uppercase tracking-widest text-sm hover:bg-neutral-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add to Cart
      </button>

      {/* Product Description */}
      <div className="mt-12 space-y-6 text-sm text-neutral-600 leading-relaxed border-t border-neutral-200 pt-8">
        <div>
          <h3 className="font-black text-black uppercase tracking-wider text-xs mb-1">Premium Cotton T-Shirt</h3>
          <p className="text-neutral-500 italic text-xs mb-4">Designed with purpose. Built for daily life.</p>
          <p className="mb-3">
            The <strong className="text-black font-semibold">Narrow Path Premium Cotton T-Shirt</strong> brings together classic style and all-day comfort. Made from high-quality cotton, it feels soft, breathable, and gentle against your skin—perfect for staying comfortable from morning to night. Whether you're out running errands, chilling at home, or making a subtle statement, this tee moves with you effortlessly.
          </p>
          <p>
            With a clean cut, sturdy construction, and a fit that feels just right, it’s the kind of staple you’ll reach for again and again. At Narrow Path, we believe what you wear should speak to who you are—rooted in quality, honesty, and self-assurance.
          </p>
        </div>

        <div>
          <h4 className="font-black text-black uppercase tracking-wider text-xs mb-3">Product Highlights</h4>
          <ul className="list-disc pl-5 space-y-2 text-neutral-600">
            <li>
              <strong className="text-black font-semibold">100% Premium 240 GSM Cotton*</strong>
              <p className="text-xs text-neutral-500 mt-0.5">Premium fabric designed for year-round comfort and lasting durability.</p>
            </li>
            <li>Reinforced stitching for added durability</li>
            <li>Pairs effortlessly with jeans, joggers, shorts, or layered looks</li>
          </ul>
          <p className="text-[10px] text-neutral-400 mt-3 italic">*Fabric composition may vary slightly by color.</p>
        </div>

        <div>
          <h4 className="font-black text-black uppercase tracking-wider text-xs mb-3">Care Instructions</h4>
          <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
            <li>Machine wash cold with like colors</li>
            <li>Turn inside out to protect print and fabric</li>
            <li>Do not bleach</li>
            <li>Tumble dry low or hang to dry</li>
            <li>Iron inside out on low heat; avoid ironing directly over the print</li>
          </ul>
        </div>

        <div>
          <h4 className="font-black text-black uppercase tracking-wider text-xs mb-2">Size & Fit</h4>
          <ul className="list-disc pl-5 space-y-1 text-neutral-600">
            <li>Oversized t-shirts</li>
            <li>Be sure to check our Size Guide before ordering to find your perfect fit</li>
          </ul>
        </div>

        <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
          <h4 className="font-black text-black uppercase tracking-wider text-[10px] mb-1">Disclaimer</h4>
          <p className="text-[11px] text-neutral-500 leading-normal">
            Please note that actual product color may vary slightly due to studio lighting and differences in screen displays.
          </p>
        </div>
      </div>

      {/* Size Chart Modal */}
      {isSizeChartOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-white text-black w-full max-w-md p-6 rounded-3xl shadow-2xl border border-neutral-100 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black uppercase tracking-wider">Size Chart</h3>
              <button 
                onClick={() => setIsSizeChartOpen(false)}
                className="p-1.5 hover:bg-neutral-100 rounded-full transition-colors text-black flex items-center justify-center"
                aria-label="Close size chart"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Subtitle */}
            <p className="text-xs text-neutral-500 mb-4 uppercase font-bold tracking-wider">
              Heavyweight Oversized Tee (Measurements in Inches)
            </p>

            {/* Table */}
            <div className="border border-neutral-200 rounded-2xl overflow-hidden mb-6">
              <table className="w-full text-center border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="p-3 font-bold uppercase tracking-wider text-neutral-600 text-left">Measure</th>
                    <th className="p-3 font-bold uppercase tracking-wider text-black">S</th>
                    <th className="p-3 font-bold uppercase tracking-wider text-black">M</th>
                    <th className="p-3 font-bold uppercase tracking-wider text-black">L</th>
                    <th className="p-3 font-bold uppercase tracking-wider text-black">XL</th>
                    <th className="p-3 font-bold uppercase tracking-wider text-black">XXL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium text-neutral-800">
                  <tr>
                    <td className="p-3 font-black bg-neutral-50/50 text-black text-left">Chest</td>
                    <td className="p-3">42</td>
                    <td className="p-3">44</td>
                    <td className="p-3">46</td>
                    <td className="p-3">48</td>
                    <td className="p-3">50</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-black bg-neutral-50/50 text-black text-left">Length</td>
                    <td className="p-3">27.5</td>
                    <td className="p-3">28</td>
                    <td className="p-3">28.5</td>
                    <td className="p-3">29</td>
                    <td className="p-3">29.5</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-black bg-neutral-50/50 text-black text-left">Shoulder</td>
                    <td className="p-3">20</td>
                    <td className="p-3">21</td>
                    <td className="p-3">22</td>
                    <td className="p-3">23</td>
                    <td className="p-3">24</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-black bg-neutral-50/50 text-black text-left">Sleeve Length</td>
                    <td className="p-3">8.5</td>
                    <td className="p-3">9</td>
                    <td className="p-3">9.5</td>
                    <td className="p-3">10</td>
                    <td className="p-3">10.5</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footnotes */}
            <div className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
              <p className="font-bold text-black uppercase tracking-wider mb-1">Fitting Guide</p>
              <p>These tees are designed with a relaxed, oversized drape. We recommend buying your normal size. If you prefer a closer fit, please size down.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}