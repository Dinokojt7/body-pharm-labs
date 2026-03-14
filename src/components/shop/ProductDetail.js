"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Check, Award } from "lucide-react";

import { useCartStore } from "@/lib/stores/cart-store";
import { useCurrency } from "@/lib/hooks/useCurrency";
import ProductImageZoom from "./ProductImageZoom";
import QuantitySelector from "./QuantitySelector";
import Button from "../ui/Button";

const ProductDetail = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(product.size);
  const [isAdding, setIsAdding] = useState(false);

  const { addItem } = useCartStore();
  const { formatPrice } = useCurrency();

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem(product, quantity, selectedSize);

    setTimeout(() => setIsAdding(false), 1000);
  };

  const savings = product.compareAtPrice
    ? (
        ((product.compareAtPrice - product.price) / product.compareAtPrice) *
        100
      ).toFixed(0)
    : 0;

  return (
    <div className="grid md:grid-cols-2 gap-12">
      {/* Left Column - Image */}
      <div className="space-y-4">
        <ProductImageZoom product={product} />

        {/* Thumbnails - Add if needed */}
      </div>

      {/* Right Column - Details */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">
            {product.name}
          </h1>
          <p className="text-2xl text-gray-600">{formatPrice(product.price)}</p>
        </div>

        {/* Description */}
        <div>
          <h3 className="font-bold text-black mb-2">Description</h3>
          <p className="text-gray-600 leading-relaxed">
            {product.details || product.description}
          </p>
        </div>

        {/* Pricing Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-3 bg-gray-50 p-4 font-bold text-sm">
            <div>Vials</div>
            <div>Quantity</div>
            <div>Discount</div>
          </div>
          <div className="grid grid-cols-3 p-4 border-t border-gray-200">
            <div className="text-gray-600">Most Popular</div>
            <div>3-5</div>
            <div className="text-green-600">10%</div>
          </div>
          <div className="grid grid-cols-3 p-4 border-t border-gray-200">
            <div className="text-gray-600">Max Savings</div>
            <div>6+</div>
            <div className="text-green-600">15%</div>
          </div>
        </div>

        {/* Points */}
        <p className="text-sm text-gray-500">
          Earn up to{" "}
          <span className="font-bold text-black">
            {product.points || 0} points
          </span>
        </p>

        {/* Size Selection */}
        <div>
          <h3 className="font-bold text-black mb-2">Select Mg</h3>
          <div className="relative">
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg appearance-none focus:border-black focus:outline-none cursor-pointer"
            >
              <option value="">Choose an option</option>
              {product.sizes?.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Price Comparison */}
        {product.compareAtPrice && (
          <div className="flex items-center space-x-3">
            <span className="text-gray-400 line-through text-lg">
              {formatPrice(product.compareAtPrice)}
            </span>
            <span className="text-black font-bold text-xl">
              {formatPrice(product.price)}
            </span>
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-sm font-medium">
              Save {savings}%
            </span>
          </div>
        )}

        {/* Quantity and Add to Cart */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <span className="font-bold">Quantity:</span>
            <QuantitySelector
              quantity={quantity}
              onIncrement={() => setQuantity((q) => q + 1)}
              onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
            />
          </div>

          <Button
            onClick={handleAddToCart}
            variant="primary"
            size="lg"
            fullWidth
            disabled={!selectedSize || isAdding}
          >
            {isAdding ? "ADDING TO CART..." : "ADD TO CART"}
          </Button>
        </div>

        {/* Category */}
        <p className="text-sm text-gray-500">
          Category:{" "}
          <span className="font-bold text-black">{product.category}</span>
        </p>

        {/* Trust Badges */}
        <div className="flex items-center space-x-6 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm">99% Purity</span>
          </div>
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-green-600" />
            <span className="text-sm">3rd-Party Tested</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
