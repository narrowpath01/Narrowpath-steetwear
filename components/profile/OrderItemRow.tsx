"use client";

import { OrderItem } from "./types";
import { getOptimizedCloudinaryUrl } from "@/lib/cloudinary";

interface OrderItemRowProps {
  item: OrderItem;
}

export default function OrderItemRow({ item }: OrderItemRowProps) {
  const rawUrl = item.variant?.product?.images?.[0]?.url;
  const productThumbnail = rawUrl ? getOptimizedCloudinaryUrl(rawUrl, { width: 160 }) : "/placeholder-clothing.png";

  return (
    <div className="py-4 flex gap-4 items-center first:pt-0 last:pb-0">
      {/* Thumbnail */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200 flex-shrink-0 relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={productThumbnail}
          alt={item.variant?.product?.title || "Product item"}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title & Specs */}
      <div className="flex-grow">
        <h3 className="font-extrabold text-sm sm:text-base hover:text-neutral-700 transition">
          <a href={`/products/${item.variant?.product?.id || "#"}`}>{item.variant?.product?.title}</a>
        </h3>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-500 mt-1">
          <span>Size: <strong className="text-neutral-800 uppercase">{item.variant?.title}</strong></span>
          <span>Qty: <strong className="text-neutral-800">{item.quantity}</strong></span>
        </div>

        {/* Return / Exchange Policy Badge */}
        {(() => {
          const prod = item.variant?.product;
          const isCustom = 
            prod?.collection?.toUpperCase() === "CUSTOM" ||
            prod?.handle?.toLowerCase().startsWith("custom") ||
            prod?.title?.toLowerCase().includes("custom") ||
            item.variant?.title?.toLowerCase().includes("custom");

          const isPlain = 
            prod?.collection?.toUpperCase() === "MONOCHROME" ||
            prod?.handle?.toLowerCase().includes("monochrome");

          return (
            <div className="mt-1.5 flex items-center">
              {isCustom ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-850 border border-amber-300">
                  <span>⚠️</span> Non-Returnable (Customized)
                </span>
              ) : isPlain ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-200">
                  <span>✓</span> Plain Tee • 5-Day Return / Exchange
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-200">
                  <span>✓</span> Printed Tee • 5-Day Return / Exchange
                </span>
              )}
            </div>
          );
        })()}
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        <p className="font-extrabold text-sm sm:text-base">INR {(item.price * item.quantity).toFixed(2)}</p>
        <span className="text-[10px] text-neutral-400">INR {item.price.toFixed(2)} each</span>
      </div>
    </div>
  );
}
