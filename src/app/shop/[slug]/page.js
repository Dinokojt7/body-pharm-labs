"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ProductDetail from "@/components/shop/ProductDetail";
import RelatedProducts from "@/components/shop/RelatedProducts";
import { fetchProductBySlug } from "@/lib/services/product-service";
import LogoSpinner from "@/components/ui/LogoSpinner";

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      const { product, source } = await fetchProductBySlug(slug);

      if (product) {
        setProduct(product);
        setError(null);
      } else {
        setError("Product not found");
      }

      setLoading(false);
    };

    if (slug) {
      loadProduct();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LogoSpinner size="w-16 h-16" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <main className="">
        <Breadcrumb />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {error || "Product not found"}
          </h1>
          <a href="/shop" className="text-black underline">
            Return to Shop
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="">
      <Breadcrumb />

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12">
        <ProductDetail product={product} />
        <RelatedProducts product={product} />
      </div>
    </main>
  );
}
