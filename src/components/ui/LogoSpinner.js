"use client";

import { motion } from "framer-motion";

const LogoSpinner = ({ size = "w-8 h-8" }) => {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={`${size} relative shrink-0`}
    >
      <img
        src="/favicon.ico"
        alt="Loading..."
        className="w-full h-full object-contain"
      />
    </motion.div>
  );
};

export default LogoSpinner;
