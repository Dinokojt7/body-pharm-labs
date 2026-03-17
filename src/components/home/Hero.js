"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="w-full mt-2 md:mt-4 px-4 md:px-8 lg:px-12">
      {/* Hero image container — no border radius */}
      <div className="relative w-full overflow-hidden" style={{ height: "clamp(500px, 74vh, 880px)" }}>
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url(/images/hero-bg.jpeg)" }}
        />
        {/* Light overlay so text is readable */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Text + button — left-aligned, vertically centered */}
        <div className="relative h-full flex items-center px-8 sm:px-12 md:px-16">
          <div className="max-w-xs sm:max-w-sm">
            {/* Pre-heading */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-[10px] sm:text-xs font-semibold tracking-[0.25em] uppercase text-white/80 mb-3"
            >
              Research-Grade Peptides
            </motion.p>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white leading-[1.05] tracking-tight mb-8"
              style={{ textShadow: "0 2px 24px rgba(0,0,0,0.65)" }}
            >
              Where Science
              <br />
              Meets Results.
            </motion.h1>

            {/* CTA — white, no radius, shimmer + hover silver-gray */}
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
              {/* Base shimmer sweep */}
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
              {/* Hover shimmer — brighter & faster, only visible on hover */}
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
