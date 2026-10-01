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
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840506/sunflower-1.png", altText: "Sunflower Heavyweight Tee Front View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840506/sunflower-2.png", altText: "Sunflower Heavyweight Tee Back View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840507/sunflower-3.png", altText: "Sunflower Heavyweight Tee Model View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840506/sunflower-4.png", altText: "Sunflower Heavyweight Tee Sleeve Logo Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840507/sunflower-5.png", altText: "Sunflower Heavyweight Tee Chest Graphic Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840508/sunflower-6.png", altText: "Sunflower Heavyweight Tee Back Graphic Detail" },
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
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840312/christ-cross-front-detail.png", altText: "Christ Cross Heavyweight Tee Chest Logo" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840308/christ-cross-back-body.png", altText: "Christ Cross Heavyweight Tee Back View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840308/christ-cross-front-body.png", altText: "Christ Cross Heavyweight Tee Front View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840308/christ-cross-side.png", altText: "Christ Cross Heavyweight Tee Side View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840309/christ-cross-back-detail.png", altText: "Christ Cross Heavyweight Tee Back Graphic Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840310/christ-cross-collar.png", altText: "Christ Cross Heavyweight Tee Collar Detail" },
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
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840309/do-not-be-afraid-1.png", altText: "Do Not Be Afraid Heavyweight Tee Front View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840314/do-not-be-afraid-2.png", altText: "Do Not Be Afraid Heavyweight Tee Back View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840314/do-not-be-afraid-3.png", altText: "Do Not Be Afraid Heavyweight Tee Model View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840314/do-not-be-afraid-4.png", altText: "Do Not Be Afraid Heavyweight Tee Detail View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840315/do-not-be-afraid-5.png", altText: "Do Not Be Afraid Heavyweight Tee Back Graphic Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840314/do-not-be-afraid-6.png", altText: "Do Not Be Afraid Heavyweight Tee Collar Detail" },
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
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840422/panda-1.png", altText: "Kung Fu Panda Heavyweight Tee Front Model View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840422/panda-2.png", altText: "Kung Fu Panda Heavyweight Tee Back View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840422/panda-3.png", altText: "Kung Fu Panda Heavyweight Tee Front Model View Full" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840422/panda-4.png", altText: "Kung Fu Panda Heavyweight Tee Sleeve Logo Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840422/panda-5.png", altText: "Kung Fu Panda Heavyweight Tee Chest Graphic Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840422/panda-6.png", altText: "Kung Fu Panda Heavyweight Tee Back Graphic Detail" },
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
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840404/monochrome-red-front.png", altText: "Monochrome Red Heavyweight Tee Front View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840403/monochrome-red-back.png", altText: "Monochrome Red Heavyweight Tee Back View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840402/monochrome-red-detail.png", altText: "Monochrome Red Heavyweight Tee Back View Upper" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840401/monochrome-red-collar.png", altText: "Monochrome Red Heavyweight Tee Collar Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840402/monochrome-red-fabric.png", altText: "Monochrome Red Heavyweight Tee Fabric Detail" },
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
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840401/monochrome-offwhite-front.png", altText: "Monochrome Off-White Heavyweight Tee Front View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840379/monochrome-offwhite-back.png", altText: "Monochrome Off-White Heavyweight Tee Back View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840380/monochrome-offwhite-back-model.png", altText: "Monochrome Off-White Heavyweight Tee Back Model View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840400/monochrome-offwhite-collar-detail.png", altText: "Monochrome Off-White Heavyweight Tee Collar Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840400/monochrome-offwhite-fabric.png", altText: "Monochrome Off-White Heavyweight Tee Fabric Detail" },
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
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840377/monochrome-brown-1.png", altText: "Monochrome Brown Heavyweight Tee Front View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840377/monochrome-brown-2.png", altText: "Monochrome Brown Heavyweight Tee Back View Upper" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840378/monochrome-brown-3.png", altText: "Monochrome Brown Heavyweight Tee Back View Full" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840377/monochrome-brown-4.png", altText: "Monochrome Brown Heavyweight Tee Front Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840377/monochrome-brown-5.png", altText: "Monochrome Brown Heavyweight Tee Back Detail" },
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
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840374/monochrome-black-front.png", altText: "Monochrome Black Heavyweight Tee Front View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840373/monochrome-black-back.png", altText: "Monochrome Black Heavyweight Tee Back View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840374/monochrome-black-fabric.png", altText: "Monochrome Black Heavyweight Tee Fabric Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840375/monochrome-black-model.png", altText: "Monochrome Black Heavyweight Tee Model View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840374/monochrome-black-collar.png", altText: "Monochrome Black Heavyweight Tee Collar View" },
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

  // Monochrome White Heavyweight Tee
  console.log("Seeding: Monochrome White Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Monochrome White Heavyweight Tee",
      handle: "monochrome-white-heavyweight-tee",
      description: "Premium heavyweight white monochrome tee. Clean design, boxy relaxed fit, crafted from 100% premium cotton for ultimate comfort, styling, and structural drape. Minimalist stitching details with no graphics.",
      collection: "MONOCHROME",
      images: {
        create: [
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840420/monochrome-white-front.png", altText: "Monochrome White Heavyweight Tee Front View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840403/monochrome-white-back.png", altText: "Monochrome White Heavyweight Tee Back View Close" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840420/monochrome-white-model.png", altText: "Monochrome White Heavyweight Tee Full Back View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840403/monochrome-white-collar.png", altText: "Monochrome White Heavyweight Tee Collar Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840404/monochrome-white-fabric.png", altText: "Monochrome White Heavyweight Tee Fabric Detail" },
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
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840505/space-ship-front.png", altText: "Space Ship Heavyweight Tee Front View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840477/space-ship-back.png", altText: "Space Ship Heavyweight Tee Back View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840506/space-ship-model.png", altText: "Space Ship Heavyweight Tee Model View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840478/space-ship-detail-front.png", altText: "Space Ship Heavyweight Tee Chest Logo" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840478/space-ship-detail-back.png", altText: "Space Ship Heavyweight Tee Back Graphic Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840504/space-ship-fabric.png", altText: "Space Ship Heavyweight Tee Fabric Detail" },
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
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840530/warrior-front.png", altText: "Warrior Heavyweight Tee Front View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840529/warrior-back.png", altText: "Warrior Heavyweight Tee Back View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840530/warrior-model.png", altText: "Warrior Heavyweight Tee Model View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840529/warrior-detail-front.png", altText: "Warrior Heavyweight Tee Chest Graphic" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840529/warrior-detail-back.png", altText: "Warrior Heavyweight Tee Back Graphic Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840530/warrior-fabric.png", altText: "Warrior Heavyweight Tee Fabric Detail" },
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
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840469/red-moon-1.png", altText: "Red Moon Heavyweight Tee Front Model View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840469/red-moon-2.png", altText: "Red Moon Heavyweight Tee Back View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840469/red-moon-3.png", altText: "Red Moon Heavyweight Tee Front Model View Full" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840468/red-moon-4.png", altText: "Red Moon Heavyweight Tee Sleeve Logo Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840470/red-moon-5.png", altText: "Red Moon Heavyweight Tee Chest Graphic Detail" },
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
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840442/porsche-1.png", altText: "Porsche 911 Heavyweight Tee Front View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840443/porsche-2.png", altText: "Porsche 911 Heavyweight Tee Back View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840443/porsche-3.png", altText: "Porsche 911 Heavyweight Tee Model View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840442/porsche-4.png", altText: "Porsche 911 Heavyweight Tee Sleeve Logo Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840443/porsche-5.png", altText: "Porsche 911 Heavyweight Tee Back Graphic Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840444/porsche-6.png", altText: "Porsche 911 Heavyweight Tee Chest Graphic Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840444/porsche-7.png", altText: "Porsche 911 Heavyweight Tee Sleeve Text Detail" },
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
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840475/social-introvert-1.png", altText: "Social Introvert Heavyweight Tee Front View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840476/social-introvert-2.png", altText: "Social Introvert Heavyweight Tee Back View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840477/social-introvert-3.png", altText: "Social Introvert Heavyweight Tee Model View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840475/social-introvert-4.png", altText: "Social Introvert Heavyweight Tee Chest Graphic Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840476/social-introvert-5.png", altText: "Social Introvert Heavyweight Tee Collar Detail" },
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
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840319/dragon-1.png", altText: "Year of Dragon Heavyweight Tee Front View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840321/dragon-2.png", altText: "Year of Dragon Heavyweight Tee Back View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840321/dragon-3.png", altText: "Year of Dragon Heavyweight Tee Model View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840320/dragon-4.png", altText: "Year of Dragon Heavyweight Tee Chest Graphic Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840321/dragon-5.png", altText: "Year of Dragon Heavyweight Tee Back Graphic Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840322/dragon-6.png", altText: "Year of Dragon Heavyweight Tee Collar Detail" },
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
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840323/floral-dreams-1.png", altText: "Floral Dreams Heavyweight Tee Front View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840323/floral-dreams-2.png", altText: "Floral Dreams Heavyweight Tee Back View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840324/floral-dreams-5.png", altText: "Floral Dreams Heavyweight Tee Model View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840323/floral-dreams-3.png", altText: "Floral Dreams Heavyweight Tee Chest Graphic Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840323/floral-dreams-4.png", altText: "Floral Dreams Heavyweight Tee Back Graphic Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840324/floral-dreams-6.png", altText: "Floral Dreams Heavyweight Tee Collar Detail" },
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
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840327/glow-different-1.png", altText: "Glow Different Heavyweight Tee Front View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840327/glow-different-2.png", altText: "Glow Different Heavyweight Tee Back View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840327/glow-different-3.png", altText: "Glow Different Heavyweight Tee Model View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840327/glow-different-4.png", altText: "Glow Different Heavyweight Tee Chest Graphic Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840327/glow-different-5.png", altText: "Glow Different Heavyweight Tee Back Graphic Detail" },
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
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840328/goku-1.png", altText: "Goku Heavyweight Tee Front View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840330/goku-2.png", altText: "Goku Heavyweight Tee Back View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840330/goku-3.png", altText: "Goku Heavyweight Tee Model View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840330/goku-4.png", altText: "Goku Heavyweight Tee Chest Graphic Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840331/goku-5.png", altText: "Goku Heavyweight Tee Back Graphic Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840330/goku-6.png", altText: "Goku Heavyweight Tee Collar Detail" },
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
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840331/happiness-1.png", altText: "Happiness Heavyweight Tee Front View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840333/happiness-2.png", altText: "Happiness Heavyweight Tee Back View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840333/happiness-3.png", altText: "Happiness Heavyweight Tee Model View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840332/happiness-4.png", altText: "Happiness Heavyweight Tee Chest Graphic Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840333/happiness-5.png", altText: "Happiness Heavyweight Tee Back Graphic Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840333/happiness-6.png", altText: "Happiness Heavyweight Tee Collar Detail" },
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
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840372/love-peace-patience-1.png", altText: "Love Peace Patience Heavyweight Tee Front View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840373/love-peace-patience-2.png", altText: "Love Peace Patience Heavyweight Tee Back View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840371/love-peace-patience-3.png", altText: "Love Peace Patience Heavyweight Tee Model View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840371/love-peace-patience-4.png", altText: "Love Peace Patience Heavyweight Tee Chest Graphic Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840371/love-peace-patience-5.png", altText: "Love Peace Patience Heavyweight Tee Back Graphic Detail" },
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

  // --- WOMEN'S MONOCHROME TEES ---
  const womenTees = [
    {
      color: "black",
      title: "Women's Monochrome Black Heavyweight Tee",
      handle: "women-monochrome-black-heavyweight-tee",
      images: [
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840637/women-plain-black-front.png", altText: "Women's Monochrome Black Heavyweight Tee Front View" },
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840634/women-plain-black-back.png", altText: "Women's Monochrome Black Heavyweight Tee Back View" },
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840638/women-plain-black-full.png", altText: "Women's Monochrome Black Heavyweight Tee Full View" },
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840646/women-plain-black-side.png", altText: "Women's Monochrome Black Heavyweight Tee Side View" },
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840635/women-plain-black-collar.png", altText: "Women's Monochrome Black Heavyweight Tee Collar Detail" },
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840636/women-plain-black-detail.png", altText: "Women's Monochrome Black Heavyweight Tee Fabric Detail" },
      ]
    },
    {
      color: "brown",
      title: "Women's Monochrome Brown Heavyweight Tee",
      handle: "women-monochrome-brown-heavyweight-tee",
      images: [
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840644/women-plain-brown-front.png", altText: "Women's Monochrome Brown Heavyweight Tee Front View" },
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840640/women-plain-brown-back.png", altText: "Women's Monochrome Brown Heavyweight Tee Back View" },
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840646/women-plain-brown-full.png", altText: "Women's Monochrome Brown Heavyweight Tee Full View" },
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840647/women-plain-brown-side.png", altText: "Women's Monochrome Brown Heavyweight Tee Side View" },
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840642/women-plain-brown-collar.png", altText: "Women's Monochrome Brown Heavyweight Tee Collar Detail" },
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840644/women-plain-brown-detail.png", altText: "Women's Monochrome Brown Heavyweight Tee Fabric Detail" },
      ]
    },
    {
      color: "off-white",
      title: "Women's Monochrome Off-White Heavyweight Tee",
      handle: "women-monochrome-off-white-heavyweight-tee",
      images: [
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840657/women-plain-offwhite-front.png", altText: "Women's Monochrome Off-White Heavyweight Tee Front View" },
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840648/women-plain-offwhite-back.png", altText: "Women's Monochrome Off-White Heavyweight Tee Back View" },
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840653/women-plain-offwhite-full.png", altText: "Women's Monochrome Off-White Heavyweight Tee Full View" },
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840654/women-plain-offwhite-side.png", altText: "Women's Monochrome Off-White Heavyweight Tee Side View" },
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840650/women-plain-offwhite-collar.png", altText: "Women's Monochrome Off-White Heavyweight Tee Collar Detail" },
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840651/women-plain-offwhite-detail.png", altText: "Women's Monochrome Off-White Heavyweight Tee Fabric Detail" },
      ]
    },
    {
      color: "red",
      title: "Women's Monochrome Red Heavyweight Tee",
      handle: "women-monochrome-red-heavyweight-tee",
      images: [
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840658/women-plain-red-front.png", altText: "Women's Monochrome Red Heavyweight Tee Front View" },
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840655/women-plain-red-back.png", altText: "Women's Monochrome Red Heavyweight Tee Back View" },
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840659/women-plain-red-full.png", altText: "Women's Monochrome Red Heavyweight Tee Full View" },
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840660/women-plain-red-side.png", altText: "Women's Monochrome Red Heavyweight Tee Side View" },
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840656/women-plain-red-collar.png", altText: "Women's Monochrome Red Heavyweight Tee Collar Detail" },
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840657/women-plain-red-detail.png", altText: "Women's Monochrome Red Heavyweight Tee Fabric Detail" },
      ]
    },
    {
      color: "white",
      title: "Women's Monochrome White Heavyweight Tee",
      handle: "women-monochrome-white-heavyweight-tee",
      images: [
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840663/women-plain-white-front.png", altText: "Women's Monochrome White Heavyweight Tee Front View" },
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840661/women-plain-white-back.png", altText: "Women's Monochrome White Heavyweight Tee Back View" },
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840664/women-plain-white-full.png", altText: "Women's Monochrome White Heavyweight Tee Full View" },
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840664/women-plain-white-side.png", altText: "Women's Monochrome White Heavyweight Tee Side View" },
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840662/women-plain-white-collar.png", altText: "Women's Monochrome White Heavyweight Tee Collar Detail" },
        { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840662/women-plain-white-detail.png", altText: "Women's Monochrome White Heavyweight Tee Fabric Detail" },
      ]
    }
  ];

  for (const tee of womenTees) {
    console.log(`Seeding: ${tee.title}...`);
    await prisma.product.create({
      data: {
        title: tee.title,
        handle: tee.handle,
        description: `Premium heavyweight women's monochrome tee. Clean design, boxy relaxed fit, crafted from 100% premium cotton for ultimate comfort, styling, and structural drape. Minimalist stitching details with no graphics.`,
        collection: "MONOCHROME",
        images: {
          create: tee.images
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
  }

  // --- WOMEN'S PRINTED TEES ---
  console.log("Seeding: Women's Do Not Be Afraid Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Women's Do Not Be Afraid Heavyweight Tee",
      handle: "women-do-not-be-afraid-heavyweight-tee",
      description: "Premium heavyweight women's printed tee featuring our custom red and black Isaiah 41:10 typographic cross print on the back that reads 'AFRAID DO NOT BE ISA 41:10' and a minimalist black 'NP NARROW PATH' chest logo. Relaxed boxy fit, crafted from 100% premium cotton for structural drape and breathability.",
      collection: "PRINTED",
      images: {
        create: [
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840585/women-do-not-be-afraid-1.png", altText: "Women's Do Not Be Afraid Heavyweight Tee Front View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840585/women-do-not-be-afraid-2.png", altText: "Women's Do Not Be Afraid Heavyweight Tee Back View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840582/women-do-not-be-afraid-3.png", altText: "Women's Do Not Be Afraid Heavyweight Tee Model View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840585/women-do-not-be-afraid-4.png", altText: "Women's Do Not Be Afraid Heavyweight Tee Chest Logo" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840585/women-do-not-be-afraid-5.png", altText: "Women's Do Not Be Afraid Heavyweight Tee Back Graphic Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840585/women-do-not-be-afraid-6.png", altText: "Women's Do Not Be Afraid Heavyweight Tee Collar Detail" },
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

  console.log("Seeding: Women's Year of Dragon Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Women's Year of Dragon Heavyweight Tee",
      handle: "women-year-of-dragon-heavyweight-tee",
      description: "Premium heavyweight women's printed tee. Features a striking Year of Dragon graphic print on the back and 'GONG XI FA CAI 恭喜发财' yellow Chinese lettering on the chest. Relaxed boxy fit, crafted from 100% premium cotton for structural drape and comfort.",
      collection: "PRINTED",
      images: {
        create: [
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840677/women-year-of-dragon-1.png", altText: "Women's Year of Dragon Heavyweight Tee Front View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840678/women-year-of-dragon-2.png", altText: "Women's Year of Dragon Heavyweight Tee Back View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840679/women-year-of-dragon-3.png", altText: "Women's Year of Dragon Heavyweight Tee Model View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840681/women-year-of-dragon-4.png", altText: "Women's Year of Dragon Heavyweight Tee Chest Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840682/women-year-of-dragon-5.png", altText: "Women's Year of Dragon Heavyweight Tee Back Graphic Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840683/women-year-of-dragon-6.png", altText: "Women's Year of Dragon Heavyweight Tee Collar Detail" },
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

  console.log("Seeding: Women's Floral Dreams Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Women's Floral Dreams Heavyweight Tee",
      handle: "women-floral-dreams-heavyweight-tee",
      description: "Premium heavyweight women's printed tee. Features a striking, colorful custom 'floral dreams heart' graphic print on the back and a Gothic-style 'floral dreams' typography curved across the chest in olive green. Relaxed boxy fit, crafted from 100% premium cotton for structural drape and comfort.",
      collection: "PRINTED",
      images: {
        create: [
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840586/women-floral-dreams-1.png", altText: "Women's Floral Dreams Heavyweight Tee Front View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840598/women-floral-dreams-2.png", altText: "Women's Floral Dreams Heavyweight Tee Back View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840593/women-floral-dreams-3.png", altText: "Women's Floral Dreams Heavyweight Tee Model View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840595/women-floral-dreams-4.png", altText: "Women's Floral Dreams Heavyweight Tee Back Graphic Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840592/women-floral-dreams-5.png", altText: "Women's Floral Dreams Heavyweight Tee Collar Detail View 1" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840592/women-floral-dreams-6.png", altText: "Women's Floral Dreams Heavyweight Tee Collar Detail View 2" },
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

  console.log("Seeding: Women's Glow Different Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Women's Glow Different Heavyweight Tee",
      handle: "women-glow-different-heavyweight-tee",
      description: "Premium heavyweight women's printed tee. Features a whimsical black cat wrapped in colorful glowing Christmas string lights on the back and a clean white 'GLOWDIFFERENT' typographic text on the chest. Relaxed boxy fit, crafted from 100% premium cotton for structural drape and comfort.",
      collection: "PRINTED",
      images: {
        create: [
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840598/women-glow-different-1.png", altText: "Women's Glow Different Heavyweight Tee Front View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840611/women-glow-different-2.png", altText: "Women's Glow Different Heavyweight Tee Back View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840608/women-glow-different-3.png", altText: "Women's Glow Different Heavyweight Tee Model Back View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840604/women-glow-different-4.png", altText: "Women's Glow Different Heavyweight Tee Front Logo Close-up" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840608/women-glow-different-5.png", altText: "Women's Glow Different Heavyweight Tee Back Print Close-up" },
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

  console.log("Seeding: Women's Happiness Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Women's Happiness Heavyweight Tee",
      handle: "women-happiness-heavyweight-tee",
      description: "Premium heavyweight women's printed tee. Minimalist chest print that reads 'Happiness Lives In Small Moments'. Relaxed boxy fit, crafted from 100% premium cotton for structural drape and comfort.",
      collection: "PRINTED",
      images: {
        create: [
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840610/women-happiness-1.png", altText: "Women's Happiness Heavyweight Tee Front Model View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840615/women-happiness-2.png", altText: "Women's Happiness Heavyweight Tee Back Model View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840614/women-happiness-3.png", altText: "Women's Happiness Heavyweight Tee Model View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840618/women-happiness-4.png", altText: "Women's Happiness Heavyweight Tee Chest Graphic" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840618/women-happiness-5.png", altText: "Women's Happiness Heavyweight Tee Back Print Close-up" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840617/women-happiness-6.png", altText: "Women's Happiness Heavyweight Tee Collar Detail View" },
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

  console.log("Seeding: Women's Love Peace Patience Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Women's Love Peace Patience Heavyweight Tee",
      handle: "women-love-peace-patience-heavyweight-tee",
      description: "Premium heavyweight women's printed tee. Features a detailed sketch of a pomegranate tree on the back in golden-brown and a terracotta-brown 'LOVE PEACE PATIENCE' text graphic on the chest. Relaxed boxy fit, crafted from 100% premium cotton for structural drape and comfort.",
      collection: "PRINTED",
      images: {
        create: [
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840631/women-love-peace-patience-1.png", altText: "Women's Love Peace Patience Heavyweight Tee Front View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840630/women-love-peace-patience-2.png", altText: "Women's Love Peace Patience Heavyweight Tee Back View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840632/women-love-peace-patience-3.png", altText: "Women's Love Peace Patience Heavyweight Tee Model View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840630/women-love-peace-patience-4.png", altText: "Women's Love Peace Patience Heavyweight Tee Chest Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840631/women-love-peace-patience-5.png", altText: "Women's Love Peace Patience Heavyweight Tee Back Print Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840632/women-love-peace-patience-6.png", altText: "Women's Love Peace Patience Heavyweight Tee Collar Detail" },
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

  console.log("Seeding: Women's Kung Fu Panda Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Women's Kung Fu Panda Heavyweight Tee",
      handle: "women-kung-fu-panda-heavyweight-tee",
      description: "Premium heavyweight women's printed tee. Features a striking, custom Kung Fu Panda graphic print on the back and a minimalist white 'the kung fu PANDA' text graphic on the chest. Relaxed boxy fit, crafted from 100% premium cotton for structural drape and comfort.",
      collection: "PRINTED",
      images: {
        create: [
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840624/women-kung-fu-panda-1.png", altText: "Women's Kung Fu Panda Heavyweight Tee Front View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840626/women-kung-fu-panda-2.png", altText: "Women's Kung Fu Panda Heavyweight Tee Back View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840626/women-kung-fu-panda-3.png", altText: "Women's Kung Fu Panda Heavyweight Tee Model View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840624/women-kung-fu-panda-4.png", altText: "Women's Kung Fu Panda Heavyweight Tee Model Full View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840628/women-kung-fu-panda-5.png", altText: "Women's Kung Fu Panda Heavyweight Tee Chest Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840626/women-kung-fu-panda-6.png", altText: "Women's Kung Fu Panda Heavyweight Tee Sleeve Detail" },
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

  console.log("Seeding: Women's Social Introvert Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Women's Social Introvert Heavyweight Tee",
      handle: "women-social-introvert-heavyweight-tee",
      description: "Premium heavyweight women's printed tee. Features a cute anime style social introvert graphic print on the back with 'SOCIAL INTROVERT COMFORT ZONE' lettering and a small matching graphic on the chest. Relaxed boxy fit, crafted from 100% premium cotton for structural drape and comfort.",
      collection: "PRINTED",
      images: {
        create: [
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840670/women-social-introvert-1.png", altText: "Women's Social Introvert Heavyweight Tee Front View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840667/women-social-introvert-2.png", altText: "Women's Social Introvert Heavyweight Tee Back View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840668/women-social-introvert-3.png", altText: "Women's Social Introvert Heavyweight Tee Front Detail View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840669/women-social-introvert-4.png", altText: "Women's Social Introvert Heavyweight Tee Back Print Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840669/women-social-introvert-5.png", altText: "Women's Social Introvert Heavyweight Tee Collar Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840671/women-social-introvert-6.png", altText: "Women's Social Introvert Heavyweight Tee Model View" },
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

  console.log("Seeding: Women's Sunflower Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Women's Sunflower Heavyweight Tee",
      handle: "women-sunflower-heavyweight-tee",
      description: "Premium heavyweight women's printed tee. Features a simple curved 'SUNFLOWER' text graphic in yellow-orange outline on both chest and back, with the signature 'NP NARROW PATH' logo printed on the sleeve. Relaxed boxy fit, crafted from 100% premium cotton for structural drape and comfort.",
      collection: "PRINTED",
      images: {
        create: [
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840672/women-sunflower-1.png", altText: "Women's Sunflower Heavyweight Tee Front View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840673/women-sunflower-2.png", altText: "Women's Sunflower Heavyweight Tee Back View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840674/women-sunflower-3.png", altText: "Women's Sunflower Heavyweight Tee Model View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840674/women-sunflower-4.png", altText: "Women's Sunflower Heavyweight Tee Sleeve Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840675/women-sunflower-5.png", altText: "Women's Sunflower Heavyweight Tee Chest Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840676/women-sunflower-6.png", altText: "Women's Sunflower Heavyweight Tee Back Graphic Detail" },
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

  console.log("Seeding: Women's Christ Cross Heavyweight Tee...");
  await prisma.product.create({
    data: {
      title: "Women's Christ Cross Heavyweight Tee",
      handle: "women-christ-cross-heavyweight-tee",
      description: "Premium heavyweight women's printed tee. Features a bold red cross graphic print on the back constructed of the text 'I CAN DO ALL THINGS THROUGH CHRIST WHO STRENGTHENS ME PHIL 04:13' and 'NP WALK BY FAITH, NOT BY SIGHT' at the lower hem, with a matching NP chest print. Relaxed boxy fit, crafted from 100% premium cotton for structural drape and comfort.",
      collection: "PRINTED",
      images: {
        create: [
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840531/women-christ-cross-1.png", altText: "Women's Christ Cross Heavyweight Tee Front View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840531/women-christ-cross-2.png", altText: "Women's Christ Cross Heavyweight Tee Model View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840533/women-christ-cross-3.png", altText: "Women's Christ Cross Heavyweight Tee Back Print Detail" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840533/women-christ-cross-4.png", altText: "Women's Christ Cross Heavyweight Tee Side View" },
          { url: "https://res.cloudinary.com/lhqxzevt/image/upload/v1790840533/women-christ-cross-5.png", altText: "Women's Christ Cross Heavyweight Tee Collar Detail" },
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

  console.log("\nDatabase seeded successfully with all 34 products!");
}

main()
  .catch((e) => console.error("Error during catalog seed:", e))
  .finally(() => prisma.$disconnect());




