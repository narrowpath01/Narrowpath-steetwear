import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth-admin";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "lhqxzevt",
  api_key: process.env.CLOUDINARY_API_KEY || "965596432788773",
  api_secret: process.env.CLOUDINARY_API_SECRET || "aFPzbnuUXyNfXFYqZqEWXa6W7QI",
  secure: true,
});

export async function POST(req: Request) {
  try {
    const adminData = await getAdminSession();
    if (!adminData) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "streetwear/catalog";

    if (!file) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    // Validate mime type
    const validMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!validMimeTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported image format (${file.type}). Allowed: JPG, PNG, WEBP, GIF, SVG.` },
        { status: 400 }
      );
    }

    // Max 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File exceeds 10MB limit." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;

    const uploadResponse = await cloudinary.uploader.upload(base64Data, {
      folder,
      resource_type: "image",
    });

    return NextResponse.json({
      success: true,
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
      width: uploadResponse.width,
      height: uploadResponse.height,
      format: uploadResponse.format,
    });
  } catch (error: any) {
    console.error("Admin upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image to Cloudinary." },
      { status: 500 }
    );
  }
}
