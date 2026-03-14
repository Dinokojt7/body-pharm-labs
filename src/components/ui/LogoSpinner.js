"use client";

import { motion } from "framer-motion";
import { Atom } from "lucide-react";

const LogoSpinner = ({ size = "w-5 h-5", color = "text-black" }) => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      }}
      className={`${size} ${color}`}
    >
      <Atom className="w-full h-full" />
    </motion.div>
  );
};

export default LogoSpinner;
