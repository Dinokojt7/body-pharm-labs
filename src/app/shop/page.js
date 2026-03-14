"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProductCard from "@/components/home/ProductCard";
import { fetchProducts } from "@/lib/services/product-service";
import LogoSpinner from "@/components/ui/LogoSpinner";

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      const { products } = await fetchProducts();
      setProducts(products);
      setFilteredProducts(products);

      // Extract unique categories
      const uniqueCategories = [
        "all",
        ...new Set(products.map((p) => p.category)),
      ];
      setCategories(uniqueCategories);

      setLoading(false);
    };

    loadProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter((p) => p.category === selectedCategory),
      );
    }
  }, [selectedCategory, products]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LogoSpinner size="w-16 h-16" />
      </div>
    );
  }

  return (
    <main>
      <Breadcrumb />

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-3">
            Thousands of Clients Worldwide
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-4">
            Research Peptides
          </h1>
          <p className="text-gray-500 text-sm max-w-xl mx-auto leading-relaxed">
            Browse our catalog of &gt;99% pure, third-party tested research
            peptides. All compounds are for laboratory use only.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 h-8 rounded text-xs font-medium tracking-widest uppercase transition-colors border ${
                selectedCategory === category
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {category === "all" ? "All Products" : category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500">No products found in this category.</p>
          </div>
        )}
      </div>
    </main>
  );
}
