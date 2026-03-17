"use client";

import { Minus, Plus } from "lucide-react";

const QuantitySelector = ({
  quantity,
  onIncrement,
  onDecrement,
  size = "md",
}) => {
  const sizeClasses = {
    xs: "h-6 text-xs",
    sm: "h-8 text-sm",
    md: "h-10 text-base",
    lg: "h-12 text-lg",
  };

  const buttonSize = {
    xs: "w-6",
    sm: "w-8",
    md: "w-10",
    lg: "w-12",
  };

  const iconSize = size === "xs" ? "w-3 h-3" : "w-4 h-4";
  const px = size === "xs" ? "px-2" : "px-4";

  return (
    <div
      className={`inline-flex items-center border border-gray-200 rounded ${sizeClasses[size]}`}
    >
      <button
        onClick={onDecrement}
        className={`${buttonSize[size]} flex items-center justify-center hover:bg-gray-100 transition-colors rounded-l-lg`}
      >
        <Minus className={iconSize} />
      </button>

      <span
        className={`${px} font-medium flex items-center justify-center ${sizeClasses[size]}`}
      >
        {quantity}
      </span>

      <button
        onClick={onIncrement}
        className={`${buttonSize[size]} flex items-center justify-center hover:bg-gray-100 transition-colors rounded-r-lg`}
      >
        <Plus className={iconSize} />
      </button>
    </div>
  );
};

export default QuantitySelector;
