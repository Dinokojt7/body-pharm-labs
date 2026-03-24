"use client";

import { usePathname } from "next/navigation";
import PreHeader from "./PreHeader";
import Header from "./Header";
import Footer from "./Footer";

export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <PreHeader />
      <Header />
      <main className="min-h-screen pt-20 md:pt-24">{children}</main>
      <Footer />
    </>
  );
}
