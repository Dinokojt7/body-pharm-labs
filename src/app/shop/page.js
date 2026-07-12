"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProductCard from "@/components/home/ProductCard";
import { fetchProducts } from "@/lib/services/product-service";
import { getCategories } from "@/lib/firebase/firestore";
import ProductCardSkeleton from "@/components/ui/ProductCardSkeleton";

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) setSearchQuery(q);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [{ products }, { categories: activeCats }] = await Promise.all([
        fetchProducts(),
        getCategories({ activeOnly: true }),
      ]);
      setProducts(products);
      setFilteredProducts(products);
      setCategories(["all", ...activeCats.map((c) => c.name)]);
      setLoading(false);
    };

    load();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.subtitle?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q),
      );
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, products, searchQuery]);

  if (loading) {
    return (
      <main className="bg-white">
        <Breadcrumb />
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-white">
      <Breadcrumb />

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-2 md:mb-3">
            Thousands of Clients Worldwide
          </p>
          <h1 className="text-2xl md:text-4xl font-bold text-black mb-3 md:mb-4">
            Research Peptides
          </h1>
          <p className="text-gray-500 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
            Browse our catalog of &gt;99% pure, third-party tested peptides
            delivered straight to your door.
          </p>
        </div>

        {/* Active search query indicator */}
        {searchQuery && (
          <div className="flex items-center justify-center gap-2 mb-4 -mt-4 md:-mt-6">
            <span className="text-sm text-gray-500">
              Showing results for &quot;{searchQuery}&quot;
            </span>
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-gray-400 hover:text-gray-700 underline transition-colors"
            >
              Clear
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 md:mb-12 scrollbar-none -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap md:justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`shrink-0 px-5 h-8 rounded text-xs font-medium tracking-widest uppercase transition-colors border whitespace-nowrap ${
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
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6 md:gap-6">
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
