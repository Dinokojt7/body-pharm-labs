"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import siteData from "@/lib/data/site-data.json";

const Footer = () => {
  const { business, footer } = siteData;

  const socialLinks = [
    {
      icon: Instagram,
      href: business.social.instagram,
      label: "Instagram",
      color: "hover:text-[#E4405F]",
    },
    {
      icon: Facebook,
      href: business.social.facebook,
      label: "Facebook",
      color: "hover:text-[#1877F2]",
    },
    {
      icon: Twitter,
      href: business.social.twitter,
      label: "Twitter",
      color: "hover:text-[#1DA1F2]",
    },
    {
      icon: Linkedin,
      href: business.social.linkedin,
      label: "LinkedIn",
      color: "hover:text-[#0A66C2]",
    },
  ];

  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200 relative">
      {/* Main Footer */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-12 md:py-16">
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column - Brand (3 columns) */}
          {/* Left Column - Brand - LOGO NOW LEFT ALIGNED */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 space-y-5"
          >
            {/* Logo - LEFT ALIGNED and BIGGER */}
            <div className="relative h-20 w-64 md:h-24 md:w-80 ml-0">
              <Image
                src="/images/logo.png"
                alt={business.name}
                fill
                className="object-contain object-left"
                priority
              />
            </div>

            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              {business.description}
            </p>

            <div className="flex items-center gap-2 pt-2">
              <Sparkles className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400 tracking-wider uppercase">
                ISO 9001:2024 Certified
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map(({ icon: Icon, href, label, color }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={`w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-white ${color} hover:border-transparent transition-all duration-300 shadow-sm hover:shadow`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links Column (2.5 columns) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <h4 className="text-black text-xs font-bold tracking-[0.15em] uppercase mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {footer.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-gray-500 hover:text-black transition-colors text-sm"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-black transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal Column (3 columns) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <h4 className="text-black text-xs font-bold tracking-[0.15em] uppercase mb-5">
              Legal
            </h4>
            <ul className="space-y-3">
              {footer.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-gray-500 hover:text-black transition-colors text-sm"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-black transition-colors" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="text-xs text-gray-400 mt-6 pt-4 border-t border-gray-200">
              All products for research use only.
              <br />
              Not for human consumption.
            </p>
          </motion.div>

          {/* Contact Column (3.5 columns) - Clean and simple like others */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-4"
          >
            <h4 className="text-black text-xs font-bold tracking-[0.15em] uppercase mb-5">
              Contact
            </h4>

            <div className="space-y-4">
              {/* Phone */}
              <a
                href={`tel:${business.phone}`}
                className="flex items-center gap-3 text-gray-600 hover:text-black transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-black transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="text-sm">{business.phone}</span>
              </a>

              {/* Email */}
              <a
                href={`mailto:${business.email}`}
                className="flex items-center gap-3 text-gray-600 hover:text-black transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-black transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-sm break-all">{business.email}</span>
              </a>

              {/* Address */}
              <div className="flex items-start gap-3 text-gray-600">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-sm leading-relaxed">
                  {business.address}
                </span>
              </div>

            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-16 py-5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-gray-400 text-xs">
              © {new Date().getFullYear()} {business.name}. All rights reserved.
            </p>

            <div className="flex items-center gap-4">
              <p className="text-gray-400 text-xs">Research Use Only</p>
              <span className="text-gray-300 text-xs">|</span>
              <p className="text-gray-400 text-xs">Not for human consumption</p>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-2">
              {[
                { src: "/images/payments/visa.png", alt: "Visa" },
                { src: "/images/payments/mastercard.png", alt: "Mastercard" },
                { src: "/images/payments/amex.png", alt: "American Express" },
                { src: "/images/payments/paystack.png", alt: "Paystack" },
              ].map(({ src, alt }) => (
                <div
                  key={alt}
                  className="w-9 h-6 sm:w-11 sm:h-7 rounded border border-gray-200 bg-white flex items-center justify-center overflow-hidden p-1"
                >
                  <Image
                    src={src}
                    alt={alt}
                    width={36}
                    height={20}
                    className="object-contain w-full h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
