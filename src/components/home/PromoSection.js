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
          TRUSTED BY THOUSANDS OF RESEARCHERS
        </motion.h3>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold text-black leading-tight mb-6"
        >
          WE WANT YOU
          <br />
          TO THIRD-PARTY TEST
          <br />
          OUR PRODUCTS
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 text-lg max-w-2xl mx-auto"
        >
          99%+ Purity is always guaranteed. We will offer credit for testing our
          products. If any batch fails to meet our published specifications,
          we'll replace it at no cost.
        </motion.p>
      </div>
    </section>
  );
};

export default PromoSection;
