import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Wiping transactional tables to resolve foreign key dependencies...");
  await prisma.returnRequest.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.product.deleteMany({});
  console.log("Database cleanup finished.");

  const price = 600;

  // 1. Sunflower Heavyweight Tee
  console.log("Seeding: Sunflower Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Sunflower Heavyweight Tee",
      handle: "sunflower-heavyweight-tee",
      description: "Premium heavyweight cream tee featuring our custom sunflower graphic print on the back and minimalist SUNFLOWER lettering on the chest. Relaxed boxy fit, crafted from 100% premium cotton for ultimate comfort and durability.",
      images: {
        create: [
          { url: "/sunflower-front.png", altText: "Sunflower Heavyweight Tee Front View" },
          { url: "/sunflower-back.png", altText: "Sunflower Heavyweight Tee Back View" },
          { url: "/sunflower-detail-text.png", altText: "Sunflower Heavyweight Tee Detail Text" },
          { url: "/sunflower-detail-graphic.png", altText: "Sunflower Heavyweight Tee Detail Graphic" },
        ]
      },
      variants: {
        create: [
          { title: "S", price, inventory: 100 },
          { title: "M", price, inventory: 100 },
          { title: "L", price, inventory: 100 },
          { title: "XL", price, inventory: 100 },
        ]
      }
    }
  });

  // 2. Christ Cross Heavyweight Tee
  console.log("Seeding: Christ Cross Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Christ Cross Heavyweight Tee",
      handle: "christ-cross-heavyweight-tee",
      description: "Premium heavyweight black tee featuring a striking red cross graphic print on the back containing the quote 'I CAN DO ALL THINGS THROUGH CHRIST WHO STRENGTHENS ME PHIL 04:13' and a minimalist red 'NP NARROW PATH' chest logo. Relaxed boxy fit, crafted from 100% premium cotton for structural drape and breathability.",
      images: {
        create: [
          { url: "/christ-cross-front-detail.png", altText: "Christ Cross Heavyweight Tee Chest Logo" },
          { url: "/christ-cross-side.png", altText: "Christ Cross Heavyweight Tee Side View" },
          { url: "/christ-cross-back-body.png", altText: "Christ Cross Heavyweight Tee Back View" },
          { url: "/christ-cross-back-detail.png", altText: "Christ Cross Heavyweight Tee Back Graphic Detail" },
        ]
      },
      variants: {
        create: [
          { title: "S", price, inventory: 100 },
          { title: "M", price, inventory: 100 },
          { title: "L", price, inventory: 100 },
          { title: "XL", price, inventory: 100 },
        ]
      }
    }
  });

  // 3. Do Not Be Afraid Heavyweight Tee
  console.log("Seeding: Do Not Be Afraid Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Do Not Be Afraid Heavyweight Tee",
      handle: "do-not-be-afraid-heavyweight-tee",
      description: "Premium heavyweight cream tee featuring our custom red and black Isaiah 41:10 typographic cross print on the back that reads 'AFRAID DO NOT BE ISA 41:10' and a minimalist black 'NP NARROW PATH' chest logo. Relaxed boxy fit, crafted from 100% premium cotton for structural drape and breathability.",
      images: {
        create: [
          { url: "/do-not-be-afraid-front.png", altText: "Do Not Be Afraid Heavyweight Tee Front View" },
          { url: "/do-not-be-afraid-detail-front.png", altText: "Do Not Be Afraid Heavyweight Tee Chest Logo" },
          { url: "/do-not-be-afraid-back.png", altText: "Do Not Be Afraid Heavyweight Tee Back View" },
          { url: "/do-not-be-afraid-detail-back.png", altText: "Do Not Be Afraid Heavyweight Tee Back Graphic Detail" },
          { url: "/do-not-be-afraid-side.png", altText: "Do Not Be Afraid Heavyweight Tee Side View" },
          { url: "/do-not-be-afraid-collar.png", altText: "Do Not Be Afraid Heavyweight Tee Collar Detail" },
        ]
      },
      variants: {
        create: [
          { title: "S", price, inventory: 100 },
          { title: "M", price, inventory: 100 },
          { title: "L", price, inventory: 100 },
          { title: "XL", price, inventory: 100 },
        ]
      }
    }
  });

  // 4. Kung Fu Panda Heavyweight Tee
  console.log("Seeding: Kung Fu Panda Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Kung Fu Panda Heavyweight Tee",
      handle: "kung-fu-panda-heavyweight-tee",
      description: "Premium heavyweight red tee featuring a bold graphic print of Kung Fu Panda in a martial arts stance set inside a yellow crescent circle on the back, and a minimalist black and white 'the kung fu PANDA' chest lettering. Relaxed boxy fit, crafted from 100% premium cotton for comfort and style.",
      images: {
        create: [
          { url: "/panda-front.png", altText: "Kung Fu Panda Heavyweight Tee Front View" },
          { url: "/panda-detail-front.png", altText: "Kung Fu Panda Heavyweight Tee Chest Logo" },
          { url: "/panda-side.png", altText: "Kung Fu Panda Heavyweight Tee Side View" },
          { url: "/panda-back.png", altText: "Kung Fu Panda Heavyweight Tee Back View" },
          { url: "/panda-detail-back.png", altText: "Kung Fu Panda Heavyweight Tee Back Graphic Detail" },
        ]
      },
      variants: {
        create: [
          { title: "S", price, inventory: 100 },
          { title: "M", price, inventory: 100 },
          { title: "L", price, inventory: 100 },
          { title: "XL", price, inventory: 100 },
        ]
      }
    }
  });

  // 5. Monochrome Red Heavyweight Tee
  console.log("Seeding: Monochrome Red Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Monochrome Red Heavyweight Tee",
      handle: "monochrome-red-heavyweight-tee",
      description: "Premium heavyweight red monochrome tee. Clean design, boxy relaxed fit, crafted from 100% premium cotton for ultimate comfort, styling, and structural drape. Minimalist stitching details with no graphics.",
      collection: "MONOCHROME",
      images: {
        create: [
          { url: "/monochrome-red-front.png", altText: "Monochrome Red Heavyweight Tee Front View" },
          { url: "/monochrome-red-back.png", altText: "Monochrome Red Heavyweight Tee Back View" },
          { url: "/monochrome-red-detail.png", altText: "Monochrome Red Heavyweight Tee Back View Upper" },
          { url: "/monochrome-red-collar.png", altText: "Monochrome Red Heavyweight Tee Collar Detail" },
          { url: "/monochrome-red-fabric.png", altText: "Monochrome Red Heavyweight Tee Fabric Detail" },
        ]
      },
      variants: {
        create: [
          { title: "S", price, inventory: 100 },
          { title: "M", price, inventory: 100 },
          { title: "L", price, inventory: 100 },
          { title: "XL", price, inventory: 100 },
        ]
      }
    }
  });

  console.log("\nDatabase seeded successfully with all 5 products!");
}

main()
  .catch((e) => console.error("Error during catalog seed:", e))
  .finally(() => prisma.$disconnect());
