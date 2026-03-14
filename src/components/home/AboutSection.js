"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Button from "../ui/Button";
import siteData from "@/lib/data/site-data.json";

const AboutSection = () => {
  const { business } = siteData;

  return (
    <section className="relative w-full py-20 px-4 md:px-8 lg:px-12">
      {/* Background with overlay */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url(/images/about-bg.jpg)" }}
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto">
        {/* Section Headers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="text-gray-300 text-sm tracking-wider mb-2">
            FULL CUSTOMER SUPPORT & QUALITY SERVICE
          </h3>
          <h2 className="text-white text-3xl md:text-4xl font-bold">
            BIGGEST SUPPLIER OF RESEARCH PEPTIDES
            <br />
            WITH WORLDWIDE SHIPPING!
          </h2>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-[600px] rounded-lg overflow-hidden"
          >
            <Image
              src="/images/about-image.jpg"
              alt="Research Laboratory"
              fill
              className="object-cover"
            />
          </motion.div>

          {/* Right Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-white space-y-6 py-12"
          >
            <h3 className="text-gray-300 text-sm tracking-wider">ABOUT US</h3>
            <h2 className="text-3xl md:text-4xl font-bold">
              Premium Research Peptides
              <br />
              You Can Trust, 3rd-Party Tested
              <br />
              with 99% Purity.
            </h2>
            <p className="text-gray-200 leading-relaxed">
              {business.description}
            </p>
            <p className="text-gray-200 leading-relaxed">
              We understand that behind every vial we ship, there is critical
              research taking place — and lives that may one day be changed
              because of it. That's why we hold ourselves to the highest
              standards in product purity, consistency, and customer care.
            </p>
            <Button
              href="/about"
              variant="outline"
              icon={<ArrowRight className="w-5 h-5" />}
              iconPosition="right"
            >
              LEARN MORE
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
