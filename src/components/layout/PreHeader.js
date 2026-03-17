"use client";

import { Truck, Shield } from "lucide-react";
import { motion } from "framer-motion";

const PreHeader = () => {
  return (
    <div className="bg-black/60 backdrop-blur-md text-white py-2.5 overflow-hidden border-b border-white/10">
      <div className="relative flex items-center whitespace-nowrap overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 45,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex items-center text-xs"
        >
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="flex items-center">
              <span className="mx-8 tracking-wide">
                Research-Grade Peptides · Pharmaceutical Quality Purity
              </span>
              <span className="mx-3 text-white/20">·</span>
              <Truck className="w-3.5 h-3.5 mx-2 shrink-0 text-white/70" />
              <span className="mx-8 font-semibold tracking-wide">
                Free Express Worldwide Shipping · Orders Over $250
              </span>
              <span className="mx-3 text-white/20">·</span>
              <Shield className="w-3 h-3 mx-2 shrink-0 text-white/50" />
              <span className="mx-8 tracking-wide">
                3rd-Party Lab Tested · Every Batch, Every Time
              </span>
              <span className="mx-3 text-white/20">·</span>
              <span className="mx-8 font-semibold tracking-wide">
                Trusted by Researchers in 40+ Countries
              </span>
              <span className="mx-4 text-white/15">•</span>
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default PreHeader;
