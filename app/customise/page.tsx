// app/customise/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import Transformer from "@/components/customise/Transformer";

const base64ToBlob = (base64: string, mimeType: string) => {
  if (typeof window === "undefined") return new Blob();
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

const imageUrlToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Failed to convert image to base64:", error);
    return url;
  }
};

export default function CustomisePage() {
  const [baseColor, setBaseColor] = useState<"black" | "brown" | "off-white" | "red">("black");
  const [size, setSize] = useState<"S" | "M" | "L" | "XL">("M");

  // Slide view mode
  const [activeSlide, setActiveSlide] = useState<"front" | "back">("front");

  // Active selected design element
  const [activeElement, setActiveElement] = useState<string | null>(null);

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [generatedMockupUrl, setGeneratedMockupUrl] = useState<string | null>(null);

  // Font Dropdown open state
  const [isFontOpen, setIsFontOpen] = useState(false);

  // Interfaces for multi-layer customization
  interface CustomiseElement {
    id: string;
    type: "graphic" | "text";
    url?: string;
    name?: string;
    text?: string;
    color?: string;
    fontFamily?: string;
    x: number;
    y: number;
    rotation: number;
    size: number;
  }

  // FRONT & BACK Multi-Layer states
  const [frontElements, setFrontElements] = useState<CustomiseElement[]>([]);
  const [backElements, setBackElements] = useState<CustomiseElement[]>([]);

  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Global pointerdown listener to handle click-outside deselect
  useEffect(() => {
    const handleGlobalClick = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      if (target.closest('.transformer-container') || target.closest('.transformer-handle')) {
        return;
      }
      if (target.closest('.customizer-controls')) {
        return;
      }
      setActiveElement(null);
    };

    document.addEventListener("pointerdown", handleGlobalClick);
    return () => document.removeEventListener("pointerdown", handleGlobalClick);
  }, []);

  // Helper images for base monochrome tees
  const teeImages = {
    front: {
      black: "/monochrome-black-front.png",
      brown: "/monochrome-brown-1.png",
      "off-white": "/monochrome-offwhite-front.png",
      red: "/monochrome-red-front.png"
    },
    back: {
      black: "/monochrome-black-back.png",
      brown: "/monochrome-brown-2.png",
      "off-white": "/monochrome-offwhite-back.png",
      red: "/monochrome-red-back.png"
    }
  };

  const colorOptions = [
    { name: "White", value: "#FFFFFF" },
    { name: "Black", value: "#000000" },
    { name: "Crimson Red", value: "#DC2626" },
    { name: "Acid Yellow", value: "#EAB308" },
    { name: "Royal Blue", value: "#2563EB" },
    { name: "Forest Green", value: "#16A34A" },
    { name: "Neon Orange", value: "#EA580C" },
    { name: "Acid Purple", value: "#7C3AED" },
    { name: "Hot Pink", value: "#DB2777" },
  ];

  const fontOptions = [
    { name: "Impact (Streetwear Bold)", value: "Impact, sans-serif" },
    { name: "Courier New (Tech Monospace)", value: "'Courier New', monospace" },
    { name: "Georgia (Elegant Serif)", value: "Georgia, serif" },
    { name: "Arial Black (Modern Heavy)", value: "'Arial Black', sans-serif" },
    { name: "Trebuchet MS (Sleek Geometric)", value: "'Trebuchet MS', sans-serif" },
  ];

  // Helper actions to append graphic layers
  const addGraphic = (url: string, name: string) => {
    const newEl: CustomiseElement = {
      id: `graphic-${Date.now()}`,
      type: "graphic",
      url,
      name,
      x: 0,
      y: -40,
      rotation: 0,
      size: 100,
    };
    if (activeSlide === "front") {
      setFrontElements(prev => [...prev, newEl]);
      setActiveElement(newEl.id);
    } else {
      setBackElements(prev => [...prev, newEl]);
      setActiveElement(newEl.id);
    }
  };

  // Helper actions to append text layers
  const addText = () => {
    const newEl: CustomiseElement = {
      id: `text-${Date.now()}`,
      type: "text",
      text: "HELLO",
      color: "#FFFFFF",
      fontFamily: "Impact, sans-serif",
      x: 0,
      y: 60,
      rotation: 0,
      size: 24,
    };
    if (activeSlide === "front") {
      setFrontElements(prev => [...prev, newEl]);
      setActiveElement(newEl.id);
    } else {
      setBackElements(prev => [...prev, newEl]);
      setActiveElement(newEl.id);
    }
  };

  const updateElement = (id: string, values: Partial<CustomiseElement>) => {
    if (activeSlide === "front") {
      setFrontElements(prev => prev.map(el => el.id === id ? { ...el, ...values } : el));
    } else {
      setBackElements(prev => prev.map(el => el.id === id ? { ...el, ...values } : el));
    }
  };

  const removeElement = (id: string) => {
    if (activeSlide === "front") {
      setFrontElements(prev => prev.filter(el => el.id !== id));
    } else {
      setBackElements(prev => prev.filter(el => el.id !== id));
    }
    setActiveElement(null);
  };

  const moveElement = (id: string, direction: "up" | "down" | "top" | "bottom") => {
    const elements = activeSlide === "front" ? frontElements : backElements;
    const setElements = activeSlide === "front" ? setFrontElements : setBackElements;
    
    const index = elements.findIndex(el => el.id === id);
    if (index === -1) return;

    const newElements = [...elements];
    const [element] = newElements.splice(index, 1);

    if (direction === "top") {
      newElements.push(element);
    } else if (direction === "bottom") {
      newElements.unshift(element);
    } else if (direction === "up") {
      const targetIndex = Math.min(newElements.length, index + 1);
      newElements.splice(targetIndex, 0, element);
    } else if (direction === "down") {
      const targetIndex = Math.max(0, index - 1);
      newElements.splice(targetIndex, 0, element);
    }

    setElements(newElements);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          addGraphic(event.target.result as string, file.name);
        }
      };
      reader.readAsDataURL(file);
      e.target.value = ""; // Clear file target value
    }
  };

  const handleWhatsAppSubmit = () => {
    const frontGraphics = frontElements.filter(e => e.type === "graphic");
    const frontTexts = frontElements.filter(e => e.type === "text");
    const backGraphics = backElements.filter(e => e.type === "graphic");
    const backTexts = backElements.filter(e => e.type === "text");

    const textDetails = `Hello Narrow Path! I would like to order a Custom Heavyweight Tee:
- Price: INR 649
- Base Color: ${baseColor.toUpperCase()}
- Size: ${size}

FRONT CUSTOMISATION:
- Total Photos: ${frontGraphics.length}
${frontGraphics.map((g, idx) => `  * Photo ${idx + 1}: ${g.name || "Custom Image"}`).join("\n")}
- Total Texts: ${frontTexts.length}
${frontTexts.map((t, idx) => `  * Text ${idx + 1}: "${t.text}" (Font: ${fontOptions.find(f => f.value === t.fontFamily)?.name || "Standard"}, Color: ${t.color})`).join("\n")}

BACK CUSTOMISATION:
- Total Photos: ${backGraphics.length}
${backGraphics.map((g, idx) => `  * Photo ${idx + 1}: ${g.name || "Custom Image"}`).join("\n")}
- Total Texts: ${backTexts.length}
${backTexts.map((t, idx) => `  * Text ${idx + 1}: "${t.text}" (Font: ${fontOptions.find(f => f.value === t.fontFamily)?.name || "Standard"}, Color: ${t.color})`).join("\n")}`;

    const encodedText = encodeURIComponent(textDetails);
    window.open(`https://wa.me/919315457852?text=${encodedText}`, "_blank");
  };

  const handleDownloadImageDirectly = (url: string) => {
    const link = document.createElement("a");
    link.download = `custom-tee-${activeSlide}-${Date.now()}.png`;
    link.href = url;
    link.click();
  };

  const handleShareOrSave = async () => {
    if (!generatedMockupUrl) return;
    try {
      const blob = base64ToBlob(generatedMockupUrl, 'image/png');
      const file = new File([blob], `custom-tee-${activeSlide}.png`, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Custom Tee Design',
          text: 'Here is my custom streetwear design!',
        });
      } else {
        handleDownloadImageDirectly(generatedMockupUrl);
      }
    } catch (e) {
      console.error("Sharing failed", e);
      handleDownloadImageDirectly(generatedMockupUrl);
    }
  };

  const handleDownloadMockup = () => {
    setShowPermissionModal(true);
  };

  const triggerExport = async () => {
    setShowPermissionModal(false);
    if (!previewContainerRef.current) return;
    setIsExporting(true);

    // Save previous active selection & deselect for clean screenshot
    const prevActiveElement = activeElement;
    setActiveElement(null);

    // Give React a small paint frame to remove bounding boxes
    await new Promise((resolve) => setTimeout(resolve, 150));

    let baseImgEl: HTMLImageElement | null = null;
    let originalSrc = "";
    const graphicImages = Array.from(previewContainerRef.current.querySelectorAll("img[alt*='Graphic']") || []) as HTMLImageElement[];
    const originalGraphicSrcs = new Map<HTMLImageElement, string>();

    try {
      // 1. Temporarily swap base image to Base64 to bypass Safari WebKit SVG limitations
      baseImgEl = previewContainerRef.current.querySelector("img[alt*='Preview']") as HTMLImageElement | null;
      if (baseImgEl && baseImgEl.src) {
        originalSrc = baseImgEl.src;
        const base64Src = await imageUrlToBase64(baseImgEl.src);
        baseImgEl.src = base64Src;
      }

      // 2. Temporarily swap all custom graphics to Base64 to bypass Safari WebKit SVG limitations
      for (const img of graphicImages) {
        if (img.src && !img.src.startsWith("data:")) {
          originalGraphicSrcs.set(img, img.src);
          const base64Src = await imageUrlToBase64(img.src);
          img.src = base64Src;
        }
      }

      // Warm-up pass for Safari compatibility
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      if (isSafari) {
        try {
          await toPng(previewContainerRef.current, {
            cacheBust: false,
            skipFonts: true,
            backgroundColor: "#f5f5f5",
            pixelRatio: 1
          });
        } catch (e) {
          // Silent warmup catch
        }
      }

      // Capture mockup PNG
      const dataUrl = await toPng(previewContainerRef.current, {
        cacheBust: false,
        skipFonts: true,
        quality: 0.95,
        backgroundColor: "#f5f5f5",
        pixelRatio: window.devicePixelRatio && window.devicePixelRatio > 2 ? 2 : (window.devicePixelRatio || 1)
      });

      setGeneratedMockupUrl(dataUrl);

      // Mobile check
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

      if (isMobile) {
        try {
          handleDownloadImageDirectly(dataUrl);
        } catch (e) {
          // Silent fallback
        }
        setShowSaveModal(true);
      } else {
        handleDownloadImageDirectly(dataUrl);
      }
    } catch (error) {
      console.error("Failed to generate mockup image:", error);
      alert("Failed to export preview. Please take a screenshot of your screen to save your design!");
    } finally {
      // 3. Restore all original image sources
      if (baseImgEl && originalSrc) {
        baseImgEl.src = originalSrc;
      }
      originalGraphicSrcs.forEach((src, img) => {
        img.src = src;
      });

      setIsExporting(false);
      // Restore previous user selection
      setActiveElement(prevActiveElement);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 py-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center text-black">
      <div className="max-w-6xl w-full bg-white rounded-[32px] p-6 md:p-12 shadow-xl border border-neutral-200/60">

        {/* Header */}
        <div className="text-center mb-6">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-400">1-of-1 Piece</span>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest text-black mt-2">Customise Your Tee</h1>
          <p className="text-neutral-500 text-xs mt-2 max-w-md mx-auto uppercase tracking-wide">
            Design your own heavyweight 240 GSM organic cotton drop shoulder tee. Drag, rotate, and scale design elements.
          </p>
          <p className="text-xl font-medium text-neutral-600 mt-3.5">
            INR 649
          </p>
          <div className="h-[2px] w-12 bg-black mx-auto mt-4"></div>
        </div>

        {/* Customizer workspace */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* Visual Preview Column */}
          <div className="flex flex-col items-center">

            {/* Front/Back Swipe Selector Toggle */}
            <div className="flex gap-2 mb-4 bg-neutral-100 p-1.5 rounded-full w-48">
              <button
                onClick={() => setActiveSlide("front")}
                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-full transition-all ${activeSlide === "front" ? "bg-white text-black shadow-sm" : "text-neutral-400"
                  }`}
              >
                Front View
              </button>
              <button
                onClick={() => setActiveSlide("back")}
                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-full transition-all ${activeSlide === "back" ? "bg-white text-black shadow-sm" : "text-neutral-400"
                  }`}
              >
                Back View
              </button>
            </div>

            {/* Visual preview container - rounded with overflow hidden */}
            <div
              ref={previewContainerRef}
              className="relative w-full aspect-[4/5] bg-neutral-100 rounded-[24px] border border-neutral-200/80 overflow-hidden flex items-center justify-center group shadow-inner"
            >
              <div className="absolute inset-0 bg-neutral-100/25 z-0 pointer-events-none"></div>

              <AnimatePresence mode="wait">
                {activeSlide === "front" ? (
                  <motion.div
                    key="front-view"
                    initial={{ x: -80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 80, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <img
                      src={teeImages.front[baseColor]}
                      alt="Tee Front Preview"
                      className="absolute inset-0 w-full h-full object-cover object-top rounded-[24px] pointer-events-none select-none"
                    />

                    {frontElements.map((el) => (
                      <Transformer
                        key={el.id}
                        id={el.id}
                        x={el.x}
                        y={el.y}
                        rotation={el.rotation}
                        size={el.size}
                        isText={el.type === "text"}
                        isActive={activeElement === el.id}
                        onSelect={() => setActiveElement(el.id)}
                        onChange={(vals) => updateElement(el.id, vals)}
                        minSize={el.type === "text" ? 12 : 40}
                        maxSize={el.type === "text" ? 200 : 500}
                      >
                        {el.type === "graphic" ? (
                          <img
                            src={el.url}
                            alt={el.name || "Custom Graphic"}
                            className="w-full h-full object-contain pointer-events-none select-none"
                          />
                        ) : (
                          <p
                            style={{
                              fontFamily: el.fontFamily,
                              color: el.color,
                              fontSize: `${el.size}px`
                            }}
                            className="font-bold uppercase tracking-wider whitespace-nowrap drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.5)]"
                          >
                            {el.text || "ADD TEXT"}
                          </p>
                        )}
                      </Transformer>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="back-view"
                    initial={{ x: 80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -80, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <img
                      src={teeImages.back[baseColor]}
                      alt="Tee Back Preview"
                      className="absolute inset-0 w-full h-full object-cover object-top rounded-[24px] pointer-events-none select-none"
                    />

                    {backElements.map((el) => (
                      <Transformer
                        key={el.id}
                        id={el.id}
                        x={el.x}
                        y={el.y}
                        rotation={el.rotation}
                        size={el.size}
                        isText={el.type === "text"}
                        isActive={activeElement === el.id}
                        onSelect={() => setActiveElement(el.id)}
                        onChange={(vals) => updateElement(el.id, vals)}
                        minSize={el.type === "text" ? 12 : 40}
                        maxSize={el.type === "text" ? 200 : 500}
                      >
                        {el.type === "graphic" ? (
                          <img
                            src={el.url}
                            alt={el.name || "Custom Graphic"}
                            className="w-full h-full object-contain pointer-events-none select-none"
                          />
                        ) : (
                          <p
                            style={{
                              fontFamily: el.fontFamily,
                              color: el.color,
                              fontSize: `${el.size}px`
                            }}
                            className="font-bold uppercase tracking-wider whitespace-nowrap drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.5)]"
                          >
                            {el.text || "ADD TEXT"}
                          </p>
                        )}
                      </Transformer>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Base Color Preview Label shifted lower to prevent zoom overlap */}
            <span className="text-[9px] uppercase tracking-[0.18em] text-neutral-400 font-bold mt-5 block text-center">
              Base Color Preview (Relaxed Drop Shoulder drape)
            </span>
          </div>

          {/* Form Options Column */}
          <div className="customizer-controls lg:mt-6 space-y-8">

            {/* Option 1: Base Color */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-500">
                1. Select Base Color
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(["black", "brown", "off-white", "red"] as const).map((color) => (
                  <button
                    key={color}
                    onClick={() => setBaseColor(color)}
                    className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-wider border-2 transition-all flex items-center justify-center gap-2 ${baseColor === color
                      ? "border-black bg-black text-white"
                      : "border-neutral-200 bg-white text-black hover:border-neutral-400"
                      }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full border border-neutral-300 ${color === "black"
                      ? "bg-black"
                      : color === "brown"
                        ? "bg-[#5A4D41]"
                        : color === "off-white"
                          ? "bg-[#FAF9F6]"
                          : "bg-red-600"
                      }`} />
                    {color === "off-white" ? "Off-White" : color}
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
                    className={`py-3 rounded-xl text-xs font-black transition-all ${size === s
                      ? "bg-black text-white border-2 border-black"
                      : "bg-white text-black border-2 border-neutral-200 hover:border-neutral-400"
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Option 3: Add Design Layers */}
            <div className="space-y-3 pt-4 border-t border-neutral-100">
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-500">
                3. Add Design Layers to {activeSlide === "front" ? "Front" : "Back"}
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* Upload Photo Button */}
                <label
                  htmlFor="user-graphic-upload"
                  className="cursor-pointer py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider border-2 border-dashed border-neutral-300 text-center hover:border-neutral-500 bg-neutral-50 hover:bg-neutral-100/50 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Add Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  id="user-graphic-upload"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* Add Custom Text Button */}
                <button
                  type="button"
                  onClick={addText}
                  className="py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider border-2 border-dashed border-neutral-300 text-center hover:border-neutral-500 bg-neutral-50 hover:bg-neutral-100/50 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Text
                </button>
              </div>
            </div>

            {/* Option 4: Configure Active Layer */}
            <div className="space-y-4 pt-4 border-t border-neutral-100">
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-500">
                4. Layer Configuration
              </label>

              {(() => {
                const activeEl = (activeSlide === "front" ? frontElements : backElements).find(e => e.id === activeElement);
                const elements = activeSlide === "front" ? frontElements : backElements;

                if (!activeEl) {
                  if (elements.length === 0) {
                    return (
                      <div className="p-5 text-center bg-neutral-50 rounded-2xl border border-neutral-150 border-dashed text-neutral-400 text-xs font-medium uppercase tracking-wider leading-relaxed">
                        Select a layer on the canvas to configure it, or add new layers above.
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1">
                        Active layers ({activeSlide === "front" ? "Front" : "Back"})
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {[...elements].reverse().map((el, revIdx) => {
                          const originalIdx = elements.length - 1 - revIdx;
                          const displayName = el.type === "graphic" ? `Photo: ${el.name || "Custom Graphic"}` : `Text: "${el.text}"`;
                          
                          return (
                            <div 
                              key={el.id} 
                              className="flex items-center justify-between p-3 bg-neutral-50 hover:bg-neutral-100/70 border border-neutral-250 rounded-xl transition-all group"
                            >
                              <button
                                onClick={() => setActiveElement(el.id)}
                                className="flex-1 text-left text-xs font-bold text-neutral-800 truncate pr-2 flex items-center gap-2"
                              >
                                <span className="w-4.5 h-4.5 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center text-[9px] font-mono font-black shrink-0">
                                  {originalIdx + 1}
                                </span>
                                <span className="truncate">{displayName}</span>
                              </button>
                              
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  disabled={originalIdx === 0}
                                  onClick={() => moveElement(el.id, "down")}
                                  className="p-1 hover:bg-white border border-neutral-200 rounded text-neutral-500 hover:text-black transition disabled:opacity-30 disabled:hover:bg-transparent"
                                  title="Move Down (Send Backward)"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                                  </svg>
                                </button>
                                
                                <button
                                  type="button"
                                  disabled={originalIdx === elements.length - 1}
                                  onClick={() => moveElement(el.id, "up")}
                                  className="p-1 hover:bg-white border border-neutral-200 rounded text-neutral-500 hover:text-black transition disabled:opacity-30 disabled:hover:bg-transparent"
                                  title="Move Up (Bring Forward)"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 11l7-7 7 7M5 19l7-7 7 7" />
                                  </svg>
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => removeElement(el.id)}
                                  className="p-1 hover:bg-red-50 border border-neutral-200 hover:border-red-200 rounded text-neutral-400 hover:text-red-500 transition"
                                  title="Delete Layer"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="space-y-5 p-4 bg-neutral-50 rounded-2xl border border-neutral-150 animate-fade-in">

                    {/* Header showing layer details and delete option */}
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                      <span className="text-[10px] font-black uppercase tracking-wider text-black">
                        Active: {activeEl.type === "graphic" ? `Photo (${activeEl.name?.slice(0, 12)}...)` : "Text Layer"}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeElement(activeEl.id)}
                        className="px-3 py-1 rounded-lg border border-red-200 text-red-500 bg-red-50/50 text-[9px] font-black uppercase tracking-wider hover:bg-red-50"
                      >
                        Delete Layer
                      </button>
                    </div>

                    {/* Graphic specific option settings */}
                    {activeEl.type === "graphic" && (
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                              Scale Photo
                            </span>
                            <span className="text-[10px] font-mono font-bold text-neutral-600">
                              {activeEl.size}px
                            </span>
                          </div>
                          <input
                            type="range"
                            min="40"
                            max="500"
                            value={activeEl.size}
                            onChange={(e) => updateElement(activeEl.id, { size: Number(e.target.value) })}
                            className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                              Rotate Photo
                            </span>
                            <span className="text-[10px] font-mono font-bold text-neutral-600">
                              {activeEl.rotation}°
                            </span>
                          </div>
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            value={activeEl.rotation}
                            onChange={(e) => updateElement(activeEl.id, { rotation: Number(e.target.value) })}
                            className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
                          />
                        </div>
                      </div>
                    )}

                    {/* Text specific option settings */}
                    {activeEl.type === "text" && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1">
                            Edit Text
                          </label>
                          <input
                            type="text"
                            placeholder="ENTER YOUR TEXT"
                            value={activeEl.text}
                            onChange={(e) => updateElement(activeEl.id, { text: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-black focus:outline-none text-xs sm:text-sm font-black uppercase tracking-wider bg-white text-black placeholder-neutral-400"
                          />
                        </div>

                        {/* Aesthetic Custom Font Selection Dropdown */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400">
                            Choose Font Style
                          </label>

                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setIsFontOpen(!isFontOpen)}
                              className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-black focus:outline-none text-xs font-black bg-white text-black flex items-center justify-between transition-all"
                            >
                              <span>
                                {fontOptions.find(f => f.value === activeEl.fontFamily)?.name || "Standard"}
                              </span>
                              <svg className="w-3.5 h-3.5 text-neutral-500 mr-2.5 transition-transform duration-200" style={{ transform: isFontOpen ? "rotate(180deg)" : "rotate(0)" }} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            {isFontOpen && (
                              <div className="absolute top-[105%] left-0 w-full bg-white border border-neutral-200/80 rounded-xl shadow-xl z-[200] overflow-hidden">
                                {fontOptions.map((font) => (
                                  <button
                                    key={font.value}
                                    type="button"
                                    onClick={() => {
                                      updateElement(activeEl.id, { fontFamily: font.value });
                                      setIsFontOpen(false);
                                    }}
                                    className="w-full px-4 py-2.5 text-left text-[11px] font-black text-black hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-0"
                                  >
                                    {font.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Text size and rotation scale options */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[9px] font-black uppercase tracking-wider text-neutral-400">
                                Text Size
                              </span>
                              <span className="text-[9px] font-mono font-bold text-neutral-600">
                                {activeEl.size}px
                              </span>
                            </div>
                            <input
                              type="range"
                              min="12"
                              max="200"
                              value={activeEl.size}
                              onChange={(e) => updateElement(activeEl.id, { size: Number(e.target.value) })}
                              className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[9px] font-black uppercase tracking-wider text-neutral-400">
                                Text Rotation
                              </span>
                              <span className="text-[9px] font-mono font-bold text-neutral-600">
                                {activeEl.rotation}°
                              </span>
                            </div>
                            <input
                              type="range"
                              min="-180"
                              max="180"
                              value={activeEl.rotation}
                              onChange={(e) => updateElement(activeEl.id, { rotation: Number(e.target.value) })}
                              className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
                            />
                          </div>
                        </div>

                        {/* Text Color Selector */}
                        <div className="space-y-2">
                          <label className="block text-[10px] font-black uppercase tracking-wider text-neutral-400">
                            Select Text Color
                          </label>

                          <div className="flex flex-wrap gap-2.5 items-center">
                            {colorOptions.map((color) => (
                              <button
                                key={color.value}
                                type="button"
                                onClick={() => updateElement(activeEl.id, { color: color.value })}
                                className={`w-6 h-6 rounded-full border border-neutral-200 transition-all flex items-center justify-center hover:scale-110 ${activeEl.color === color.value ? "ring-2 ring-black scale-110" : ""
                                  }`}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                              />
                            ))}

                            {/* Native Color Picker Option */}
                            <label className="relative flex items-center gap-1.5 cursor-pointer text-[9px] font-black uppercase tracking-wider text-neutral-500 bg-neutral-50 px-2.5 py-1.5 rounded-full border border-neutral-200 hover:bg-neutral-100">
                              <input
                                type="color"
                                value={activeEl.color}
                                onChange={(e) => updateElement(activeEl.id, { color: e.target.value })}
                                className="w-4 h-4 rounded-full border border-neutral-300 p-0 cursor-pointer overflow-hidden bg-transparent"
                              />
                              Custom
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
            <div className="pt-4 border-t border-neutral-150 space-y-3">
              <button
                onClick={handleDownloadMockup}
                disabled={isExporting}
                className="w-full bg-white hover:bg-neutral-50 text-black border-2 border-black py-4 rounded-full font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {isExporting ? "Generating PNG..." : "Download Mockup (PNG)"}
              </button>

              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wide text-center leading-normal mt-1 mb-2 max-w-[90%] mx-auto">
                First download this image, then click the WhatsApp button below and attach/send the design from your gallery.
              </p>

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

      {/* Permission Confirmation Modal */}
      <AnimatePresence>
        {showPermissionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white/95 backdrop-blur-md border border-neutral-200/80 rounded-[28px] max-w-sm w-full p-6 text-center shadow-2xl"
            >
              <div className="w-12 h-12 bg-blue-50 text-[#005bd3] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h3 className="text-lg font-black uppercase tracking-wider text-black">Save Your Design?</h3>
              <p className="text-neutral-500 text-xs mt-3 uppercase tracking-wide leading-relaxed">
                We need your permission to render a high-quality mockup preview of your design to save to your gallery.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPermissionModal(false)}
                  className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-full font-bold uppercase tracking-widest text-[10px] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={triggerExport}
                  className="flex-1 py-3 bg-[#005bd3] hover:bg-[#004bb3] text-white rounded-full font-bold uppercase tracking-widest text-[10px] transition-colors shadow-md hover:shadow-lg"
                >
                  Allow & Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Save Mockup Instruction Modal */}
      <AnimatePresence>
        {showSaveModal && generatedMockupUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white/95 backdrop-blur-md border border-neutral-200/80 rounded-[32px] max-w-md w-full p-6 text-center shadow-2xl flex flex-col items-center"
            >
              <h3 className="text-lg font-black uppercase tracking-wider text-black mb-2">Saved to Downloads!</h3>
              <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider leading-relaxed mb-4 max-w-sm">
                Your design has been saved to your device's Downloads folder as a high-quality PNG. If the download did not trigger automatically, tap the button below or long-press the image to save it.
              </p>

              <div className="w-full flex flex-col gap-2.5 mb-4">
                <button
                  onClick={() => handleDownloadImageDirectly(generatedMockupUrl)}
                  className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white rounded-full font-bold uppercase tracking-widest text-[10px] transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download PNG
                </button>
              </div>

              <div className="w-full relative aspect-[4/5] bg-neutral-100 rounded-[20px] overflow-hidden border border-neutral-200 shadow-inner mb-6 flex items-center justify-center">
                <img
                  src={generatedMockupUrl}
                  alt="Custom Tee Mockup Preview"
                  className="w-full h-full object-contain cursor-pointer"
                  style={{ WebkitTouchCallout: "default" }}
                />
              </div>

              <button
                onClick={() => setShowSaveModal(false)}
                className="w-full py-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-full font-bold uppercase tracking-widest text-xs transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
