import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { memoryCache } from "@/app/api/customise/share/route";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return new NextResponse("Design ID required", { status: 400 });
    }

    const url = new URL(req.url);
    const isMockupRequested = url.searchParams.get("type") === "mockup";

    let base64Data: string | null = null;

    // 1. Try DB first
    try {
      const rows: any = await prisma.$queryRawUnsafe(
        `SELECT "imageData", "details" FROM "CustomDesign" WHERE "id" = $1 LIMIT 1`,
        id
      );
      if (Array.isArray(rows) && rows.length > 0) {
        if (isMockupRequested && rows[0].details) {
          try {
            const parsedDetails = JSON.parse(rows[0].details);
            if (parsedDetails.mockupData) {
              base64Data = parsedDetails.mockupData;
            }
          } catch (e) {}
        }
        if (!base64Data && rows[0].imageData) {
          base64Data = rows[0].imageData;
        }
      }
    } catch (dbErr) {
      console.warn("[Customise Preview Image] DB lookup failed, checking memory cache:", dbErr);
    }

    // 2. Check memory cache fallback
    if (!base64Data && memoryCache.has(id)) {
      const cached = memoryCache.get(id)!;
      if (isMockupRequested && cached.mockupData) {
        base64Data = cached.mockupData;
      } else {
        base64Data = cached.imageData;
      }
    }

    if (!base64Data) {
      return new NextResponse("Design not found", { status: 404 });
    }

    // Extract raw base64 string
    const match = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const contentType = match ? match[1] : "image/png";
    const rawBase64 = match ? match[2] : base64Data;

    const buffer = Buffer.from(rawBase64, "base64");

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[Customise Preview Image Error]:", error);
    return new NextResponse("Failed to load design image", { status: 500 });
  }
}
