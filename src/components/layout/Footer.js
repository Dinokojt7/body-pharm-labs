"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import siteData from "@/lib/data/site-data.json";

const Footer = () => {
  const { business, footer } = siteData;

  return (
    <footer className="w-full">
      {/* Main Footer */}
      <div className="bg-black/90 py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Column 1 - Logo & About */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <div className="relative h-16 w-32">
                <Image
                  src="/images/logo.png"
                  alt={business.name}
                  fill
                  className="object-contain brightness-0 invert"
                />
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                {business.description.substring(0, 120)}...
              </p>
            </motion.div>

            {/* Column 2 - Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <h4 className="text-white text-lg font-bold">Quick Links</h4>
              <ul className="space-y-2">
                {footer.quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Column 3 - Legal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h4 className="text-white text-lg font-bold">Legal</h4>
              <ul className="space-y-2">
                {footer.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Column 4 - Get in Touch */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h4 className="text-white text-lg font-bold">Get in Touch</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <a
                    href={`tel:${business.phone}`}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {business.phone}
                  </a>
                </div>
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <a
                    href={`mailto:${business.email}`}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {business.email}
                  </a>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400 text-sm">
                    {business.address}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Credits Section */}
      <div className="bg-black py-4">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-gray-600 text-xs text-center sm:text-left">
              Copyright © {new Date().getFullYear()} {business.name}. All rights
              reserved.
            </p>
            <p className="text-gray-600 text-xs">
              Research Use Only. Not for human consumption.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
