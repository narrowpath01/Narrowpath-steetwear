import Link from "next/link";

export default function CustomizePage() {
  return (
    <div className="min-h-screen bg-white py-28 px-6 md:px-12 flex flex-col justify-center items-center">
      <div className="max-w-3xl w-full text-black space-y-12">
        
        {/* Aesthetic Header */}
        <div className="text-center md:text-left space-y-4">
          <p className="text-xs font-black uppercase tracking-widest text-neutral-400">Custom Order</p>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
            Tell us More
          </h1>
        </div>

        {/* Simple Premium Separator */}
        <div className="border-y border-neutral-200 py-6 text-center md:text-left">
          <p className="text-sm font-medium tracking-widest text-neutral-500 uppercase">
            Let's build something unique together.
          </p>
        </div>

        {/* Actions / Navigation */}
        <div className="pt-6 border-t border-neutral-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <span className="text-sm font-black uppercase tracking-widest text-neutral-400">Narrow Path Custom Studio</span>
          <Link 
            href="/shop" 
            className="bg-black text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-neutral-800 transition-colors"
          >
            Go Back Shopping
          </Link>
        </div>

      </div>
    </div>
  );
}
