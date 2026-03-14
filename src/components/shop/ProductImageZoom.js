"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, X } from "lucide-react";

const ProductImageZoom = ({ product }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);

  const pillColor = product.customColor || "bg-black";

  const handleMouseMove = (e) => {
    if (!imageRef.current || !isZoomed) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMousePosition({ x, y });
  };

  return (
    <>
      <div
        ref={imageRef}
        className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Sale Pill */}
        <div
          className={`absolute top-4 left-4 z-10 flex items-center space-x-1 ${pillColor} text-white px-3 py-1 rounded-md`}
        >
          <span className="text-xs font-medium">BEST SELLING</span>
        </div>

        {/* Main Image */}
        <Image
          src={product.imageString || "/images/placeholder.jpg"}
          alt={product.name}
          fill
          className={`object-cover transition-transform duration-300 ${
            isZoomed ? "scale-150" : "scale-100"
          }`}
          style={{
            transformOrigin: isZoomed
              ? `${mousePosition.x}% ${mousePosition.y}%`
              : "center",
          }}
        />

        {/* Zoom Indicator */}
        <div className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full">
          <ZoomIn className="w-5 h-5" />
        </div>
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            onClick={() => setIsZoomed(false)}
          >
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-[90vw] h-[90vh]"
            >
              <Image
                src={product.imageString || "/images/placeholder.jpg"}
                alt={product.name}
                fill
                className="object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductImageZoom;
