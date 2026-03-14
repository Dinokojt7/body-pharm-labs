"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ProductCard from "../home/ProductCard";
import { getRelatedProducts } from "@/lib/services/product-service";

const RelatedProducts = ({ product }) => {
  const [related, setRelated] = useState([]);

  useEffect(() => {
    const loadRelated = async () => {
      const products = await getRelatedProducts(product, 4);
      setRelated(products);
    };

    if (product) {
      loadRelated();
    }
  }, [product]);

  if (related.length === 0) return null;

  return (
    <section className="mt-20 pt-20 border-t border-gray-200">
      <h2 className="text-2xl font-bold text-black mb-8">RELATED PRODUCTS</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {related.map((relatedProduct, index) => (
          <motion.div
            key={relatedProduct.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <ProductCard product={relatedProduct} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default RelatedProducts;
