const ProductDetailSkeleton = () => (
  <div className="grid md:grid-cols-2 gap-8 lg:gap-16 animate-pulse">
    {/* Image */}
    <div className="aspect-square bg-gray-100 rounded overflow-hidden relative">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>

    {/* Details */}
    <div className="space-y-5 py-2">
      {/* Category tag */}
      <div className="h-3 bg-gray-100 rounded w-20" />

      {/* Title */}
      <div className="space-y-2">
        <div className="h-7 bg-gray-100 rounded w-3/4" />
        <div className="h-5 bg-gray-100 rounded w-1/2" />
      </div>

      {/* Price */}
      <div className="h-8 bg-gray-100 rounded w-28" />

      {/* Description lines */}
      <div className="space-y-2 pt-2">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
        <div className="h-3 bg-gray-100 rounded w-4/6" />
      </div>

      {/* Size selector */}
      <div className="h-10 bg-gray-100 rounded-lg w-full" />

      {/* Qty + Add to cart */}
      <div className="flex gap-3">
        <div className="h-11 bg-gray-100 rounded w-28" />
        <div className="h-11 bg-gray-100 rounded flex-1" />
      </div>

      {/* Tags row */}
      <div className="flex gap-2 pt-2">
        <div className="h-6 bg-gray-100 rounded w-20" />
        <div className="h-6 bg-gray-100 rounded w-24" />
        <div className="h-6 bg-gray-100 rounded w-20" />
      </div>
    </div>
  </div>
);

export default ProductDetailSkeleton;
