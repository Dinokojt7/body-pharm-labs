"use client";

import { Minus, Plus } from "lucide-react";

const QuantitySelector = ({
  quantity,
  onIncrement,
  onDecrement,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "h-8 text-sm",
    md: "h-10 text-base",
    lg: "h-12 text-lg",
  };

  const buttonSize = {
    sm: "w-8",
    md: "w-10",
    lg: "w-12",
  };

  return (
    <div
      className={`inline-flex items-center border border-gray-200 rounded-lg ${sizeClasses[size]}`}
    >
      <button
        onClick={onDecrement}
        className={`${buttonSize[size]} flex items-center justify-center hover:bg-gray-100 transition-colors rounded-l-lg`}
      >
        <Minus className="w-4 h-4" />
      </button>

      <span className={`px-4 font-medium ${sizeClasses[size]}`}>
        {quantity}
      </span>

      <button
        onClick={onIncrement}
        className={`${buttonSize[size]} flex items-center justify-center hover:bg-gray-100 transition-colors rounded-r-lg`}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

export default QuantitySelector;
