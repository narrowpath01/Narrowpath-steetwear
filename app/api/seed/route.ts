// app/api/seed/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const newDrops = [
      {
        title: "Acid Wash Boxy Tee",
        handle: "acid-wash-boxy-tee",
        description: "Relaxed fit, vintage acid wash finish with dropped shoulders.",
        image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80",
        price: 800,
      },
      {
        title: "Minimalist Heavyweight Tee",
        handle: "minimalist-heavyweight-tee",
        description: "100% organic 280gsm cotton with a structured, premium drape.",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
        price: 300,
      },
      {
        title: "Distressed Grunge Tee",
        handle: "distressed-grunge-tee",
        description: "Hand-distressed hems and collar for a worn-in, post-apocalyptic look.",
        image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&auto=format&fit=crop&q=80",
        price: 599,
      }
    ];

    // Loop through the array and create the deeply nested relational data
    for (const drop of newDrops) {
      await prisma.product.create({
        data: {
          title: drop.title,
          handle: drop.handle,
          description: drop.description,
          // Prisma allows us to create the parent and the children (images/variants) in one single query
          images: {
            create: [{ url: drop.image }]
          },
          variants: {
            create: [
              { title: "Small", price: drop.price, inventory: 10 },
              { title: "Medium", price: drop.price, inventory: 15 },
              { title: "Large", price: drop.price, inventory: 10 },
            ]
          }
        }
      });
    }

    return NextResponse.json({ message: "Database seeded successfully! You can delete this file now." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 });
  }
}