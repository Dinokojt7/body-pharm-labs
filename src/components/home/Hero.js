"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section
      className="relative w-full overflow-hidden -mt-28 md:-mt-32"
      style={{
        backgroundImage: "url('/images/new-hero.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
      }}
    >
      {/* Left-side gradient for text legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.10) 45%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 flex items-center px-6 sm:px-8 md:pl-8 md:pr-16 lg:pl-12 lg:pr-24 pt-40 pb-16 md:pt-44 md:pb-0"
        style={{ minHeight: "100vh" }}
      >
        <div className="w-full grid md:grid-cols-2 items-start gap-10 md:gap-0">

          {/* LEFT — headline + CTA */}
          <div className="flex flex-col items-center md:items-start justify-center text-center md:text-left">
            <motion.div
              className="mb-8 w-full
                bg-white/50 backdrop-blur-md border-y border-white/60 py-4
                md:bg-transparent md:backdrop-blur-none md:border-0 md:py-0"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <h1 className="leading-none text-center md:text-left">
                <span className="text-3xl sm:text-4xl md:text-[2.75rem] lg:text-[3.25rem] font-semibold tracking-tight text-black leading-none">
                  Cutting-Edge{' '}
                  <br className="hidden md:block" />
                  Peptides
                </span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28 }}
            >
              <Link
                href="/shop"
                className="inline-flex items-center gap-3 h-12 pl-6 pr-2 rounded-full text-white text-xs font-semibold tracking-widest uppercase transition-opacity duration-200 hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #C9960C 0%, #9A7010 50%, #7A5508 100%)" }}
              >
                Open Shop
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white shrink-0">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ transform: "rotate(-55deg)" }}>
                    <line x1="1.5" y1="6.5" x2="11.5" y2="6.5" stroke="black" strokeWidth="1.6" strokeLinecap="round"/>
                    <polyline points="7,2 11.5,6.5 7,11" stroke="black" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </span>
              </Link>
            </motion.div>
          </div>

          {/* RIGHT — sub-copy with glass container on mobile */}
          <motion.div
            className="flex justify-center md:block"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.38 }}
          >
            <p
              className="text-sm text-black leading-relaxed
                bg-white/50 backdrop-blur-md border border-white/70 rounded-2xl px-5 py-4 max-w-xs
                md:bg-transparent md:backdrop-blur-none md:border-none md:rounded-none md:p-0 md:max-w-72 md:ml-auto md:-mr-10 lg:-mr-16"
            >
              Explore our full catalog, read verified reviews, and experience the power of advanced peptide industry - trusted by thousand worldwide.
            </p>
          </motion.div>

        </div>
      </div>

    </section>
  );
}
