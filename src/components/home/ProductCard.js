"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

import { useCartStore } from "@/lib/stores/cart-store";
import { useCurrency } from "@/lib/hooks/useCurrency";
import QuantitySelector from "../shop/QuantitySelector";

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const { items, addItem, updateQuantity, isInCart, getItemQuantity } =
    useCartStore();
  const { formatPrice } = useCurrency();

  const inCart = isInCart(product.id, product.size);
  const quantity = getItemQuantity(product.id, product.size);

  const cartItem = items.find(
    (i) => i.id === product.id && i.selectedSize === product.size,
  );

  const handleAdd = () => {
    setIsAdding(true);
    addItem(product, 1, product.size);
    setTimeout(() => setIsAdding(false), 600);
  };

  const handleDecrement = () => {
    if (cartItem) updateQuantity(cartItem.cartId, quantity - 1);
  };

  return (
    <Link
      href={`/shop/${product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
    >
      <div
        className="group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image */}
        <div
          className="relative aspect-square border border-black/25 rounded-lg overflow-hidden mx-2"
          style={{ background: "linear-gradient(135deg, #d0d0d0 0%, #e8e8e8 30%, #f8f8f8 50%, #e4e4e4 70%, #cccccc 100%)" }}
        >
          <div
            className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-white text-xs font-semibold"
            style={{ backgroundColor: product.customColor || "#000" }}
          >
            SALE
          </div>

          <Image
            src={product.imageString || "/images/placeholder.jpg"}
            alt={product.name}
            fill
            className={`transition-transform duration-500 group-hover:scale-105 ${product.imageString?.endsWith(".png") ? "object-contain p-4" : "object-cover"}`}
          />

          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/90 flex items-center justify-center"
              >
                <div className="text-center">
                  <p className="text-gray-400 line-through text-sm">
                    {formatPrice(product.compareAtPrice || product.price * 1.3)}
                  </p>
                  <p className="text-black font-bold text-xl mb-1">
                    {formatPrice(product.price)}
                  </p>
                  {product.subtitle && (
                    <p className="text-black text-xs font-bold tracking-widest uppercase">
                      {product.subtitle}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Product Info
            Mobile: single flex row — [name+subtitle LEFT] [cart RIGHT]
            sm+:    stacked centered (original) */}
        <div className="mt-3">
          <div className="flex flex-col gap-2 sm:block sm:text-center">

            {/* Name + subtitle */}
            <div className="min-w-0">
              <h3 className="font-bold text-black text-xs sm:text-sm uppercase tracking-wide truncate sm:mb-3">
                {product.name}
              </h3>
            </div>

            {/* Cart controls — stop propagation so Link doesn't fire */}
            <div
              className="sm:mt-2 sm:flex sm:justify-center"
              onClick={(e) => e.preventDefault()}
            >
              {inCart ? (
                <>
                  <span className="sm:hidden">
                    <QuantitySelector
                      quantity={quantity}
                      onIncrement={handleAdd}
                      onDecrement={handleDecrement}
                      size="xs"
                    />
                  </span>
                  <span className="hidden sm:inline-flex">
                    <QuantitySelector
                      quantity={quantity}
                      onIncrement={handleAdd}
                      onDecrement={handleDecrement}
                      size="sm"
                    />
                  </span>
                </>
              ) : (
                <>
                  {/* Mobile: compact + icon */}
                  <button
                    onClick={handleAdd}
                    disabled={isAdding}
                    className="sm:hidden w-6 h-6 border border-gray-200 rounded bg-white flex items-center justify-center text-black hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {isAdding ? (
                      <div className="w-2.5 h-2.5 rounded-full border border-gray-300 border-t-black animate-spin" />
                    ) : (
                      <Plus className="w-3 h-3" />
                    )}
                  </button>
                  {/* sm+: full text button */}
                  <button
                    onClick={handleAdd}
                    disabled={isAdding}
                    className="hidden sm:inline-flex items-center gap-2 px-5 h-8 border border-gray-200 rounded bg-white text-xs font-medium tracking-widest uppercase text-black hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {isAdding ? (
                      <div className="w-3 h-3 rounded-full border border-gray-300 border-t-black animate-spin" />
                    ) : (
                      "ADD TO CART"
                    )}
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
