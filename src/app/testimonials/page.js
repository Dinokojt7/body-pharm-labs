"use client";

import Link from "next/link";

export default function TestimonialsPage() {
  return (
    <main className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-4 md:px-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-black mb-4">
          Testimonials
        </h1>
        <p className="text-gray-400 text-sm mb-8">
          Client reviews coming soon.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2 border border-gray-200 rounded-lg text-xs font-medium tracking-widest uppercase text-black hover:bg-gray-50 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
