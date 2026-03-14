"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

import { useCartStore } from "@/lib/stores/cart-store";
import { useCurrency } from "@/lib/hooks/useCurrency";
import LogoSpinner from "../ui/LogoSpinner";
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
        {/* Image Container */}
        <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
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
            className="object-cover transition-transform duration-500 group-hover:scale-105"
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
                  <p className="text-black text-xs font-bold tracking-widest uppercase">
                    Body Pharm Labz
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Product Info */}
        <div className="mt-3 text-center">
          <h3 className="font-bold text-black text-sm uppercase tracking-wide mb-1 truncate">
            {product.name}
          </h3>
          {product.subtitle && (
            <p className="text-xs text-gray-400 mb-3">{product.subtitle}</p>
          )}

          {/* Cart Controls — stop propagation so Link doesn't fire */}
          <div
            className="flex items-center justify-center mt-2"
            onClick={(e) => e.preventDefault()}
          >
            {inCart ? (
              <QuantitySelector
                quantity={quantity}
                onIncrement={handleAdd}
                onDecrement={handleDecrement}
                size="sm"
              />
            ) : (
              <button
                onClick={handleAdd}
                disabled={isAdding}
                className="inline-flex items-center gap-2 px-5 h-8 border border-gray-200 rounded-lg bg-white text-xs font-medium tracking-widest uppercase text-black hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {isAdding ? <LogoSpinner size="w-3 h-3" /> : "ADD TO CART"}
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
