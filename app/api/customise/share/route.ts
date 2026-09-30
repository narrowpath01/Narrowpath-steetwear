import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import crypto from "crypto";

// Fallback in-memory storage in case of transient DB connectivity issues
const memoryCache = new Map<string, {
  imageData: string;
  baseColor: string;
  size: string;
  details?: string;
  createdAt: Date;
}>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { imageData, baseColor = "black", size = "M", details = "" } = body;

    if (!imageData || typeof imageData !== "string") {
      return NextResponse.json({ error: "Missing or invalid imageData" }, { status: 400 });
    }

    // Generate unique compact design ID
    const designId = `des_${crypto.randomBytes(6).toString("hex")}`;

    // 1. Try to persist to PostgreSQL CustomDesign table
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "CustomDesign" ("id", "imageData", "baseColor", "size", "details", "createdAt") 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        designId,
        imageData,
        baseColor,
        size,
        typeof details === "string" ? details : JSON.stringify(details),
        new Date()
      );
    } catch (dbErr) {
      console.warn("[Customise Share] DB insert failed, falling back to memory cache:", dbErr);
      memoryCache.set(designId, {
        imageData,
        baseColor,
        size,
        details: typeof details === "string" ? details : JSON.stringify(details),
        createdAt: new Date(),
      });
    }

    // Determine the host for preview and image URLs
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "narrowpath.in";
    const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const baseUrl = `${protocol}://${host}`;

    return NextResponse.json({
      success: true,
      id: designId,
      previewUrl: `${baseUrl}/customise/design/${designId}`,
      imageUrl: `${baseUrl}/api/customise/preview/${designId}`,
    });
  } catch (error) {
    console.error("[Customise Share API Error]:", error);
    return NextResponse.json({ error: "Failed to process custom design share" }, { status: 500 });
  }
}

// Allow retrieving from in-memory fallback if needed
export { memoryCache };
