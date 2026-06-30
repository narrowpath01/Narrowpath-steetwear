"use client";
import { useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";

export default function CartInitializer() {
  const loadCart = useCartStore((state) => state.loadCart);

  useEffect(() => {
    loadCart(); // Quietly fetches the database cart in the background on load
  }, [loadCart]);

  return null; // Renders absolutely nothing to the DOM
}