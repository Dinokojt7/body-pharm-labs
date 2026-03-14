"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check, Shield, Truck, Award } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import siteData from "@/lib/data/site-data.json";

export default function AboutPage() {
  const { business } = siteData;

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: ">99% Purity",
      description: "All compounds third-party tested for absolute purity",
    },
    {
      icon: <Truck className="w-8 h-8" />,
      title: "Same Day Shipping",
      description: "Most orders ship within 24 hours of placement",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Research Focused",
      description: "Exclusively serving qualified research professionals",
    },
  ];

  return (
    <main className="">
      <Breadcrumb />

      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-75 overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url(/images/about-hero.jpg)" }}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative h-full flex items-center justify-center text-center text-white px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-black mb-4">ABOUT US</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Pioneering Research Peptides with Uncompromising Quality
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            {business.mission}
          </p>
        </motion.div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-white rounded-full mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Quality Commitment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gray-50 rounded-2xl p-12 text-center"
        >
          <h2 className="text-3xl font-bold mb-6">Our Quality Commitment</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <div>
              <h3 className="font-bold mb-4 flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                Third-Party Testing
              </h3>
              <p className="text-gray-600">
                Every batch undergoes independent HPLC and mass spectrometry
                analysis. Certificates of Analysis available upon request.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                99% Purity Standard
              </h3>
              <p className="text-gray-600">
                We maintain a strict 99% purity minimum across all products,
                verified through rigorous testing protocols.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                Temperature Controlled
              </h3>
              <p className="text-gray-600">
                All shipments use appropriate cold-chain packaging to maintain
                compound integrity during transit.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                Batch Traceability
              </h3>
              <p className="text-gray-600">
                Full batch traceability ensures complete transparency from
                synthesis to your laboratory.
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
