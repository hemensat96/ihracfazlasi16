"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-gray-100 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-white" />
      </div>

      <div className="container-apple relative z-10 text-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-apple mb-8"
          >
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-caption text-gray-700">Bursa İnegöl&apos;den Türkiye&apos;ye</span>
          </motion.div>

          {/* Başlık */}
          <h1 className="text-display-large md:text-[96px] font-semibold text-foreground tracking-tight mb-6">
            Dünya Markalarında
            <br />
            <span className="text-gradient">Erkek Giyim</span>
          </h1>

          {/* Alt Başlık - Markalar */}
          <p className="text-body-large text-gray-600 max-w-2xl mx-auto mb-4">
            Prada • Lacoste • Tommy Hilfiger • Hugo Boss • Armani • Calvin Klein
          </p>
          <p className="text-body text-gray-400 max-w-xl mx-auto mb-10">
            İhraç fazlası ithal ürünler, uygun fiyatlarla.
          </p>

          {/* CTA Butonları */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/urunler" className="btn-primary text-lg px-8 py-4">
              Ürünleri Keşfet
            </Link>
            <Link
              href="/hakkimizda"
              className="btn-secondary text-lg px-8 py-4"
            >
              Hakkımızda
            </Link>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="grid grid-cols-3 gap-8 max-w-xl mx-auto mt-20"
        >
          <div className="text-center">
            <p className="text-headline text-foreground">10+</p>
            <p className="text-caption text-gray-500">Dünya Markası</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <span className="text-headline text-foreground">5.0</span>
              <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <p className="text-caption text-gray-500">Google (58 yorum)</p>
          </div>
          <div className="text-center">
            <p className="text-headline text-foreground">%100</p>
            <p className="text-caption text-gray-500">Orijinal Ürün</p>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 rounded-full border-2 border-gray-300 flex items-start justify-center p-2"
        >
          <div className="w-1 h-2 bg-gray-400 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
