const ProductCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden relative">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
    <div className="space-y-2 px-1">
      <div className="h-3 bg-gray-100 rounded w-1/3" />
      <div className="h-4 bg-gray-100 rounded w-2/3" />
      <div className="h-3 bg-gray-100 rounded w-1/4 mt-1" />
      <div className="h-8 bg-gray-100 rounded mt-3" />
    </div>
  </div>
);

export default ProductCardSkeleton;
