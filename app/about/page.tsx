import Link from "next/link";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-white py-28 px-6 md:px-12 flex flex-col justify-center items-center">
      <div className="max-w-3xl w-full text-black space-y-12">
        
        {/* Massive Aesthetic Header */}
        <div className="text-center md:text-left space-y-4">
          <p className="text-xs font-black uppercase tracking-widest text-neutral-400">Our Story</p>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
            NARROW<br/>PATH
          </h1>
        </div>

        {/* Faith Statement Divider */}
        <div className="border-y border-neutral-200 py-6 text-center md:text-left">
          <p className="text-lg md:text-xl font-bold tracking-wide text-neutral-700 italic">
            "Walk by Faith, Not by Sight."
          </p>
        </div>

        {/* Narrative Paragraphs */}
        <div className="space-y-6 text-neutral-800 text-sm md:text-base leading-relaxed font-normal">
          <p>
            At Narrow Path, we believe that clothing is more than just what you wear—it's an expression of who you are and the values you choose to live by. Inspired by the timeless principle of <strong>"Walk by Faith, Not by Sight,"</strong> our brand was created for those who choose purpose over trends and authenticity over appearances.
          </p>
          
          <p>
            We design high-quality, comfortable apparel that blends simplicity, durability, and effortless style. Every piece is thoughtfully crafted using premium materials and attention to detail, ensuring that it not only looks good but feels right for every step of your journey.
          </p>

          <p>
            In a world driven by fast fashion and constant change, we choose a different direction. We follow a narrower path—one built on quality over quantity, integrity over shortcuts, and lasting value over temporary hype. Our goal is to create clothing that stands the test of time while encouraging a mindset rooted in confidence, purpose, and faith.
          </p>

          <p>
            Narrow Path is more than a clothing brand; it is a reminder that the most meaningful journeys are often the ones less traveled. Whether you're pursuing your dreams, overcoming challenges, or simply navigating everyday life, we're here to walk that journey with you.
          </p>
        </div>

        {/* Call To Action */}
        <div className="pt-6 border-t border-neutral-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <span className="text-sm font-black uppercase tracking-widest text-neutral-400">Welcome to Narrow Path.</span>
          <Link 
            href="/shop" 
            className="bg-black text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-neutral-800 transition-colors"
          >
            Explore our collections
          </Link>
        </div>

      </div>
    </div>
  );
}
