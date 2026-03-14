"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import ProductCard from "./ProductCard";
import Button from "../ui/Button";
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
    <section className="relative w-full py-20 px-4 md:px-8 lg:px-12 bg-gray-50">
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

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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

        {/* View All Button */}
        <div className="text-center">
          <Button
            href="/shop"
            variant="primary"
            size="lg"
            icon={<ArrowRight className="w-5 h-5" />}
            iconPosition="right"
          >
            VIEW ALL PRODUCTS
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProductsGrid;
