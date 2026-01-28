"use client";

import { motion } from "framer-motion";

export default function PromoVideo() {
  return (
    <section className="relative h-[60vh] min-h-[400px] max-h-[600px] overflow-hidden">
      {/* Video - Masaüstü */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover hidden md:block"
      >
        <source src="/promo-video.mp4" type="video/mp4" />
      </video>

      {/* Gradient Arka Plan - Mobil (veri tasarrufu) */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black md:hidden" />

      {/* Koyu Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* İçerik */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center px-4">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight"
          >
            Dünya Markalarında Erkek Giyim
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl lg:text-2xl text-white/80 font-light"
          >
            İthal kalite, uygun fiyat
          </motion.p>
        </div>
      </div>
    </section>
  );
}
