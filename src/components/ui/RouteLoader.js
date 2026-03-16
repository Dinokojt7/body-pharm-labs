"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function RouteLoader() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 600);
    return () => clearTimeout(t);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/20 backdrop-blur-[1px]">
      <div className="w-16 h-16 rounded-lg bg-white shadow-md flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-black animate-spin" />
      </div>
    </div>
  );
}
