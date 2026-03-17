"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import siteData from "@/lib/data/site-data.json";

const STATS = [
  { num: "99%", label: "Purity Rating" },
  { num: "50+", label: "Products" },
  { num: "48h", label: "Avg Dispatch" },
];

const AboutSection = () => {
  const { business } = siteData;

  return (
    <section className="relative w-full mt-16 md:mt-24 py-24 pb-36 px-4 md:px-8 lg:px-12 bg-black overflow-hidden">
      <div className="relative max-w-7xl mx-auto">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 md:mb-16"
        >
          <div className="flex items-center gap-3 mb-5">
            <span className="block w-8 h-px bg-amber-400/60" />
            <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-amber-400/80">
              About Us
            </p>
          </div>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-semibold text-white tracking-tight leading-[1.05]"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
          >
            Science You Can Trust.
            <br />
            <span className="text-white/35">Purity You Can Measure.</span>
          </h2>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">

          {/* Left — image with corner accents */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative w-full aspect-4/5 overflow-hidden"
          >
            <Image
              src="/images/about-image.jpg"
              alt="Research Laboratory"
              fill
              className="object-cover object-center"
            />
            {/* Corner accents */}
            <span className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-amber-400/40 pointer-events-none" />
            <span className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-amber-400/40 pointer-events-none" />
          </motion.div>

          {/* Right — content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-7"
          >
            <p className="text-gray-400 leading-relaxed text-sm md:text-base">
              {business.description}
            </p>
            <p className="text-gray-500 leading-relaxed text-sm">
              We understand that behind every vial we ship, there is critical
              research taking place — and lives that may one day be changed
              because of it. That&apos;s why we hold ourselves to the highest
              standards in product purity, consistency, and customer care.
            </p>

            {/* Stats bar */}
            <div className="grid grid-cols-3 border border-white/10 divide-x divide-white/10">
              {STATS.map(({ num, label }) => (
                <div key={num} className="px-4 py-5 text-center">
                  <p className="text-xl sm:text-2xl font-semibold text-white leading-none mb-1">
                    {num}
                  </p>
                  <p className="text-[10px] text-gray-500 tracking-widest uppercase">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA — same white flat button style as Hero */}
            <motion.div className="relative inline-block overflow-hidden cursor-pointer group">
              <Link
                href="/about"
                className="relative flex h-10 px-8 bg-white hover:bg-gray-100 text-black text-xs font-semibold tracking-widest uppercase items-center justify-center cursor-pointer select-none transition-colors duration-200 gap-2"
              >
                Learn More
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
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
                  repeatDelay: 2.5,
                  ease: "easeInOut",
                }}
              />
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
          </motion.div>
        </div>
      </div>

      {/* Wave divider → Products (gray-50) */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none pointer-events-none">
        <svg
          viewBox="0 0 1440 72"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-18 block"
        >
          <path
            d="M0,48 C360,80 1080,10 1440,48 L1440,72 L0,72 Z"
            fill="#f9fafb"
          />
        </svg>
      </div>
    </section>
  );
};

export default AboutSection;
