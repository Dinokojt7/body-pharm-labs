"use client";

import { Search, X } from "lucide-react";

export default function SearchBar({ query, onChange, inputRef }) {
  return (
    <div className="flex items-center border border-gray-200 rounded-full px-4 h-10 bg-white focus-within:border-gray-400 transition-colors w-full">
      <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products..."
        className="flex-1 ml-2.5 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
      />
      {query && (
        <button
          onClick={() => onChange("")}
          className="ml-1 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
