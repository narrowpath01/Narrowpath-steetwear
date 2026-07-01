"use client";

import React, { useRef, useState, useEffect } from "react";

interface TransformerProps {
  id: string;
  x: number;
  y: number;
  rotation: number;
  size: number;
  isText?: boolean;
  isActive: boolean;
  onSelect: () => void;
  onChange: (values: { x: number; y: number; rotation: number; size: number }) => void;
  minSize?: number;
  maxSize?: number;
  children: React.ReactNode;
}

export default function Transformer({
  id,
  x,
  y,
  rotation,
  size,
  isText = false,
  isActive,
  onSelect,
  onChange,
  minSize = 30,
  maxSize = 300,
  children,
}: TransformerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (
    e: React.PointerEvent,
    mode: "translate" | "scale" | "rotate"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect();

    const node = containerRef.current;
    if (!node) return;

    // Capture the pointer to ensure moves are tracked globally and smoothly
    const target = e.currentTarget as HTMLElement;
    try {
      target.setPointerCapture(e.pointerId);
    } catch (err) {
      console.warn("Failed to set pointer capture:", err);
    }

    // 1. Get initial pointer & state values
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = x;
    const initialY = y;
    const initialRotation = rotation;
    const initialSize = size;

    // 2. Find screen center of the element for rotation & scaling
    const rect = node.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // 3. Pre-calculate starting metrics
    const dStart = Math.hypot(startX - centerX, startY - centerY);
    const startAngle = Math.atan2(startY - centerY, startX - centerX) * (180 / Math.PI);

    const handlePointerMove = (moveEvent: PointerEvent) => {
      // Keep event responsive and smooth
      const currentX = moveEvent.clientX;
      const currentY = moveEvent.clientY;

      if (mode === "translate") {
        const dx = currentX - startX;
        const dy = currentY - startY;
        onChange({
          x: initialX + dx,
          y: initialY + dy,
          rotation,
          size,
        });
      } else if (mode === "scale") {
        const dCurrent = Math.hypot(currentX - centerX, currentY - centerY);
        const scaleFactor = dCurrent / dStart;
        const newSize = Math.max(minSize, Math.min(maxSize, initialSize * scaleFactor));
        onChange({
          x,
          y,
          rotation,
          size: Math.round(newSize),
        });
      } else if (mode === "rotate") {
        const currentAngle = Math.atan2(currentY - centerY, currentX - centerX) * (180 / Math.PI);
        const dAngle = currentAngle - startAngle;
        let newRotation = Math.round(initialRotation + dAngle) % 360;
        if (newRotation < 0) newRotation += 360;
        onChange({
          x,
          y,
          rotation: newRotation,
          size,
        });
      }
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      try {
        target.releasePointerCapture(upEvent.pointerId);
      } catch (err) {}
      cleanup();
    };

    const handlePointerCancel = (cancelEvent: PointerEvent) => {
      try {
        target.releasePointerCapture(cancelEvent.pointerId);
      } catch (err) {}
      cleanup();
    };

    const cleanup = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);
  };

  return (
    <div
      ref={containerRef}
      id={id}
      onPointerDown={(e) => {
        // Only trigger translation if clicking directly on the child element,
        // and not on the handles or buttons.
        handlePointerDown(e, "translate");
      }}
      className={`absolute select-none ${isActive ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}`}
      style={{
        left: "50%",
        top: "50%",
        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${rotation}deg)`,
        width: isText ? "max-content" : `${size}px`,
        height: isText ? "auto" : `${size}px`,
        zIndex: isActive ? 40 : 20,
        touchAction: "none",
      }}
    >
      {/* 1. Core Child Content */}
      <div className="w-full h-full">{children}</div>

      {/* 2. Interactive Bounding Box & Handles (Only when active/selected) */}
      {isActive && (
        <>
          {/* Bounding box outline */}
          <div className="absolute -inset-1 border-2 border-violet-600 rounded pointer-events-none" />

          {/* Corner Handles (White Dots) */}
          {/* Top-Left */}
          <div
            onPointerDown={(e) => handlePointerDown(e, "scale")}
            className="absolute w-3.5 h-3.5 bg-white border-2 border-violet-600 rounded-full shadow-md cursor-nwse-resize -left-1.5 -top-1.5"
          />
          {/* Top-Right */}
          <div
            onPointerDown={(e) => handlePointerDown(e, "scale")}
            className="absolute w-3.5 h-3.5 bg-white border-2 border-violet-600 rounded-full shadow-md cursor-nesw-resize -right-1.5 -top-1.5"
          />
          {/* Bottom-Left */}
          <div
            onPointerDown={(e) => handlePointerDown(e, "scale")}
            className="absolute w-3.5 h-3.5 bg-white border-2 border-violet-600 rounded-full shadow-md cursor-nesw-resize -left-1.5 -bottom-1.5"
          />
          {/* Bottom-Right */}
          <div
            onPointerDown={(e) => handlePointerDown(e, "scale")}
            className="absolute w-3.5 h-3.5 bg-white border-2 border-violet-600 rounded-full shadow-md cursor-nwse-resize -right-1.5 -bottom-1.5"
          />

          {/* Side Handles (White Pills) */}
          {/* Top Center */}
          <div
            onPointerDown={(e) => handlePointerDown(e, "scale")}
            className="absolute w-4 h-2 bg-white border-2 border-violet-600 rounded-full shadow-md cursor-ns-resize left-1/2 -translate-x-1/2 -top-1"
          />
          {/* Bottom Center */}
          <div
            onPointerDown={(e) => handlePointerDown(e, "scale")}
            className="absolute w-4 h-2 bg-white border-2 border-violet-600 rounded-full shadow-md cursor-ns-resize left-1/2 -translate-x-1/2 -bottom-1"
          />
          {/* Left Center */}
          <div
            onPointerDown={(e) => handlePointerDown(e, "scale")}
            className="absolute w-2 h-4 bg-white border-2 border-violet-600 rounded-full shadow-md cursor-ew-resize top-1/2 -translate-y-1/2 -left-1"
          />
          {/* Right Center */}
          <div
            onPointerDown={(e) => handlePointerDown(e, "scale")}
            className="absolute w-2 h-4 bg-white border-2 border-violet-600 rounded-full shadow-md cursor-ew-resize top-1/2 -translate-y-1/2 -right-1"
          />

          {/* Floating Actions Panel (Positioned below the element) */}
          <div className="absolute top-[100%] mt-6 left-1/2 -translate-x-1/2 flex items-center gap-3.5 z-[50] pointer-events-auto">
            {/* Rotation Button */}
            <button
              type="button"
              onPointerDown={(e) => handlePointerDown(e, "rotate")}
              className="w-8 h-8 rounded-full bg-white border border-neutral-200 hover:border-black flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95 transition-all text-black"
              title="Drag to Rotate"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z" />
              </svg>
            </button>

            {/* Translation (Move) Button */}
            <button
              type="button"
              onPointerDown={(e) => handlePointerDown(e, "translate")}
              className="w-8 h-8 rounded-full bg-white border border-neutral-200 hover:border-black flex items-center justify-center shadow-lg cursor-move hover:scale-105 active:scale-95 transition-all text-black"
              title="Drag to Move"
            >
              <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
              </svg>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
