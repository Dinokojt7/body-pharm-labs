"use client";

import { useState, useRef } from "react";
import Image from "next/image";

const ProductImageZoom = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const containerRef = useRef(null);

  const pillColor = product.customColor || "bg-black";

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x, y });
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-square border border-black/25 rounded-lg overflow-hidden cursor-zoom-in select-none"
      style={{ background: "linear-gradient(135deg, #d0d0d0 0%, #e8e8e8 30%, #f8f8f8 50%, #e4e4e4 70%, #cccccc 100%)" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setOrigin({ x: 50, y: 50 });
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Sale Pill */}
      <div
        className={`absolute top-4 left-4 z-10 flex items-center space-x-1 ${pillColor} text-white px-3 py-1 rounded-md pointer-events-none`}
      >
        <span className="text-xs font-medium">BEST SELLING</span>
      </div>

      {/* Zoomable Image */}
      <Image
        src={product.imageString || "/images/placeholder.jpg"}
        alt={product.name}
        fill
        className={`transition-transform duration-200 ease-out pointer-events-none ${product.imageString?.endsWith(".png") ? `object-contain ${product.imageFit === "large" ? "p-2" : "p-6"}` : "object-cover"}`}
        style={{
          transform: isHovered ? "scale(2)" : "scale(1)",
          transformOrigin: `${origin.x}% ${origin.y}%`,
        }}
        draggable={false}
      />
    </div>
  );
};

export default ProductImageZoom;
