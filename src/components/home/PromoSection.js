"use client";

import { motion } from "framer-motion";

const PromoSection = () => {
  return (
    <section className="w-full py-20 px-4 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-gray-500 text-sm tracking-wider mb-4"
        >
          TRUSTED BY THOUSANDS OF CUSTOMERS
        </motion.h3>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-2xl sm:text-4xl md:text-6xl font-bold text-black leading-tight"
        >
          99%+ PURITY IS
          <br />
          ALWAYS GUARANTEED.
        </motion.h2>
      </div>
    </section>
  );
};

export default PromoSection;
