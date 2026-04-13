"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { LogOut, ArrowLeft } from "lucide-react";

export default function AdminHeader({ backHref = null }) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.replace("/admin");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-8 lg:px-12 h-20 md:h-24 flex items-center justify-between">
      {/* Left — logo (+ back arrow on sub-pages) */}
      <div className="flex items-center gap-3">
        {backHref && (
          <Link href={backHref} className="p-1 rounded hover:bg-gray-100 transition-colors inline-flex shrink-0">
            <ArrowLeft className="w-4 h-4 text-gray-400" />
          </Link>
        )}
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
      </div>

      {/* Right — label + sign out */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-semibold text-gray-400 tracking-wide uppercase hidden sm:block">
          Admin Dashboard
        </span>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </header>
  );
}
