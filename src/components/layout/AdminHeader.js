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
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* Left — back arrow on sub-pages, empty on hub */}
      <div>
        {backHref ? (
          <Link href={backHref} className="p-1 rounded hover:bg-gray-100 transition-colors inline-flex">
            <ArrowLeft className="w-4 h-4 text-gray-400" />
          </Link>
        ) : (
          <span />
        )}
      </div>

      {/* Right — label + logo + sign out */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-semibold text-gray-400 tracking-wide uppercase">
          Admin Dashboard
        </span>

        <div className="relative w-24 h-8">
          <Image
            src="/images/logo-header.png"
            alt="Body Pharm Labs"
            fill
            className="object-contain object-right"
          />
        </div>

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
