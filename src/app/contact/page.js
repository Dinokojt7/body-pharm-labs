"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Clock } from "lucide-react";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ContactForm from "@/components/forms/ContactForm";
import siteData from "@/lib/data/site-data.json";

export default function ContactPage() {
  const { business } = siteData;

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone",
      content: business.phone,
      link: `tel:${business.phone}`,
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email",
      content: business.email,
      link: `mailto:${business.email}`,
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Business Hours",
      content: "Mon-Fri: 9am - 6pm GMT+2",
      link: null,
    },
  ];

  return (
    <main className="bg-white">
      <Breadcrumb />

      {/* Hero */}
      <section className="relative h-[40vh] min-h-75 overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url(/images/hero-bg1.webp)" }}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative h-full flex items-center justify-center text-center text-white px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-black mb-4"
            >
              CONTACT US
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-white/80 max-w-2xl mx-auto"
            >
              Have questions about our products or need assistance with your
              order? Our team is here to help.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Grid */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {contactInfo.map((info, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-6 rounded shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow"
            >
              <div className="inline-flex items-center justify-center mb-4 text-gray-400">
                {info.icon}
              </div>
              <h3 className="font-bold mb-2 text-sm">{info.title}</h3>
              {info.link ? (
                <a
                  href={info.link}
                  target={info.link.startsWith("http") ? "_blank" : undefined}
                  rel={
                    info.link.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="text-gray-600 hover:text-black transition-colors text-sm break-all"
                >
                  {info.content}
                </a>
              ) : (
                <p className="text-gray-600 text-sm break-words">{info.content}</p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
            <ContactForm />
          </motion.div>
        </div>
      </section>
    </main>
  );
}
