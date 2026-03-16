"use client";
import Breadcrumb from "@/components/ui/Breadcrumb";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Dr. Aisha Patel",
    role: "Research Scientist, Neuroscience Lab",
    country: "UK",
    rating: 5,
    text: "Body Pharm Labz has been our go-to supplier for over two years. The purity consistently exceeds our expectations, and the detailed CoA reports give our team full confidence. Delivery to the UK is remarkably fast.",
  },
  {
    name: "Prof. Marcus Reinholt",
    role: "Principal Investigator, University Hospital",
    country: "Germany",
    rating: 5,
    text: "We have sourced peptides from multiple vendors and Body Pharm Labz stands apart. Every batch is third-party verified and the consistency between orders is something we have not found elsewhere at this price point.",
  },
  {
    name: "Dr. Zanele Mokoena",
    role: "Biochemistry Researcher",
    country: "South Africa",
    rating: 5,
    text: "Same-day dispatch is a game changer for our lab workflow. Ordered on a Tuesday and had our RE:BUILD compound in hand by Wednesday. Quality is outstanding, always above 99% purity.",
  },
  {
    name: "James Thornton",
    role: "Lab Director, BioTech Startup",
    country: "United States",
    rating: 5,
    text: "The RE:ZEMPIC compound performed exactly as expected across our full trial series. Communication with the team is excellent and they responded within an hour to our bulk inquiry.",
  },
  {
    name: "Dr. Fatima Al-Rashid",
    role: "Senior Peptide Researcher",
    country: "UAE",
    rating: 5,
    text: "International shipping was seamless and arrived well within the promised window. Packaging is discreet and professional. Our research team is incredibly satisfied with RE:PAIR compound results.",
  },
  {
    name: "Thomas van der Berg",
    role: "Endocrinology Research Fellow",
    country: "Netherlands",
    rating: 5,
    text: "I was skeptical at first but the CoA matched independent testing we conducted in-house. That level of transparency is rare. Body Pharm Labz has earned our long-term business.",
  },
];

const stats = [
  { value: "10,000+", label: "Orders Fulfilled" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "40+", label: "Countries Served" },
  { value: ">99%", label: "Purity Guaranteed" },
];

export default function TestimonialsPage() {
  return (
    <main className="min-h-screen bg-white pb-20">
      <Breadcrumb />
      <div className="max-w-5xl mx-auto px-4 md:px-8 pt-12 text-center mb-16">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-3"
        >
          What Researchers Say
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-3xl md:text-4xl font-bold text-black mb-4"
        >
          Trusted by Scientists Worldwide
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 text-sm max-w-xl mx-auto leading-relaxed"
        >
          Over 10,000 orders fulfilled across 40+ countries.
        </motion.p>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100 border border-gray-100 rounded-lg overflow-hidden">
          {stats.map((s) => (
            <div key={s.label} className="bg-white px-6 py-8 text-center">
              <p className="text-2xl md:text-3xl font-black text-black mb-1">
                {s.value}
              </p>
              <p className="text-xs text-gray-400 tracking-wider uppercase">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="bg-white border border-gray-100 rounded-lg p-6 flex flex-col gap-4"
            >
              <Quote className="w-5 h-5 text-gray-200 shrink-0" />
              <p className="text-gray-600 text-sm leading-relaxed flex-1">
                {t.text}
              </p>
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, si) => (
                  <Star
                    key={si}
                    className="w-3.5 h-3.5 fill-black text-black"
                  />
                ))}
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-bold text-black">{t.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.role}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.country}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
