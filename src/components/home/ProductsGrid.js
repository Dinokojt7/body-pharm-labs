"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import ProductCard from "./ProductCard";
import { fetchProducts } from "@/lib/services/product-service";
import LogoSpinner from "../ui/LogoSpinner";

const ProductsGrid = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const { products, source } = await fetchProducts({ featured: true });
      setProducts(products.slice(0, 8)); // Show first 8 featured products
      setLoading(false);
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LogoSpinner size="w-12 h-12" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 text-red-600">
        Error loading products: {error}
      </div>
    );
  }

  return (
    <section className="relative w-full py-20 pb-32 px-4 md:px-8 lg:px-12 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Headers */}
        <div className="text-center mb-12">
          <h3 className="text-gray-500 text-sm tracking-wider mb-2">
            THOUSANDS OF CLIENTS WORLDWIDE
          </h3>
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Our Best Sellers
          </h2>
          <p className="text-gray-600 text-lg mb-2">Buy More, Save More.</p>
          <p className="text-black font-bold">FREE SHIPPING $250+</p>
        </div>

        {/* Products Grid — gap-x between columns, gap-y between rows with a faint divider feel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 mb-12">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {/* Subtle row divider between the two product rows on desktop */}
        <div className="hidden lg:block w-full h-px bg-gray-200/60 -mt-4 mb-10" />

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-5 py-2 border border-gray-200 rounded-lg bg-white text-xs font-medium tracking-widest uppercase text-black hover:bg-gray-50 transition-colors"
          >
            VIEW ALL PRODUCTS
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Diagonal divider → FAQ (dark) */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none pointer-events-none">
        <svg
          viewBox="0 0 1440 72"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-18 block"
        >
          <path
            d="M0,24 C480,72 960,0 1440,40 L1440,72 L0,72 Z"
            fill="#111827"
          />
        </svg>
      </div>
    </section>
  );
};

export default ProductsGrid;
