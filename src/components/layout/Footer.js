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
  Shield,
  Truck,
  Award,
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

  const features = [
    { icon: Shield, text: ">99% Purity Guaranteed" },
    { icon: Truck, text: "Free Shipping $250+" },
    { icon: Award, text: "3rd-Party Tested" },
  ];

  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200 relative">
      {/* Main Footer */}
      <div className="relative max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-16">
        {/* Features Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 mb-12 border-b border-gray-200"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-center justify-center md:justify-start gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center">
                <feature.icon className="w-5 h-5 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {feature.text}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column - Brand (3 columns) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3 space-y-5"
          >
            <div className="relative h-14 w-36">
              <Image
                src="/images/logo.png"
                alt={business.name}
                fill
                className="object-contain"
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

              {/* Hours - Simple text line */}
              <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-200">
                Mon - Fri: 9:00 AM - 6:00 PM GMT+2
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-5">
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
              {/* Visa */}
              <div className="w-11 h-7 rounded border border-gray-200 bg-white flex items-center justify-center px-1.5">
                <svg viewBox="0 0 780 500" className="w-full h-full" aria-label="Visa">
                  <rect width="780" height="500" fill="white" />
                  <path d="M293.2 348.7L322.7 150.3H369.3L339.7 348.7H293.2Z" fill="#1A1F71"/>
                  <path d="M524.3 155.1C514.9 151.5 500 147.6 481.7 147.6C435.7 147.6 403.1 171.4 402.9 205.6C402.7 231 427.3 245.2 445.9 253.7C465 262.4 471.4 268 471.3 275.9C471.2 287.9 456.5 293.3 442.9 293.3C423.8 293.3 413.6 290.5 397.8 283.5L391.3 280.4L384.3 323.7C395.6 328.8 416.5 333.3 438.2 333.5C487.2 333.5 519.2 309.9 519.5 273.4C519.7 253.4 507.3 238.2 480.6 225.6C463.3 217.3 452.9 211.8 453 203.4C453 195.9 462.1 187.8 481.8 187.8C498.1 187.5 510.1 191.1 519.5 194.7L524.1 196.9L531.1 155.8L524.3 155.1Z" fill="#1A1F71"/>
                  <path d="M638.7 150.3H603.2C592.4 150.3 584.3 153.4 579.6 164.5L511.3 348.7H560.2L569.9 322.3H629.1L634.5 348.7H678L638.7 150.3ZM583.3 285.5C587.1 275.2 602.1 234.6 602.1 234.6C601.8 235.2 605.8 224.4 608.2 217.7L611.4 233C611.4 233 620.7 278 622.7 285.5H583.3Z" fill="#1A1F71"/>
                  <path d="M236.3 150.3L190.8 282.4L185.9 258C177.2 229.1 150.3 197.8 120.3 182.3L162.2 348.5H211.5L284.4 150.3H236.3Z" fill="#1A1F71"/>
                  <path d="M146.4 150.3H71.2L70.6 154C128.6 169.2 167.7 203.2 185.9 258L167.3 165.1C164.1 154.3 156.2 150.7 146.4 150.3Z" fill="#F7B600"/>
                </svg>
              </div>

              {/* Mastercard */}
              <div className="w-11 h-7 rounded border border-gray-200 bg-white flex items-center justify-center px-1.5">
                <svg viewBox="0 0 131.39 86.9" className="w-full h-auto" aria-label="Mastercard">
                  <rect x="48.37" width="34.65" height="86.9" fill="#ff5f00"/>
                  <path d="M51.94,43.45a55.2,55.2,0,0,1,13.12-36.18A55.26,55.26,0,0,0,0,43.45a55.26,55.26,0,0,0,65.06,54.73A55.2,55.2,0,0,1,51.94,43.45Z" fill="#eb001b"/>
                  <path d="M131.39,43.45A55.26,55.26,0,0,1,65.06,98.9,55.26,55.26,0,0,0,131.39,43.45,55.26,55.26,0,0,0,65.06-12,55.26,55.26,0,0,1,131.39,43.45Z" fill="#f79e1b"/>
                </svg>
              </div>

              {/* Amex */}
              <div className="w-11 h-7 rounded border border-gray-200 bg-[#2557D6] flex items-center justify-center px-1.5">
                <span className="text-white text-[9px] font-black tracking-tight">AMEX</span>
              </div>

              {/* Paystack */}
              <div className="w-11 h-7 rounded border border-gray-200 bg-white flex items-center justify-center px-1.5">
                <svg viewBox="0 0 200 60" className="w-full h-auto" aria-label="Paystack">
                  <text x="10" y="44" fontFamily="Arial" fontWeight="900" fontSize="42" fill="#00C3F7">P</text>
                  <text x="38" y="44" fontFamily="Arial" fontWeight="700" fontSize="28" fill="#011B33">aystack</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
