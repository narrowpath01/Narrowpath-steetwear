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

  const printedPrice = 599;
  const monoPrice = 499;

  // 1. Sunflower Heavyweight Tee
  console.log("Seeding: Sunflower Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Sunflower Heavyweight Tee",
      handle: "sunflower-heavyweight-tee",
      description: "Premium heavyweight cream tee featuring our custom sunflower graphic print on the back and minimalist SUNFLOWER lettering on the chest. Relaxed boxy fit, crafted from 100% premium cotton for ultimate comfort and durability.",
      images: {
        create: [
          { url: "/sunflower-1.png", altText: "Sunflower Heavyweight Tee Front View" },
          { url: "/sunflower-2.png", altText: "Sunflower Heavyweight Tee Back View" },
          { url: "/sunflower-3.png", altText: "Sunflower Heavyweight Tee Model View" },
          { url: "/sunflower-4.png", altText: "Sunflower Heavyweight Tee Sleeve Logo Detail" },
          { url: "/sunflower-5.png", altText: "Sunflower Heavyweight Tee Chest Graphic Detail" },
          { url: "/sunflower-6.png", altText: "Sunflower Heavyweight Tee Back Graphic Detail" },
        ]
      },
      variants: {
        create: [
          { title: "S", price: printedPrice, inventory: 100 },
          { title: "M", price: printedPrice, inventory: 100 },
          { title: "L", price: printedPrice, inventory: 100 },
          { title: "XL", price: printedPrice, inventory: 100 },
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
          { url: "/christ-cross-back-body.png", altText: "Christ Cross Heavyweight Tee Back View" },
          { url: "/christ-cross-front-body.png", altText: "Christ Cross Heavyweight Tee Front View" },
          { url: "/christ-cross-side.png", altText: "Christ Cross Heavyweight Tee Side View" },
          { url: "/christ-cross-back-detail.png", altText: "Christ Cross Heavyweight Tee Back Graphic Detail" },
          { url: "/christ-cross-collar.png", altText: "Christ Cross Heavyweight Tee Collar Detail" },
        ]
      },
      variants: {
        create: [
          { title: "S", price: printedPrice, inventory: 100 },
          { title: "M", price: printedPrice, inventory: 100 },
          { title: "L", price: printedPrice, inventory: 100 },
          { title: "XL", price: printedPrice, inventory: 100 },
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
          { url: "/do-not-be-afraid-1.png", altText: "Do Not Be Afraid Heavyweight Tee Front View" },
          { url: "/do-not-be-afraid-2.png", altText: "Do Not Be Afraid Heavyweight Tee Back View" },
          { url: "/do-not-be-afraid-3.png", altText: "Do Not Be Afraid Heavyweight Tee Model View" },
          { url: "/do-not-be-afraid-4.png", altText: "Do Not Be Afraid Heavyweight Tee Detail View" },
          { url: "/do-not-be-afraid-5.png", altText: "Do Not Be Afraid Heavyweight Tee Back Graphic Detail" },
          { url: "/do-not-be-afraid-6.png", altText: "Do Not Be Afraid Heavyweight Tee Collar Detail" },
        ]
      },
      variants: {
        create: [
          { title: "S", price: printedPrice, inventory: 100 },
          { title: "M", price: printedPrice, inventory: 100 },
          { title: "L", price: printedPrice, inventory: 100 },
          { title: "XL", price: printedPrice, inventory: 100 },
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
          { url: "/panda-1.png", altText: "Kung Fu Panda Heavyweight Tee Front Model View" },
          { url: "/panda-2.png", altText: "Kung Fu Panda Heavyweight Tee Back View" },
          { url: "/panda-3.png", altText: "Kung Fu Panda Heavyweight Tee Front Model View Full" },
          { url: "/panda-4.png", altText: "Kung Fu Panda Heavyweight Tee Sleeve Logo Detail" },
          { url: "/panda-5.png", altText: "Kung Fu Panda Heavyweight Tee Chest Graphic Detail" },
          { url: "/panda-6.png", altText: "Kung Fu Panda Heavyweight Tee Back Graphic Detail" },
        ]
      },
      variants: {
        create: [
          { title: "S", price: printedPrice, inventory: 100 },
          { title: "M", price: printedPrice, inventory: 100 },
          { title: "L", price: printedPrice, inventory: 100 },
          { title: "XL", price: printedPrice, inventory: 100 },
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
          { title: "S", price: monoPrice, inventory: 100 },
          { title: "M", price: monoPrice, inventory: 100 },
          { title: "L", price: monoPrice, inventory: 100 },
          { title: "XL", price: monoPrice, inventory: 100 },
        ]
      }
    }
  });

  // 6. Monochrome Off-White Heavyweight Tee
  console.log("Seeding: Monochrome Off-White Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Monochrome Off-White Heavyweight Tee",
      handle: "monochrome-off-white-heavyweight-tee",
      description: "Premium heavyweight off-white monochrome tee. Clean design, boxy relaxed fit, crafted from 100% premium cotton for ultimate comfort, styling, and structural drape. Minimalist stitching details with no graphics.",
      collection: "MONOCHROME",
      images: {
        create: [
          { url: "/monochrome-offwhite-front.png", altText: "Monochrome Off-White Heavyweight Tee Front View" },
          { url: "/monochrome-offwhite-back.png", altText: "Monochrome Off-White Heavyweight Tee Back View" },
          { url: "/monochrome-offwhite-back-model.png", altText: "Monochrome Off-White Heavyweight Tee Back Model View" },
          { url: "/monochrome-offwhite-collar-detail.png", altText: "Monochrome Off-White Heavyweight Tee Collar Detail" },
          { url: "/monochrome-offwhite-fabric.png", altText: "Monochrome Off-White Heavyweight Tee Fabric Detail" },
        ]
      },
      variants: {
        create: [
          { title: "S", price: monoPrice, inventory: 100 },
          { title: "M", price: monoPrice, inventory: 100 },
          { title: "L", price: monoPrice, inventory: 100 },
          { title: "XL", price: monoPrice, inventory: 100 },
        ]
      }
    }
  });

  // 7. Monochrome Brown Heavyweight Tee
  console.log("Seeding: Monochrome Brown Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Monochrome Brown Heavyweight Tee",
      handle: "monochrome-brown-heavyweight-tee",
      description: "Premium heavyweight brown monochrome tee. Clean design, boxy relaxed fit, crafted from 100% premium cotton for ultimate comfort, styling, and structural drape. Minimalist stitching details with no graphics.",
      collection: "MONOCHROME",
      images: {
        create: [
          { url: "/monochrome-brown-1.png", altText: "Monochrome Brown Heavyweight Tee Front View" },
          { url: "/monochrome-brown-2.png", altText: "Monochrome Brown Heavyweight Tee Back View Upper" },
          { url: "/monochrome-brown-3.png", altText: "Monochrome Brown Heavyweight Tee Back View Full" },
          { url: "/monochrome-brown-4.png", altText: "Monochrome Brown Heavyweight Tee Front Detail" },
          { url: "/monochrome-brown-5.png", altText: "Monochrome Brown Heavyweight Tee Back Detail" },
        ]
      },
      variants: {
        create: [
          { title: "S", price: monoPrice, inventory: 100 },
          { title: "M", price: monoPrice, inventory: 100 },
          { title: "L", price: monoPrice, inventory: 100 },
          { title: "XL", price: monoPrice, inventory: 100 },
        ]
      }
    }
  });

  // 8. Monochrome Black Heavyweight Tee
  console.log("Seeding: Monochrome Black Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Monochrome Black Heavyweight Tee",
      handle: "monochrome-black-heavyweight-tee",
      description: "Premium heavyweight black monochrome tee. Clean design, boxy relaxed fit, crafted from 100% premium cotton for ultimate comfort, styling, and structural drape. Minimalist stitching details with no graphics.",
      collection: "MONOCHROME",
      images: {
        create: [
          { url: "/monochrome-black-front.png", altText: "Monochrome Black Heavyweight Tee Front View" },
          { url: "/monochrome-black-back.png", altText: "Monochrome Black Heavyweight Tee Back View" },
          { url: "/monochrome-black-fabric.png", altText: "Monochrome Black Heavyweight Tee Fabric Detail" },
          { url: "/monochrome-black-model.png", altText: "Monochrome Black Heavyweight Tee Model View" },
          { url: "/monochrome-black-collar.png", altText: "Monochrome Black Heavyweight Tee Collar View" },
        ]
      },
      variants: {
        create: [
          { title: "S", price: monoPrice, inventory: 100 },
          { title: "M", price: monoPrice, inventory: 100 },
          { title: "L", price: monoPrice, inventory: 100 },
          { title: "XL", price: monoPrice, inventory: 100 },
        ]
      }
    }
  });

  // 9. Space Ship Heavyweight Tee
  console.log("Seeding: Space Ship Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Space Ship Heavyweight Tee",
      handle: "space-ship-heavyweight-tee",
      description: "Premium heavyweight black tee featuring a striking UFO/spaceship abduction graphic print on the back and 'SPACE SHEP' lettering on the chest. Relaxed boxy fit, crafted from 100% premium cotton for ultimate comfort, styling, and structural drape.",
      collection: "PRINTED",
      images: {
        create: [
          { url: "/space-ship-front.png", altText: "Space Ship Heavyweight Tee Front View" },
          { url: "/space-ship-back.png", altText: "Space Ship Heavyweight Tee Back View" },
          { url: "/space-ship-model.png", altText: "Space Ship Heavyweight Tee Model View" },
          { url: "/space-ship-detail-front.png", altText: "Space Ship Heavyweight Tee Chest Logo" },
          { url: "/space-ship-detail-back.png", altText: "Space Ship Heavyweight Tee Back Graphic Detail" },
          { url: "/space-ship-fabric.png", altText: "Space Ship Heavyweight Tee Fabric Detail" },
        ]
      },
      variants: {
        create: [
          { title: "S", price: printedPrice, inventory: 100 },
          { title: "M", price: printedPrice, inventory: 100 },
          { title: "L", price: printedPrice, inventory: 100 },
          { title: "XL", price: printedPrice, inventory: 100 },
        ]
      }
    }
  });

  // 10. Warrior Heavyweight Tee
  console.log("Seeding: Warrior Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Warrior Heavyweight Tee",
      handle: "warrior-heavyweight-tee",
      description: "Premium heavyweight cream tee featuring a striking warrior graphic print on the back with the quote 'A warrior is more than a fearless fighter, it's a mindset...' and a minimalist katana sword chest graphic. Relaxed boxy fit, crafted from 100% premium cotton for ultimate comfort, styling, and structural drape.",
      collection: "PRINTED",
      images: {
        create: [
          { url: "/warrior-front.png", altText: "Warrior Heavyweight Tee Front View" },
          { url: "/warrior-back.png", altText: "Warrior Heavyweight Tee Back View" },
          { url: "/warrior-model.png", altText: "Warrior Heavyweight Tee Model View" },
          { url: "/warrior-detail-front.png", altText: "Warrior Heavyweight Tee Chest Graphic" },
          { url: "/warrior-detail-back.png", altText: "Warrior Heavyweight Tee Back Graphic Detail" },
          { url: "/warrior-fabric.png", altText: "Warrior Heavyweight Tee Fabric Detail" },
        ]
      },
      variants: {
        create: [
          { title: "S", price: printedPrice, inventory: 100 },
          { title: "M", price: printedPrice, inventory: 100 },
          { title: "L", price: printedPrice, inventory: 100 },
          { title: "XL", price: printedPrice, inventory: 100 },
        ]
      }
    }
  });

  // 11. Red Moon Heavyweight Tee
  console.log("Seeding: Red Moon Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Red Moon Heavyweight Tee",
      handle: "red-moon-heavyweight-tee",
      description: "Premium heavyweight black tee featuring a striking Red Moon and Solar System graphic print on the back and a minimalist red 'RED MOON' chest graphic. Relaxed boxy fit, crafted from 100% premium cotton for ultimate comfort, styling, and structural drape.",
      collection: "PRINTED",
      images: {
        create: [
          { url: "/red-moon-1.png", altText: "Red Moon Heavyweight Tee Front Model View" },
          { url: "/red-moon-2.png", altText: "Red Moon Heavyweight Tee Back View" },
          { url: "/red-moon-3.png", altText: "Red Moon Heavyweight Tee Front Model View Full" },
          { url: "/red-moon-4.png", altText: "Red Moon Heavyweight Tee Sleeve Logo Detail" },
          { url: "/red-moon-5.png", altText: "Red Moon Heavyweight Tee Chest Graphic Detail" },
        ]
      },
      variants: {
        create: [
          { title: "S", price: printedPrice, inventory: 100 },
          { title: "M", price: printedPrice, inventory: 100 },
          { title: "L", price: printedPrice, inventory: 100 },
          { title: "XL", price: printedPrice, inventory: 100 },
        ]
      }
    }
  });

  // 12. Porsche 911 Heavyweight Tee
  console.log("Seeding: Porsche 911 Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Porsche 911 Heavyweight Tee",
      handle: "porsche-911-heavyweight-tee",
      description: "Premium heavyweight cream tee featuring a striking Porsche 911 GT3 RS graphic print on the back and a minimalist '911' chest graphic. Relaxed boxy fit, crafted from 100% premium cotton for ultimate comfort, styling, and structural drape.",
      collection: "PRINTED",
      images: {
        create: [
          { url: "/porsche-1.png", altText: "Porsche 911 Heavyweight Tee Front View" },
          { url: "/porsche-2.png", altText: "Porsche 911 Heavyweight Tee Back View" },
          { url: "/porsche-3.png", altText: "Porsche 911 Heavyweight Tee Model View" },
          { url: "/porsche-4.png", altText: "Porsche 911 Heavyweight Tee Sleeve Logo Detail" },
          { url: "/porsche-5.png", altText: "Porsche 911 Heavyweight Tee Back Graphic Detail" },
          { url: "/porsche-6.png", altText: "Porsche 911 Heavyweight Tee Chest Graphic Detail" },
          { url: "/porsche-7.png", altText: "Porsche 911 Heavyweight Tee Sleeve Text Detail" },
        ]
      },
      variants: {
        create: [
          { title: "S", price: printedPrice, inventory: 100 },
          { title: "M", price: printedPrice, inventory: 100 },
          { title: "L", price: printedPrice, inventory: 100 },
          { title: "XL", price: printedPrice, inventory: 100 },
        ]
      }
    }
  });

  // 13. Social Introvert Heavyweight Tee
  console.log("Seeding: Social Introvert Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Social Introvert Heavyweight Tee",
      handle: "social-introvert-heavyweight-tee",
      description: "Premium heavyweight white tee featuring a bold 'SOCIAL INTROVERT' graphic print on the back with our custom boy cartoon character, and a minimalist boy cartoon chest graphic. Relaxed boxy fit, crafted from 100% premium cotton for structural drape and comfort.",
      collection: "PRINTED",
      images: {
        create: [
          { url: "/social-introvert-1.png", altText: "Social Introvert Heavyweight Tee Front View" },
          { url: "/social-introvert-2.png", altText: "Social Introvert Heavyweight Tee Back View" },
          { url: "/social-introvert-3.png", altText: "Social Introvert Heavyweight Tee Model View" },
          { url: "/social-introvert-4.png", altText: "Social Introvert Heavyweight Tee Chest Graphic Detail" },
          { url: "/social-introvert-5.png", altText: "Social Introvert Heavyweight Tee Collar Detail" },
        ]
      },
      variants: {
        create: [
          { title: "S", price: printedPrice, inventory: 100 },
          { title: "M", price: printedPrice, inventory: 100 },
          { title: "L", price: printedPrice, inventory: 100 },
          { title: "XL", price: printedPrice, inventory: 100 },
        ]
      }
    }
  });

  // 14. Year of Dragon Heavyweight Tee
  console.log("Seeding: Year of Dragon Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Year of Dragon Heavyweight Tee",
      handle: "year-of-dragon-heavyweight-tee",
      description: "Premium heavyweight red tee featuring a striking Year of Dragon graphic print on the back and 'GONG XI FA CAI 恭喜发财' yellow Chinese lettering on the chest. Relaxed boxy fit, crafted from 100% premium cotton for structural drape and comfort.",
      collection: "PRINTED",
      images: {
        create: [
          { url: "/dragon-1.png", altText: "Year of Dragon Heavyweight Tee Front View" },
          { url: "/dragon-2.png", altText: "Year of Dragon Heavyweight Tee Back View" },
          { url: "/dragon-3.png", altText: "Year of Dragon Heavyweight Tee Model View" },
          { url: "/dragon-4.png", altText: "Year of Dragon Heavyweight Tee Chest Graphic Detail" },
          { url: "/dragon-5.png", altText: "Year of Dragon Heavyweight Tee Back Graphic Detail" },
          { url: "/dragon-6.png", altText: "Year of Dragon Heavyweight Tee Collar Detail" },
        ]
      },
      variants: {
        create: [
          { title: "S", price: printedPrice, inventory: 100 },
          { title: "M", price: printedPrice, inventory: 100 },
          { title: "L", price: printedPrice, inventory: 100 },
          { title: "XL", price: printedPrice, inventory: 100 },
        ]
      }
    }
  });

  // 15. Floral Dreams Heavyweight Tee
  console.log("Seeding: Floral Dreams Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Floral Dreams Heavyweight Tee",
      handle: "floral-dreams-heavyweight-tee",
      description: "Premium heavyweight white tee featuring a beautiful 'FLORAL DREAMS' rose-wrapped heart graphic print on the back and minimalist 'floral dreams' chest lettering in yellow-green. Relaxed boxy fit, crafted from 100% premium cotton for ultimate comfort and structural drape.",
      collection: "PRINTED",
      images: {
        create: [
          { url: "/floral-dreams-1.png", altText: "Floral Dreams Heavyweight Tee Front View" },
          { url: "/floral-dreams-2.png", altText: "Floral Dreams Heavyweight Tee Back View" },
          { url: "/floral-dreams-5.png", altText: "Floral Dreams Heavyweight Tee Model View" },
          { url: "/floral-dreams-3.png", altText: "Floral Dreams Heavyweight Tee Chest Graphic Detail" },
          { url: "/floral-dreams-4.png", altText: "Floral Dreams Heavyweight Tee Back Graphic Detail" },
          { url: "/floral-dreams-6.png", altText: "Floral Dreams Heavyweight Tee Collar Detail" },
        ]
      },
      variants: {
        create: [
          { title: "S", price: printedPrice, inventory: 100 },
          { title: "M", price: printedPrice, inventory: 100 },
          { title: "L", price: printedPrice, inventory: 100 },
          { title: "XL", price: printedPrice, inventory: 100 },
        ]
      }
    }
  });

  // 16. Glow Different Heavyweight Tee
  console.log("Seeding: Glow Different Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Glow Different Heavyweight Tee",
      handle: "glow-different-heavyweight-tee",
      description: "Premium heavyweight red tee featuring a playful black cat wrapped in glowing Christmas lights graphic print on the back and a minimalist white 'GLOW DIFFERENT' chest graphic. Relaxed boxy fit, crafted from 100% premium cotton for ultimate style and comfort.",
      collection: "PRINTED",
      images: {
        create: [
          { url: "/glow-different-1.png", altText: "Glow Different Heavyweight Tee Front View" },
          { url: "/glow-different-2.png", altText: "Glow Different Heavyweight Tee Back View" },
          { url: "/glow-different-3.png", altText: "Glow Different Heavyweight Tee Model View" },
          { url: "/glow-different-4.png", altText: "Glow Different Heavyweight Tee Chest Graphic Detail" },
          { url: "/glow-different-5.png", altText: "Glow Different Heavyweight Tee Back Graphic Detail" },
        ]
      },
      variants: {
        create: [
          { title: "S", price: printedPrice, inventory: 100 },
          { title: "M", price: printedPrice, inventory: 100 },
          { title: "L", price: printedPrice, inventory: 100 },
          { title: "XL", price: printedPrice, inventory: 100 },
        ]
      }
    }
  });

  // 17. Goku Heavyweight Tee
  console.log("Seeding: Goku Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Goku Heavyweight Tee",
      handle: "goku-heavyweight-tee",
      description: "Premium heavyweight cream tee featuring a stunning Goku and Shenron graphic print on the back and minimalist 'Goku' chest lettering in orange-red. Relaxed boxy fit, crafted from 100% premium cotton for structural drape and comfort.",
      collection: "PRINTED",
      images: {
        create: [
          { url: "/goku-1.png", altText: "Goku Heavyweight Tee Front View" },
          { url: "/goku-2.png", altText: "Goku Heavyweight Tee Back View" },
          { url: "/goku-3.png", altText: "Goku Heavyweight Tee Model View" },
          { url: "/goku-4.png", altText: "Goku Heavyweight Tee Chest Graphic Detail" },
          { url: "/goku-5.png", altText: "Goku Heavyweight Tee Back Graphic Detail" },
          { url: "/goku-6.png", altText: "Goku Heavyweight Tee Collar Detail" },
        ]
      },
      variants: {
        create: [
          { title: "S", price: printedPrice, inventory: 100 },
          { title: "M", price: printedPrice, inventory: 100 },
          { title: "L", price: printedPrice, inventory: 100 },
          { title: "XL", price: printedPrice, inventory: 100 },
        ]
      }
    }
  });

  // 18. Happiness Heavyweight Tee
  console.log("Seeding: Happiness Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Happiness Heavyweight Tee",
      handle: "happiness-heavyweight-tee",
      description: "Premium heavyweight cream tee featuring a whimsical anime-style illustration of a girl walking with a cat in a daisy field on the back and 'Happiness Lives In Small Moments' chest print in forest green. Relaxed boxy fit, crafted from 100% premium cotton for structural drape and comfort.",
      collection: "PRINTED",
      images: {
        create: [
          { url: "/happiness-1.png", altText: "Happiness Heavyweight Tee Front View" },
          { url: "/happiness-2.png", altText: "Happiness Heavyweight Tee Back View" },
          { url: "/happiness-3.png", altText: "Happiness Heavyweight Tee Model View" },
          { url: "/happiness-4.png", altText: "Happiness Heavyweight Tee Chest Graphic Detail" },
          { url: "/happiness-5.png", altText: "Happiness Heavyweight Tee Back Graphic Detail" },
          { url: "/happiness-6.png", altText: "Happiness Heavyweight Tee Collar Detail" },
        ]
      },
      variants: {
        create: [
          { title: "S", price: printedPrice, inventory: 100 },
          { title: "M", price: printedPrice, inventory: 100 },
          { title: "L", price: printedPrice, inventory: 100 },
          { title: "XL", price: printedPrice, inventory: 100 },
        ]
      }
    }
  });

  // 19. Love Peace Patience Heavyweight Tee
  console.log("Seeding: Love Peace Patience Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Love Peace Patience Heavyweight Tee",
      handle: "love-peace-patience-heavyweight-tee",
      description: "Premium heavyweight cream tee featuring a detailed golden-brown sketch of a pomegranate tree on the back and a minimalist 'LOVE PEACE PATIENCE' chest graphic in terracotta brown. Relaxed boxy fit, crafted from 100% premium cotton for structural drape and comfort.",
      collection: "PRINTED",
      images: {
        create: [
          { url: "/love-peace-patience-1.png", altText: "Love Peace Patience Heavyweight Tee Front View" },
          { url: "/love-peace-patience-2.png", altText: "Love Peace Patience Heavyweight Tee Back View" },
          { url: "/love-peace-patience-3.png", altText: "Love Peace Patience Heavyweight Tee Model View" },
          { url: "/love-peace-patience-4.png", altText: "Love Peace Patience Heavyweight Tee Chest Graphic Detail" },
          { url: "/love-peace-patience-5.png", altText: "Love Peace Patience Heavyweight Tee Back Graphic Detail" },
        ]
      },
      variants: {
        create: [
          { title: "S", price: printedPrice, inventory: 100 },
          { title: "M", price: printedPrice, inventory: 100 },
          { title: "L", price: printedPrice, inventory: 100 },
          { title: "XL", price: printedPrice, inventory: 100 },
        ]
      }
    }
  });

  console.log("\nDatabase seeded successfully with all 19 products!");
}

main()
  .catch((e) => console.error("Error during catalog seed:", e))
  .finally(() => prisma.$disconnect());




