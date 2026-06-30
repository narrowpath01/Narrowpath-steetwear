// app/customise/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";

export default function CustomisePage() {
  const [baseColor, setBaseColor] = useState<"black" | "cream" | "red">("black");
  const [size, setSize] = useState<"S" | "M" | "L" | "XL">("M");
  const [customText, setCustomText] = useState("");
  const [placement, setPlacement] = useState<"front" | "back" | "both">("back");
  const [fileFront, setFileFront] = useState<File | null>(null);
  const [fileBack, setFileBack] = useState<File | null>(null);

  // Helper mock images for base tees
  const teeImages = {
    black: "/christ-cross-front-detail.png",
    cream: "/sunflower-front.png",
    red: "/monochrome-red-front.png"
  };

  const handleWhatsAppSubmit = () => {
    const textDetails = `Hello Narrow Path! I would like to order a Custom Heavyweight Tee:
- Base Color: ${baseColor.toUpperCase()}
- Size: ${size}
- Print Placement: ${placement.toUpperCase()}
- Custom Text: ${customText || "None"}
Please guide me on sending my print design graphics.`;

    const encodedText = encodeURIComponent(textDetails);
    window.open(`https://wa.me/919315457852?text=${encodedText}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-neutral-100 py-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center text-black">
      <div className="max-w-6xl w-full bg-white rounded-[32px] p-6 md:p-12 shadow-xl border border-neutral-200/60">
        
        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">1-of-1 Piece</span>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-black mt-2">Customise Your Tee</h1>
          <p className="text-neutral-500 text-xs mt-2 max-w-md mx-auto uppercase tracking-wide">
            Design your own heavyweight 240 GSM organic cotton drop shoulder tee.
          </p>
          <div className="h-[2px] w-12 bg-black mx-auto mt-4"></div>
        </div>

        {/* Customizer workspace */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Visual Preview Column */}
          <div className="flex flex-col items-center justify-center bg-neutral-50 rounded-2xl p-8 border border-neutral-150 relative aspect-[4/5] overflow-hidden group">
            <div className="absolute inset-0 bg-neutral-100/30"></div>
            
            {/* Visual preview graphic of tee */}
            <div className="relative w-full h-full max-w-[340px] flex items-center justify-center animate-fade-in">
              <Image 
                src={teeImages[baseColor]} 
                alt="Tee Base Preview"
                fill
                className="object-contain rounded-xl drop-shadow-2xl transition-all duration-500 group-hover:scale-[1.03]"
                sizes="400px"
                priority
              />
              
              {/* Overlay Custom text visualization */}
              {customText && (
                <div className={`absolute pointer-events-none select-none z-10 px-4 py-1 text-center font-mono font-bold tracking-widest break-all max-w-[150px] uppercase rounded border border-dashed transition-all duration-300 ${
                  baseColor === "black" 
                    ? "bg-white/80 text-black border-black/30 text-[10px]" 
                    : "bg-black/80 text-white border-white/30 text-[10px]"
                } ${
                  placement === "front" ? "top-[42%]" : "top-[52%]"
                }`}>
                  {customText.slice(0, 30)}
                </div>
              )}
            </div>

            <span className="absolute bottom-4 text-[9px] uppercase tracking-wider text-neutral-400 font-bold">
              Base Color Preview (Relaxed Drop Shoulder drape)
            </span>
          </div>

          {/* Form Options Column */}
          <div className="space-y-8">
            
            {/* Option 1: Base Color */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-500">
                1. Select Base Color
              </label>
              <div className="flex gap-4">
                {(["black", "cream", "red"] as const).map((color) => (
                  <button
                    key={color}
                    onClick={() => setBaseColor(color)}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all flex items-center justify-center gap-2 ${
                      baseColor === color
                        ? "border-black bg-black text-white"
                        : "border-neutral-200 bg-white text-black hover:border-neutral-400"
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full border border-neutral-300 ${
                      color === "black" ? "bg-black" : color === "cream" ? "bg-[#fdfbf7]" : "bg-red-600"
                    }`} />
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Option 2: Size */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-500">
                2. Select Size
              </label>
              <div className="grid grid-cols-4 gap-3">
                {(["S", "M", "L", "XL"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`py-3 rounded-xl text-xs font-black transition-all ${
                      size === s
                        ? "bg-black text-white border-2 border-black"
                        : "bg-white text-black border-2 border-neutral-200 hover:border-neutral-400"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Option 3: Placement */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-500">
                3. Print Placement
              </label>
              <div className="flex gap-4">
                {(["front", "back", "both"] as const).map((place) => (
                  <button
                    key={place}
                    onClick={() => setPlacement(place)}
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all ${
                      placement === place
                        ? "border-black bg-black text-white"
                        : "border-neutral-200 bg-white text-black hover:border-neutral-400"
                    }`}
                  >
                    {place}
                  </button>
                ))}
              </div>
            </div>

            {/* Option 4: Custom Text Overlay */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-500">
                4. Custom Text (Optional)
              </label>
              <input
                type="text"
                placeholder="Enter text to overlay (e.g., NARROW PATH)"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-black focus:outline-none text-xs sm:text-sm font-medium transition-colors bg-white text-black placeholder-neutral-400"
              />
            </div>

            {/* CTA Submit to Whatsapp */}
            <div className="pt-4 border-t border-neutral-100">
              <button
                onClick={handleWhatsAppSubmit}
                className="w-full bg-[#25d366] hover:bg-[#20ba5a] text-white py-4 rounded-full font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.09-3.977c1.649.979 3.278 1.488 4.908 1.489 5.482 0 9.943-4.461 9.947-9.947.002-2.658-1.03-5.158-2.906-7.037C16.32 2.65 13.823 1.62 11.2 1.62c-5.485 0-9.949 4.464-9.953 9.953-.001 1.706.505 3.327 1.47 4.79l-1.026 3.748 3.866-1.018z" />
                </svg>
                Submit Design via WhatsApp
              </button>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider text-center mt-2.5">
                Our designer will review and draft your mockup directly!
              </p>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
