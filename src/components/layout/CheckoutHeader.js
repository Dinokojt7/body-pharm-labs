"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

const STEPS = ["Cart", "Payment", "Done"];

// Which step index is "current" per route
function useStep(pathname) {
  if (pathname?.startsWith("/checkout/success")) return 2;
  return 1; // /checkout and /checkout/verify
}

export default function CheckoutHeader() {
  const pathname = usePathname();
  const currentStep = useStep(pathname);

  // Segment fill: segment i fills when currentStep > i
  // Segment 0 (Cart→Payment): filled when currentStep >= 1 (always on these routes)
  // Segment 1 (Payment→Done): filled when currentStep >= 2
  const segmentFilled = (i) => currentStep > i;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 h-16">
      <div className="h-full px-5 md:px-10 flex items-center justify-between gap-4">

        {/* Left — logo */}
        <Link href="/" className="shrink-0">
          <div className="relative w-28 h-9 sm:w-36 sm:h-11">
            <Image
              src="/images/logo-header.png"
              alt="Body Pharm Labs"
              fill
              priority
              className="object-contain object-left"
            />
          </div>
        </Link>

        {/* Center — 3-step progress */}
        <div className="flex items-center justify-center flex-1 select-none">
          {STEPS.map((label, i) => {
            const done = currentStep > i;
            const active = currentStep === i;
            return (
              <div key={label} className="flex items-center">
                {/* Step node */}
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                      done || active ? "bg-black" : "bg-gray-300"
                    }`}
                  />
                  <span
                    className={`text-[9px] sm:text-[10px] font-semibold tracking-[0.14em] uppercase transition-colors duration-300 ${
                      done || active ? "text-black" : "text-gray-400"
                    }`}
                  >
                    {label}
                  </span>
                </div>

                {/* Segment track between steps */}
                {i < STEPS.length - 1 && (
                  <div className="w-12 sm:w-20 md:w-28 h-px bg-gray-200 mx-2 mb-4 relative overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 bg-black transition-all duration-500 ${
                        segmentFilled(i) ? "w-full" : "w-0"
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right — close → back to cart */}
        <Link
          href="/cart"
          className="shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          aria-label="Close checkout"
        >
          <X className="w-4 h-4 text-gray-600" />
        </Link>

      </div>
    </header>
  );
}
