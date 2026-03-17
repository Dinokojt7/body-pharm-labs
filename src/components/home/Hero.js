"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const SLIDES = [
  "/images/hero-bg.jpeg",
  "/images/hero-bg2.webp",
  "/images/hero-bg3.webp",
];

const INTERVAL = 5000;

const Hero = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full">
      <div className="relative w-full overflow-hidden h-[58vw] md:h-[clamp(500px,74vh,880px)]">

        {/* Sliding background images — right to left */}
        <AnimatePresence initial={false}>
          <motion.div
            key={current}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${SLIDES[current]})` }}
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.75, ease: "easeInOut" }}
          />
        </AnimatePresence>

        {/* Overlay */}
        <div className="absolute inset-0" />

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

            {/* Heading — editorial split */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6 md:mb-8"
              style={{ textShadow: "0 2px 28px rgba(0,0,0,0.7)" }}
            >
              <span className="block text-lg sm:text-xl md:text-2xl font-light tracking-[0.18em] uppercase text-gray-900 mb-1 md:mb-2">
                Where Science
              </span>
              <span className="block text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.0] text-white whitespace-nowrap">
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
                className="relative flex h-12 px-12 bg-white hover:bg-gray-100 text-black text-xs font-semibold tracking-widest uppercase items-center justify-center cursor-pointer select-none transition-colors duration-200 rounded border border-gray-200 shadow-md"
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
              {/* Hover shimmer */}
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

        {/* Rectangular slide indicators — centered bottom */}
        <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="h-[3px] transition-all duration-400"
              style={{
                width: i === current ? 28 : 14,
                backgroundColor:
                  i === current ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.3)",
              }}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Hero;
