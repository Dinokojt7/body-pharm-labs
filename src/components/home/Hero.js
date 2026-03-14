"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Button from "../ui/Button";

const Hero = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden -mt-20">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url(/images/hero-bg.jpeg)" }}
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content — centered, nudged down */}
      <div className="relative h-full flex items-center justify-center px-4 text-center pt-20">
        <div className="text-white max-w-4xl w-full">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs font-semibold tracking-[0.25em] uppercase text-gray-300 mb-6"
          >
            Research-Grade Peptides
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 leading-[1.05] tracking-tight"
          >
            Where Science
            <br />
            Meets Results.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mb-6"
          >
            <p className="text-lg md:text-xl font-semibold text-white/90 tracking-wide">
              FREE SHIPPING $250+
            </p>
            <p className="text-sm md:text-base text-gray-300 mt-1">
              High Quality · Lab Tested · Research Peptides
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-sm text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            All products are intended strictly for research and laboratory use
            only. Not for human consumption, medical use, or diagnostic
            purposes. Supplied exclusively to qualified professionals and
            institutions engaged in scientific research.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button
              href="/shop"
              variant="secondary"
              size="md"
              className="border-white! hover:bg-white/90!"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Shop Now
            </Button>
            <Button
              href="/about"
              variant="outline"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Learn More
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
