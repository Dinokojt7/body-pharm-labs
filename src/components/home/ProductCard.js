"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Atom } from "lucide-react";

import { useCartStore } from "@/lib/stores/cart-store";
import { useCurrency } from "@/lib/hooks/useCurrency";
import LogoSpinner from "../ui/LogoSpinner";

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem, isInCart, getItemQuantity } = useCartStore();
  const { formatPrice } = useCurrency();

  const inCart = isInCart(product.id, product.size);
  const quantity = getItemQuantity(product.id, product.size);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAdding(true);
    addItem(product, 1, product.size);

    // Visual feedback for 1 second
    setTimeout(() => setIsAdding(false), 1000);
  };

  const pillColor = product.customColor || "bg-black";

  return (
    <Link href={`/shop/${product.name.toLowerCase().replace(/\s+/g, "-")}`}>
      <div
        className="group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-square bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
          {/* Sale Pill */}
          <div
            className={`absolute top-4 left-4 z-10 flex items-center space-x-1 ${pillColor} text-white px-3 py-1 rounded-md`}
          >
            <Atom className="w-4 h-4" />
            <span className="text-xs font-medium">SALE!</span>
          </div>

          {/* Product Image */}
          <Image
            src={product.imageString || "/images/placeholder.jpg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Hover Overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/90 flex items-center justify-center"
              >
                <div className="text-center">
                  <p className="text-gray-500 line-through text-sm">
                    {formatPrice(product.compareAtPrice || product.price * 1.3)}
                  </p>
                  <p className="text-black font-bold text-xl mb-2">
                    {formatPrice(product.price)}
                  </p>
                  <p className="text-black text-xs font-bold">
                    BODY PHARM LABZ
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Product Info */}
        <div className="mt-4 text-center">
          <h3 className="font-bold text-black uppercase tracking-wide mb-2 line-clamp-2">
            {product.name}
          </h3>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="px-6 py-2 border-2 border-black text-black font-medium rounded-md hover:bg-black hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center space-x-2"
          >
            {isAdding ? (
              <>
                <LogoSpinner size="w-4 h-4" color="text-black" />
                <span>ADDING...</span>
              </>
            ) : (
              <span>{inCart ? `ADD MORE (${quantity})` : "ADD TO CART"}</span>
            )}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
