// components/ProductGallery.tsx
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
            src={image.url}
            alt={image.altText || `Product image ${index + 1}`}
            className="w-full h-auto block select-none object-contain rounded-2xl"
          />
        </div>
      ))}
    </div>
  );
}