import { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/db";
import { memoryCache } from "@/app/api/customise/share/route";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getDesignData(id: string) {
  try {
    const rows: any = await prisma.$queryRawUnsafe(
      `SELECT "id", "baseColor", "size", "details", "createdAt" FROM "CustomDesign" WHERE "id" = $1 LIMIT 1`,
      id
    );
    if (Array.isArray(rows) && rows.length > 0) {
      return rows[0];
    }
  } catch (err) {
    console.warn("DB lookup failed in design page:", err);
  }

  if (memoryCache.has(id)) {
    const cached = memoryCache.get(id)!;
    return {
      id,
      baseColor: cached.baseColor,
      size: cached.size,
      details: cached.details,
      createdAt: cached.createdAt,
    };
  }

  return null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const design = await getDesignData(id);

  const domain = process.env.NEXTAUTH_URL || "https://narrowpath.in";
  const imageUrl = `${domain}/api/customise/preview/${id}`;
  const baseColor = (design?.baseColor || "black").toUpperCase();
  const size = design?.size || "M";

  const title = `Custom Heavyweight Tee (${baseColor} • Size ${size}) | Narrow Path`;
  const description = `Custom Streetwear Mockup from Narrow Path Studio. High-density drop-shoulder tee design.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${domain}/customise/design/${id}`,
      siteName: "Narrow Path",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1200,
          alt: `Custom Streetwear Mockup - ${baseColor}`,
          type: "image/png",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function DesignPreviewPage({ params }: PageProps) {
  const { id } = await params;
  const design = await getDesignData(id);

  const imageUrl = `/api/customise/preview/${id}?type=mockup`;
  const designPngUrl = `/api/customise/preview/${id}`;
  const baseColor = (design?.baseColor || "black").toUpperCase();
  const size = design?.size || "M";

  const waMessage = encodeURIComponent(
    `Hello Narrow Path! I'm reviewing my Custom Heavyweight Tee design:\n` +
    `- Design ID: ${id}\n` +
    `- Color: ${baseColor}\n` +
    `- Size: ${size}\n` +
    `- Price: INR 649\n\n` +
    `View & Download Assets: https://narrowpath.in/customise/design/${id}`
  );

  return (
    <div className="min-h-screen bg-[#fafafa] text-black flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-black tracking-widest uppercase">
          NARROW PATH
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/customise"
            className="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full border border-neutral-300 hover:bg-neutral-100 transition-colors"
          >
            Studio
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 flex flex-col items-center">
        <div className="w-full bg-white border border-neutral-200 rounded-3xl p-6 md:p-10 shadow-sm flex flex-col md:flex-row gap-8 items-center">
          {/* Design Image Card */}
          <div className="w-full md:w-1/2 aspect-square relative bg-neutral-100 rounded-2xl overflow-hidden border border-neutral-200 shadow-inner flex items-center justify-center p-2">
            <img
              src={imageUrl}
              alt="Custom Streetwear Mockup"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Design Details & Actions */}
          <div className="w-full md:w-1/2 flex flex-col gap-5">
            <div>
              <span className="inline-block px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-3">
                Custom Studio Design
              </span>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
                Heavyweight Oversized Tee
              </h1>
              <p className="text-neutral-500 text-xs uppercase tracking-wider mt-1">
                280 GSM • 100% Combed Cotton • Boxy Streetwear Cut
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 border-y border-neutral-150 text-center">
              <div className="bg-neutral-50 rounded-xl p-2.5">
                <span className="block text-[9px] font-black uppercase tracking-wider text-neutral-400">Price</span>
                <span className="text-sm font-black">₹649</span>
              </div>
              <div className="bg-neutral-50 rounded-xl p-2.5">
                <span className="block text-[9px] font-black uppercase tracking-wider text-neutral-400">Base Color</span>
                <span className="text-sm font-black">{baseColor}</span>
              </div>
              <div className="bg-neutral-50 rounded-xl p-2.5">
                <span className="block text-[9px] font-black uppercase tracking-wider text-neutral-400">Size</span>
                <span className="text-sm font-black">{size}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <a
                href={`https://wa.me/919894781426?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-[#25d366] hover:bg-[#20ba5a] text-white rounded-full font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-center"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.09-3.977c1.649.979 3.278 1.488 4.908 1.489 5.482 0 9.943-4.461 9.947-9.947.002-2.658-1.03-5.158-2.906-7.037C16.32 2.65 13.823 1.62 11.2 1.62c-5.485 0-9.949 4.464-9.953 9.953-.001 1.706.505 3.327 1.47 4.79l-1.026 3.748 3.866-1.018z" />
                </svg>
                Confirm Order on WhatsApp
              </a>

              {/* Primary: Pure Print-Ready PNG Design (Transparent) */}
              <a
                href={designPngUrl}
                download={`narrowpath-design-print-${id}.png`}
                className="w-full py-3.5 bg-black hover:bg-neutral-800 text-white rounded-full font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 text-center shadow-sm"
              >
                <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download PNG Design (Print Ready)
              </a>

              {/* Secondary: Model Mockup */}
              <a
                href={imageUrl}
                download={`narrowpath-mockup-model-${id}.png`}
                className="w-full py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 rounded-full font-bold uppercase tracking-widest text-[11px] transition-colors flex items-center justify-center gap-2 text-center"
              >
                <svg className="w-4 h-4 fill-none stroke-current" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                Download Model Mockup
              </a>

              <Link
                href="/customise"
                className="w-full py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-full font-bold uppercase tracking-widest text-[11px] transition-colors text-center"
              >
                Create Another Design
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
