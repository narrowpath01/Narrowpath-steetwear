// components/ProductGallery.tsx
import { getOptimizedCloudinaryUrl } from "@/lib/cloudinary";

interface ProductGalleryProps {
  images: any[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
  if (!images || images.length === 0) return <div className="bg-white w-full rounded-2xl" style={{ minHeight: "300px" }} />;

  return (
    <div className="flex flex-col gap-6">
      {images.map((image: any, index: number) => (
        <div 
          key={image.id || index} 
          className="w-full rounded-2xl overflow-hidden border border-neutral-100/50"
        >
          <img
            src={getOptimizedCloudinaryUrl(image.url, { width: 1000 })}
            alt={image.altText || `Product image ${index + 1}`}
            loading={index === 0 ? "eager" : "lazy"}
            fetchPriority={index === 0 ? "high" : "auto"}
            decoding="async"
            crossOrigin="anonymous"
            className="w-full h-auto block select-none object-contain rounded-2xl"
          />
        </div>
      ))}
    </div>
  );
}