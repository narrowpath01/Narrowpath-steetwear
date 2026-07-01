// app/customise/page.tsx
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import Transformer from "@/components/customise/Transformer";

export default function CustomisePage() {
  const [baseColor, setBaseColor] = useState<"black" | "brown" | "off-white" | "red">("black");
  const [size, setSize] = useState<"S" | "M" | "L" | "XL">("M");

  // Slide view mode
  const [activeSlide, setActiveSlide] = useState<"front" | "back">("front");

  // Active selected design element
  const [activeElement, setActiveElement] = useState<"front-graphic" | "front-text" | "back-graphic" | "back-text" | null>(null);

  // Position offset states for design elements
  const [frontGraphicPos, setFrontGraphicPos] = useState({ x: 0, y: -40 });
  const [frontTextPos, setFrontTextPos] = useState({ x: 0, y: 60 });
  const [backGraphicPos, setBackGraphicPos] = useState({ x: 0, y: -40 });
  const [backTextPos, setBackTextPos] = useState({ x: 0, y: 60 });

  // Export State
  const [isExporting, setIsExporting] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [generatedMockupUrl, setGeneratedMockupUrl] = useState<string | null>(null);

  // Font Dropdown open state
  const [isFontOpen, setIsFontOpen] = useState(false);

  // FRONT Design States
  const [frontDesignUrl, setFrontDesignUrl] = useState<string | null>(null);
  const [frontDesignName, setFrontDesignName] = useState<string>("None");
  const [frontGraphicSize, setFrontGraphicSize] = useState<number>(100);
  const [frontGraphicRotation, setFrontGraphicRotation] = useState<number>(0);

  const [frontHasText, setFrontHasText] = useState(false);
  const [frontCustomText, setFrontCustomText] = useState("");
  const [frontSelectedFont, setFrontSelectedFont] = useState("Impact, sans-serif");
  const [frontTextColor, setFrontTextColor] = useState("#FFFFFF");
  const [frontTextSize, setFrontTextSize] = useState(24);
  const [frontTextRotation, setFrontTextRotation] = useState(0);

  // BACK Design States
  const [backDesignUrl, setBackDesignUrl] = useState<string | null>(null);
  const [backDesignName, setBackDesignName] = useState<string>("None");
  const [backGraphicSize, setBackGraphicSize] = useState<number>(100);
  const [backGraphicRotation, setBackGraphicRotation] = useState<number>(0);

  const [backHasText, setBackHasText] = useState(false);
  const [backCustomText, setBackCustomText] = useState("");
  const [backSelectedFont, setBackSelectedFont] = useState("Impact, sans-serif");
  const [backTextColor, setBackTextColor] = useState("#FFFFFF");
  const [backTextSize, setBackTextSize] = useState(24);
  const [backTextRotation, setBackTextRotation] = useState(0);

  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Helper images for base monochrome tees
  const teeImages = {
    front: {
      black: "/monochrome-black-front.png",
      brown: "/monochrome-brown-front.png",
      "off-white": "/monochrome-offwhite-front.png",
      red: "/monochrome-red-front.png"
    },
    back: {
      black: "/monochrome-black-back.png",
      brown: "/monochrome-brown-back-model.png",
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      if (activeSlide === "front") {
        setFrontDesignUrl(url);
        setFrontDesignName(file.name);
        setActiveElement("front-graphic");
      } else {
        setBackDesignUrl(url);
        setBackDesignName(file.name);
        setActiveElement("back-graphic");
      }
    }
  };

  const handleWhatsAppSubmit = () => {
    const textDetails = `Hello Narrow Path! I would like to order a Custom Heavyweight Tee:
- Base Color: ${baseColor.toUpperCase()}
- Size: ${size}

FRONT CUSTOMISATION:
- Graphic Design Uploaded: ${frontDesignUrl ? "Yes" : "No"} (${frontDesignName})
- Custom Text: ${frontHasText ? (frontCustomText || "ADD YOUR TEXT") : "None"}
- Text Color: ${frontHasText ? frontTextColor : "N/A"}
- Chosen Font: ${frontHasText ? fontOptions.find(f => f.value === frontSelectedFont)?.name : "N/A"}

BACK CUSTOMISATION:
- Graphic Design Uploaded: ${backDesignUrl ? "Yes" : "No"} (${backDesignName})
- Custom Text: ${backHasText ? (backCustomText || "ADD YOUR TEXT") : "None"}
- Text Color: ${backHasText ? backTextColor : "N/A"}
- Chosen Font: ${backHasText ? fontOptions.find(f => f.value === backSelectedFont)?.name : "N/A"}`;

    const encodedText = encodeURIComponent(textDetails);
    window.open(`https://wa.me/919315457852?text=${encodedText}`, "_blank");
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

    try {
      // Warm-up pass for Safari compatibility
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      if (isSafari) {
        try {
          await toPng(previewContainerRef.current, {
            cacheBust: true,
            backgroundColor: "#f5f5f5",
            fontEmbedCSS: "",
            pixelRatio: 1
          });
        } catch (e) {
          // Silent warmup catch
        }
      }

      // Capture mockup PNG
      const dataUrl = await toPng(previewContainerRef.current, {
        cacheBust: true,
        quality: 0.95,
        backgroundColor: "#f5f5f5",
        fontEmbedCSS: "", // Solves Safari WebKit sandbox security exceptions when parsing web fonts
        pixelRatio: window.devicePixelRatio && window.devicePixelRatio > 2 ? 2 : (window.devicePixelRatio || 1)
      });

      setGeneratedMockupUrl(dataUrl);

      // Mobile check
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

      if (isMobile) {
        setShowSaveModal(true);
      } else {
        const link = document.createElement("a");
        link.download = `custom-tee-${activeSlide}-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (error) {
      console.error("Failed to generate mockup image:", error);
      alert("Failed to export preview. Please take a screenshot of your screen to save your design!");
    } finally {
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
              onPointerDown={(e) => {
                if (e.target === e.currentTarget) {
                  setActiveElement(null);
                }
              }}
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
                    <Image
                      src={teeImages.front[baseColor]}
                      alt="Tee Front Preview"
                      fill
                      className="object-cover object-top rounded-[24px] pointer-events-none select-none"
                      sizes="(max-width: 768px) 100vw, 500px"
                      priority
                    />

                    {/* Interactive FRONT graphic */}
                    {frontDesignUrl && (
                      <Transformer
                        id="front-graphic"
                        x={frontGraphicPos.x}
                        y={frontGraphicPos.y}
                        rotation={frontGraphicRotation}
                        size={frontGraphicSize}
                        isActive={activeElement === "front-graphic"}
                        onSelect={() => setActiveElement("front-graphic")}
                        onChange={(vals) => {
                          setFrontGraphicPos({ x: vals.x, y: vals.y });
                          setFrontGraphicRotation(vals.rotation);
                          setFrontGraphicSize(vals.size);
                        }}
                      >
                        <img
                          src={frontDesignUrl}
                          alt="Front Graphic"
                          className="w-full h-full object-contain pointer-events-none select-none"
                        />
                      </Transformer>
                    )}

                    {/* Interactive FRONT text */}
                    {frontHasText && (
                      <Transformer
                        id="front-text"
                        x={frontTextPos.x}
                        y={frontTextPos.y}
                        rotation={frontTextRotation}
                        size={frontTextSize}
                        isText={true}
                        isActive={activeElement === "front-text"}
                        onSelect={() => setActiveElement("front-text")}
                        onChange={(vals) => {
                          setFrontTextPos({ x: vals.x, y: vals.y });
                          setFrontTextRotation(vals.rotation);
                          setFrontTextSize(vals.size);
                        }}
                        minSize={12}
                        maxSize={64}
                      >
                        <p
                          style={{
                            fontFamily: frontSelectedFont,
                            color: frontTextColor,
                            fontSize: `${frontTextSize}px`
                          }}
                          className="font-bold uppercase tracking-wider whitespace-nowrap drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.5)]"
                        >
                          {frontCustomText || "ADD YOUR TEXT"}
                        </p>
                      </Transformer>
                    )}
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
                    <Image
                      src={teeImages.back[baseColor]}
                      alt="Tee Back Preview"
                      fill
                      className="object-cover object-top rounded-[24px] pointer-events-none select-none"
                      sizes="(max-width: 768px) 100vw, 500px"
                      priority
                    />

                    {/* Interactive BACK graphic */}
                    {backDesignUrl && (
                      <Transformer
                        id="back-graphic"
                        x={backGraphicPos.x}
                        y={backGraphicPos.y}
                        rotation={backGraphicRotation}
                        size={backGraphicSize}
                        isActive={activeElement === "back-graphic"}
                        onSelect={() => setActiveElement("back-graphic")}
                        onChange={(vals) => {
                          setBackGraphicPos({ x: vals.x, y: vals.y });
                          setBackGraphicRotation(vals.rotation);
                          setBackGraphicSize(vals.size);
                        }}
                      >
                        <img
                          src={backDesignUrl}
                          alt="Back Graphic"
                          className="w-full h-full object-contain pointer-events-none select-none"
                        />
                      </Transformer>
                    )}

                    {/* Interactive BACK text */}
                    {backHasText && (
                      <Transformer
                        id="back-text"
                        x={backTextPos.x}
                        y={backTextPos.y}
                        rotation={backTextRotation}
                        size={backTextSize}
                        isText={true}
                        isActive={activeElement === "back-text"}
                        onSelect={() => setActiveElement("back-text")}
                        onChange={(vals) => {
                          setBackTextPos({ x: vals.x, y: vals.y });
                          setBackTextRotation(vals.rotation);
                          setBackTextSize(vals.size);
                        }}
                        minSize={12}
                        maxSize={64}
                      >
                        <p
                          style={{
                            fontFamily: backSelectedFont,
                            color: backTextColor,
                            fontSize: `${backTextSize}px`
                          }}
                          className="font-bold uppercase tracking-wider whitespace-nowrap drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.5)]"
                        >
                          {backCustomText || "ADD YOUR TEXT"}
                        </p>
                      </Transformer>
                    )}
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
          <div className="lg:mt-13 space-y-8">

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

            {/* Option 3: Upload Graphic from User Gallery */}
            <div className="space-y-3 pt-4 border-t border-neutral-100">
              <label className="block text-xs font-black uppercase tracking-wider text-neutral-500">
                3. Add Graphic Design to {activeSlide === "front" ? "Front" : "Back"}
              </label>

              <div className="flex flex-col gap-3">
                <div className="flex gap-3 items-center">
                  <label
                    htmlFor="user-graphic-upload"
                    className="flex-1 cursor-pointer py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider border-2 border-dashed border-neutral-300 text-center hover:border-neutral-500 bg-neutral-50 hover:bg-neutral-100/50 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {(activeSlide === "front" ? frontDesignUrl : backDesignUrl) ? "Change Photo" : "Upload from Gallery"}
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    id="user-graphic-upload"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {(activeSlide === "front" ? frontDesignUrl : backDesignUrl) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeSlide === "front") {
                          setFrontDesignUrl(null);
                          setFrontDesignName("None");
                        } else {
                          setBackDesignUrl(null);
                          setBackDesignName("None");
                        }
                      }}
                      className="px-4 py-3 rounded-xl border border-red-200 text-red-500 bg-red-50/50 text-xs font-black uppercase tracking-wider hover:bg-red-50"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Graphic controls: Scale & Rotation */}
                {((activeSlide === "front" ? frontDesignUrl : backDesignUrl)) && (
                  <div className="space-y-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-150 animate-fade-in">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                          Scale Graphic
                        </span>
                        <span className="text-[10px] font-mono font-bold text-neutral-600">
                          {(activeSlide === "front" ? frontGraphicSize : backGraphicSize)}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="40"
                        max="260"
                        value={activeSlide === "front" ? frontGraphicSize : backGraphicSize}
                        onChange={(e) => {
                          if (activeSlide === "front") {
                            setFrontGraphicSize(Number(e.target.value));
                          } else {
                            setBackGraphicSize(Number(e.target.value));
                          }
                        }}
                        className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                          Rotate Graphic
                        </span>
                        <span className="text-[10px] font-mono font-bold text-neutral-600">
                          {(activeSlide === "front" ? frontGraphicRotation : backGraphicRotation)}°
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={activeSlide === "front" ? frontGraphicRotation : backGraphicRotation}
                        onChange={(e) => {
                          if (activeSlide === "front") {
                            setFrontGraphicRotation(Number(e.target.value));
                          } else {
                            setBackGraphicRotation(Number(e.target.value));
                          }
                        }}
                        className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Option 4: Custom Text Edit Part */}
            <div className="space-y-4 pt-4 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-neutral-500">
                  4. Add Custom Text to {activeSlide === "front" ? "Front" : "Back"}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (activeSlide === "front") {
                      const nextHasText = !frontHasText;
                      setFrontHasText(nextHasText);
                      if (nextHasText) setActiveElement("front-text");
                      else if (activeElement === "front-text") setActiveElement(null);
                    } else {
                      const nextHasText = !backHasText;
                      setBackHasText(nextHasText);
                      if (nextHasText) setActiveElement("back-text");
                      else if (activeElement === "back-text") setActiveElement(null);
                    }
                  }}
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${(activeSlide === "front" ? frontHasText : backHasText)
                    ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                    : "bg-black text-white border-black hover:bg-neutral-800"
                    }`}
                >
                  {(activeSlide === "front" ? frontHasText : backHasText) ? "Remove Text" : "Add Text"}
                </button>
              </div>

              {(activeSlide === "front" ? frontHasText : backHasText) && (
                <div className="space-y-4 animate-fade-in">
                  <input
                    type="text"
                    placeholder="ADD YOUR TEXT"
                    value={activeSlide === "front" ? frontCustomText : backCustomText}
                    onChange={(e) => {
                      if (activeSlide === "front") {
                        setFrontCustomText(e.target.value);
                      } else {
                        setBackCustomText(e.target.value);
                      }
                    }}
                    className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-black focus:outline-none text-xs sm:text-sm font-black uppercase tracking-wider bg-white text-black placeholder-neutral-400"
                  />

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
                          {fontOptions.find(
                            f => f.value === (activeSlide === "front" ? frontSelectedFont : backSelectedFont)
                          )?.name}
                        </span>
                        {/* Custom arrow shifted a little to the left */}
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
                                if (activeSlide === "front") {
                                  setFrontSelectedFont(font.value);
                                } else {
                                  setBackSelectedFont(font.value);
                                }
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
                          {(activeSlide === "front" ? frontTextSize : backTextSize)}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min="12"
                        max="64"
                        value={activeSlide === "front" ? frontTextSize : backTextSize}
                        onChange={(e) => {
                          if (activeSlide === "front") {
                            setFrontTextSize(Number(e.target.value));
                          } else {
                            setBackTextSize(Number(e.target.value));
                          }
                        }}
                        className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-black"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[9px] font-black uppercase tracking-wider text-neutral-400">
                          Text Rotation
                        </span>
                        <span className="text-[9px] font-mono font-bold text-neutral-600">
                          {(activeSlide === "front" ? frontTextRotation : backTextRotation)}°
                        </span>
                      </div>
                      <input
                        type="range"
                        min="-180"
                        max="180"
                        value={activeSlide === "front" ? frontTextRotation : backTextRotation}
                        onChange={(e) => {
                          if (activeSlide === "front") {
                            setFrontTextRotation(Number(e.target.value));
                          } else {
                            setBackTextRotation(Number(e.target.value));
                          }
                        }}
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
                          onClick={() => {
                            if (activeSlide === "front") {
                              setFrontTextColor(color.value);
                            } else {
                              setBackTextColor(color.value);
                            }
                          }}
                          className={`w-6 h-6 rounded-full border border-neutral-200 transition-all flex items-center justify-center hover:scale-110 ${(activeSlide === "front" ? frontTextColor : backTextColor) === color.value ? "ring-2 ring-black scale-110" : ""
                            }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}

                      {/* Native Color Picker Option */}
                      <label className="relative flex items-center gap-1.5 cursor-pointer text-[9px] font-black uppercase tracking-wider text-neutral-500 bg-neutral-50 px-2.5 py-1.5 rounded-full border border-neutral-200 hover:bg-neutral-100">
                        <input
                          type="color"
                          value={activeSlide === "front" ? frontTextColor : backTextColor}
                          onChange={(e) => {
                            if (activeSlide === "front") {
                              setFrontTextColor(e.target.value);
                            } else {
                              setBackTextColor(e.target.value);
                            }
                          }}
                          className="w-4 h-4 rounded-full border border-neutral-300 p-0 cursor-pointer overflow-hidden bg-transparent"
                        />
                        Custom
                      </label>
                    </div>
                  </div>

                </div>
              )}
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
              <h3 className="text-lg font-black uppercase tracking-wider text-black mb-2">Save to Gallery</h3>
              <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-wider leading-relaxed mb-4 max-w-sm">
                Long-press on the image below and select <span className="text-black">"Save to Photos"</span> or <span className="text-black">"Add to Photos"</span> to save it directly to your device gallery!
              </p>
              
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
                className="w-full py-4 bg-black hover:bg-neutral-800 text-white rounded-full font-bold uppercase tracking-widest text-xs transition-colors shadow-md hover:shadow-lg"
              >
                Done
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
