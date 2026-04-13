"use client";

import { usePathname } from "next/navigation";
import PreHeader from "./PreHeader";
import Header from "./Header";
import Footer from "./Footer";
import CheckoutHeader from "./CheckoutHeader";
import MembershipModal from "@/components/ui/MembershipModal";

const CHECKOUT_ROUTES = ["/checkout", "/checkout/success", "/checkout/verify"];

export default function SiteChrome({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const isCheckout = CHECKOUT_ROUTES.some((r) => pathname === r || pathname?.startsWith(r + "/"));

  if (isAdmin) {
    return <>{children}</>;
  }

  if (isCheckout) {
    return (
      <>
        <CheckoutHeader />
        <main className="min-h-screen pt-16 bg-white">{children}</main>
      </>
    );
  }

  return (
    <>
      <PreHeader />
      <Header />
      <main className="min-h-screen pt-20 md:pt-24">{children}</main>
      <Footer />
      <MembershipModal />
    </>
  );
}
