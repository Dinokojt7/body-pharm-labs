"use client";

import { Truck } from "lucide-react";
import { motion } from "framer-motion";

const PreHeader = () => {
  return (
    <div className="bg-black/40 backdrop-blur-md text-white py-2 overflow-hidden border-b border-white/10">
      <div className="relative flex items-center whitespace-nowrap">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex items-center text-xs"
        >
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="flex items-center">
              <span className="mx-8">
                Research-Grade Peptides – Trusted by Scientists Worldwide!
              </span>
              <Truck className="w-3 h-3 mx-2 shrink-0" />
              <span className="mx-8 font-bold">
                Free Same Day Worldwide Shipping on $250+ orders
              </span>
              <span className="mx-4 text-gray-500">•</span>
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default PreHeader;
