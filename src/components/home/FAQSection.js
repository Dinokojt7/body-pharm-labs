"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import faqs from "@/lib/data/faqs.json";

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative w-full py-20 pb-32 px-4 md:px-8 lg:px-12">
      {/* Background with overlay */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url(/images/faq-bg.jpg)" }}
        />
        <div className="absolute inset-0 bg-gray-900/90" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Left Column - Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-125 rounded-lg overflow-hidden"
          >
            <Image
              src="/images/faq-image.jpg"
              alt="FAQ"
              fill
              className="object-cover"
            />
          </motion.div>

          {/* Right Column - FAQ Accordion */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-gray-300 text-sm tracking-wider mb-2">
                FAQS
              </h3>
              <h2 className="text-white text-3xl md:text-4xl font-bold">
                HERE'S WHAT YOU
                <br />
                SHOULD KNOW
              </h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-white/20 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="text-white font-medium pr-8">
                      {faq.question}
                    </span>
                    <div className="shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                      {openIndex === index ? (
                        <Minus className="w-4 h-4 text-white" />
                      ) : (
                        <Plus className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 py-4 bg-white/5">
                          <p
                            className="text-gray-200 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: faq.answer }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Wave divider → PromoSection (white) */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none pointer-events-none">
        <svg
          viewBox="0 0 1440 72"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-18 block"
        >
          <path
            d="M0,40 C360,10 1080,72 1440,30 L1440,72 L0,72 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    </section>
  );
};

export default FAQSection;
