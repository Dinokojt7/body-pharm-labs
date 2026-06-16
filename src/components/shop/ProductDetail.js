"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Award } from "lucide-react";
import Link from "next/link";

import { useCartStore } from "@/lib/stores/cart-store";
import { useCurrency } from "@/lib/hooks/useCurrency";
import ProductImageZoom from "./ProductImageZoom";
import QuantitySelector from "./QuantitySelector";
import CustomSelect from "@/components/ui/CustomSelect";

const ProductDetail = ({ product }) => {
  const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(
    product.size || (hasSizes ? product.sizes[0] : "")
  );
  const [isAdding, setIsAdding] = useState(false);
  const [selectedGalleryImage, setSelectedGalleryImage] = useState(null);

  const { addItem, items } = useCartStore();
  const { formatPrice } = useCurrency();

  const activePrice =
    (product.sizePrices && selectedSize && product.sizePrices[selectedSize]) ||
    product.price;

  // Size-specific image (null if none defined for this size)
  const sizeImage =
    (product.sizeImages && selectedSize && product.sizeImages[selectedSize]) ||
    null;

  // Gallery selection overrides size image; size image overrides primary
  const displayImage =
    selectedGalleryImage ??
    sizeImage ??
    product.imageString ??
    product.imageUrl ??
    null;

  // Thumbnail strip: primary image + any extra gallery images
  const thumbnails = [
    product.imageString || product.imageUrl,
    ...(product.images || []),
  ].filter(Boolean);
  const showThumbnails = thumbnails.length > 1;

  const isThumbActive = (url) => {
    if (selectedGalleryImage) return url === selectedGalleryImage;
    if (sizeImage) return url === sizeImage;
    return url === (product.imageString || product.imageUrl);
  };

  const cartQty = items
    .filter((item) => item.id === product.id)
    .reduce((sum, item) => sum + item.quantity, 0);

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    setSelectedGalleryImage(null);
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    addItem({ ...product, price: activePrice }, quantity, selectedSize);
    setQuantity(1);
    setTimeout(() => setIsAdding(false), 800);
  };

  return (
    <div className="grid md:grid-cols-2 gap-12">
      {/* Left Column - Image */}
      <div className="space-y-3">
        <ProductImageZoom product={product} activeImage={displayImage} />

        {/* Thumbnail strip */}
        {showThumbnails && (
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {thumbnails.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelectedGalleryImage(url)}
                className={`relative w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-150 ${
                  isThumbActive(url)
                    ? "border-black"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <Image
                  src={url}
                  alt={`${product.name} view ${i + 1}`}
                  fill
                  className="object-contain p-1"
                  sizes="64px"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right Column - Details */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">
            {product.name}
          </h1>
          <p className="text-2xl text-gray-600">{formatPrice(activePrice)}</p>
        </div>

        {/* Description */}
        <div>
          <h3 className="font-bold text-black mb-2">Description</h3>
          <p className="text-gray-600 leading-relaxed">
            {product.details || product.description}
          </p>
        </div>

        {/* Pricing Table */}
        <div className="border border-gray-200 rounded overflow-hidden">
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
        {hasSizes && (
          <div>
            <h3 className="font-bold text-black mb-2">Select Mg</h3>
            <CustomSelect
              value={selectedSize}
              onChange={handleSizeChange}
              options={product.sizes.map((size) => ({
                value: size,
                label: `${size} — ${formatPrice(product.sizePrices?.[size] ?? product.price)}`,
              }))}
            />
          </div>
        )}

        {/* Quantity and Add to Cart */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <span className="font-bold text-sm">Quantity:</span>
            <QuantitySelector
              quantity={quantity}
              onIncrement={() => setQuantity((q) => q + 1)}
              onDecrement={() => setQuantity((q) => Math.max(1, q - 1))}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={(hasSizes && !selectedSize) || isAdding}
              className="flex-1 h-11 bg-black text-white rounded text-xs font-medium tracking-widest uppercase hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isAdding ? "ADDING..." : "ADD TO CART"}
            </button>

            {cartQty > 0 && (
              <Link
                href="/cart"
                className="flex-1 h-11 flex items-center justify-center gap-2 border border-gray-200 rounded shadow-sm text-xs text-gray-600 font-medium hover:border-gray-300 hover:shadow transition-all px-3"
              >
                <span className="truncate">
                  {product.name} &times; {cartQty}
                </span>
                <span className="text-gray-400 shrink-0">· View in cart</span>
              </Link>
            )}
          </div>
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
