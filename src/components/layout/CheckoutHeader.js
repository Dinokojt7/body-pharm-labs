"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

const STEPS = ["Cart", "Payment", "Done"];

function useStep(pathname) {
  if (pathname?.startsWith("/checkout/success")) return 2;
  return 1; // /checkout and /checkout/verify
}

export default function CheckoutHeader() {
  const pathname = usePathname();
  const currentStep = useStep(pathname);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 h-20 md:h-24">
      <div className="h-full px-4 md:px-8 lg:px-12 flex items-center gap-6">

        {/* Left — logo */}
        <Link href="/" className="shrink-0">
          <div className="relative w-40 h-12 sm:w-52 sm:h-14 md:w-64 md:h-18">
            <Image
              src="/images/logo-header.png"
              alt="Body Pharm Labs"
              fill
              priority
              className="object-contain object-left"
              sizes="(max-width: 768px) 288px, (max-width: 1024px) 384px, 448px"
            />
          </div>
        </Link>

        {/* Timeline — sits just after logo, not centered */}
        <div className="flex gap-1 w-full max-w-52 sm:max-w-xs select-none">
          {STEPS.map((label, i) => {
            const filled = i <= currentStep;
            return (
              <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className={`w-full h-1.5 rounded-full transition-all duration-300 ${
                    filled ? "bg-gray-700" : "border border-gray-300"
                  }`}
                />
                <span className={`text-[9px] font-medium tracking-wide ${filled ? "text-gray-700" : "text-gray-400"}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

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
