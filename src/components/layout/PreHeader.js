"use client";

import { Truck } from "lucide-react";
import { motion } from "framer-motion";

const PreHeader = () => {
  return (
    <div className="bg-black text-white py-2 overflow-hidden border-b border-gray-800">
      <div className="relative flex items-center whitespace-nowrap">
        <motion.div
          animate={{ x: ["100%", "-100%"] }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex items-center space-x-2"
        >
          <span>
            Research-Grade Peptides – Trusted by Scientists Worldwide!
          </span>
          <Truck className="w-4 h-4 mx-2" />
          <span>
            <span className="font-bold">
              Free Same Day Worldwide Shipping on $250+ orders
            </span>
          </span>
          <span className="mx-4">•</span>
          <span>
            Research-Grade Peptides – Trusted by Scientists Worldwide!
          </span>
          <Truck className="w-4 h-4 mx-2" />
          <span>
            <span className="font-bold">
              Free Same Day Worldwide Shipping on $250+ orders
            </span>
          </span>
        </motion.div>
      </div>
    </div>
  );
};

export default PreHeader;
