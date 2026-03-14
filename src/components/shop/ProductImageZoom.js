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
      className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-zoom-in select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setOrigin({ x: 50, y: 50 }); }}
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
        className="object-cover transition-transform duration-200 ease-out pointer-events-none"
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
