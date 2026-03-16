"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Home, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-96px)] md:min-h-[calc(100vh-112px)] lg:min-h-[calc(100vh-128px)] bg-white flex flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <p className="text-[120px] md:text-[160px] font-black text-gray-100 leading-none select-none">
          404
        </p>

        <div className="-mt-4">
          <h1 className="text-2xl font-bold text-black mb-3">Page not found</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-10">
            The page you're looking for doesn't exist or has been moved. Let's
            get you back to something useful.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-xs font-medium tracking-widest uppercase hover:bg-gray-900 transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              Back Home
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 bg-white text-black rounded-xl text-xs font-medium tracking-widest uppercase hover:bg-gray-50 transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Browse Products
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
