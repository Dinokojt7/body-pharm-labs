"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="w-full mt-2 md:mt-4 px-4 md:px-8 lg:px-12">
      {/* Hero container — landscape on mobile, tall on desktop */}
      <div className="relative w-full overflow-hidden h-[58vw] md:h-[clamp(500px,74vh,880px)]">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url(/images/hero-bg.jpeg)" }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/35" />

        {/* Text + button — left-aligned, vertically centered */}
        <div className="relative h-full flex items-center px-6 sm:px-10 md:px-16">
          <div className="max-w-xs sm:max-w-sm">
            {/* Pre-heading — amber accent */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-[10px] sm:text-xs font-semibold tracking-[0.28em] uppercase text-amber-400/90 mb-3"
            >
              Research-Grade Peptides
            </motion.p>

            {/* Heading — editorial split: light label + semibold punch */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 md:mb-8"
              style={{ textShadow: "0 2px 28px rgba(0,0,0,0.7)" }}
            >
              <span className="block text-lg sm:text-xl md:text-2xl font-light tracking-[0.18em] uppercase text-white/60 mb-1 md:mb-2">
                Where Science
              </span>
              <span className="block text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.0] text-white">
                Meets Results.
              </span>
            </motion.h1>

            {/* CTA — white flat button, silver shimmer on hover */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22 }}
              className="relative inline-block overflow-hidden cursor-pointer group"
            >
              <Link
                href="/shop"
                className="relative flex h-10 px-8 bg-white hover:bg-gray-100 text-black text-xs font-semibold tracking-widest uppercase items-center justify-center cursor-pointer select-none transition-colors duration-200"
              >
                Shop Now
              </Link>
              {/* Base shimmer */}
              <motion.span
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.55) 50%, transparent 65%)",
                }}
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  repeatDelay: 2.2,
                  ease: "easeInOut",
                }}
              />
              {/* Hover shimmer — brighter & faster */}
              <motion.span
                aria-hidden
                className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                style={{
                  background:
                    "linear-gradient(105deg, transparent 25%, rgba(190,190,190,0.65) 50%, transparent 75%)",
                }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{
                  duration: 0.85,
                  repeat: Infinity,
                  repeatDelay: 0.4,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
