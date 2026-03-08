import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onShopClick: () => void;
}

export function Hero({ onShopClick }: HeroProps) {
  return (
    <section className="relative h-[80vh] flex items-center overflow-hidden bg-zinc-50">
      <div className="absolute inset-0 z-0">
        <img 
          src="https://www.manutan.com/blog/medias/files/572_ILLUSTRATION_0.jpg" 
          alt="Online Shopping Banner"
          className="w-full h-full object-cover opacity-90"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/40 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-xl"
        >
          <span className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-500 mb-4 block">
            New Collection 2026
          </span>
          <h1 className="text-5xl md:text-7xl font-medium tracking-tight text-zinc-900 mb-6 leading-[1.1]">
            Elevate Your <br /> Everyday Style.
          </h1>
          <p className="text-lg text-zinc-600 mb-8 max-w-md">
            Discover our curated selection of premium men's apparel, designed for the modern gentleman who values quality and minimalism.
          </p>
          <button 
            onClick={onShopClick}
            className="group flex items-center gap-2 bg-zinc-900 text-white px-8 py-4 rounded-full font-medium hover:bg-zinc-800 transition-all hover:gap-4"
          >
            Shop Collection
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
