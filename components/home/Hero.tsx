"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative h-screen overflow-hidden">
      {/* Mobil için statik arka plan */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700 md:hidden" />

      {/* Desktop için video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover hidden md:block"
      >
        <source src="/hero-video.webm" type="video/webm" />
      </video>

      {/* Dark Overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      {/* Animated grain/noise overlay for premium feel */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="max-w-4xl"
        >
          {/* Badge with shimmer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-8 overflow-hidden"
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
              animate={{ x: ["-200%", "200%"] }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear", repeatDelay: 2 }}
            />
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-white/90 font-medium">Bursa İnegöl&apos;den Türkiye&apos;ye</span>
          </motion.div>

          {/* Başlık */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-semibold text-white tracking-tight mb-6"
          >
            Dünya Markalarında
            <br />
            <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              Erkek Giyim
            </span>
          </motion.h1>

          {/* Markalar with stagger */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mb-4"
          >
            {["Prada", "Lacoste", "Tommy Hilfiger", "Hugo Boss", "Armani", "Calvin Klein"].map((brand, i) => (
              <motion.span
                key={brand}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.08 }}
                className="text-lg md:text-xl text-white/80 font-light"
              >
                {brand}
                {i < 5 && <span className="text-white/30 ml-3">•</span>}
              </motion.span>
            ))}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-base text-white/60 max-w-xl mx-auto mb-10"
          >
            İhraç fazlası ithal ürünler, uygun fiyatlarla.
          </motion.p>

          {/* CTA Butonları */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/urunler"
              className="group relative px-8 py-4 bg-white text-black font-medium text-lg rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            >
              <span className="relative z-10">Ürünleri Keşfet</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <Link
              href="/hakkimizda"
              className="px-8 py-4 bg-transparent text-white font-medium text-lg rounded-full border border-white/30 hover:border-white/60 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
            >
              Hakkımızda
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="grid grid-cols-3 gap-8 md:gap-16 max-w-xl mx-auto mt-16 md:mt-20"
        >
          {[
            { value: "10+", label: "Dünya Markası" },
            { value: "5.0", label: "Google (58 yorum)", hasStar: true },
            { value: "%100", label: "İthal Ürün" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 + i * 0.1 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-1">
                <span className="text-2xl md:text-3xl font-semibold text-white">{stat.value}</span>
                {stat.hasStar && (
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                )}
              </div>
              <p className="text-xs md:text-sm text-white/50 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3], height: ["4px", "8px", "4px"] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-1 bg-white/60 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
