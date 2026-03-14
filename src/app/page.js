"use client";

import AboutSection from "../components/home/AboutSection";
import FAQSection from "../components/home/FAQSection";
import Hero from "../components/home/Hero";
import ProductsGrid from "../components/home/ProductsGrid";
import PromoSection from "../components/home/PromoSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <AboutSection />
      <ProductsGrid />
      <FAQSection />
      <PromoSection />
    </>
  );
}
