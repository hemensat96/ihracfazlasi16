"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const categories = [
  {
    name: "Üst Giyim",
    slug: "ust-giyim",
    description: "T-shirt, gömlek, kazak, ceket",
    brands: ["Prada", "Lacoste", "Tommy Hilfiger", "Hugo Boss"],
    // Premium men's shirts/blazers in luxury boutique
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=90&fit=crop",
    href: "/urunler?kategori=ust-giyim",
    gradient: "from-blue-900/80 via-blue-900/40 to-transparent",
    accent: "bg-blue-500",
  },
  {
    name: "Alt Giyim",
    slug: "alt-giyim",
    description: "Pantolon, jean, şort",
    brands: ["Calvin Klein", "Armani", "Ralph Lauren"],
    // Premium men's trousers/jeans
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=90&fit=crop",
    href: "/urunler?kategori=alt-giyim",
    gradient: "from-stone-900/80 via-stone-900/40 to-transparent",
    accent: "bg-amber-500",
  },
  {
    name: "Aksesuar",
    slug: "aksesuar",
    description: "Kemer, çanta, cüzdan, şapka",
    brands: ["Prada", "Gucci", "Versace", "Burberry"],
    // Premium leather accessories
    image: "https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=90&fit=crop",
    href: "/urunler?kategori=aksesuar",
    gradient: "from-amber-950/80 via-amber-950/40 to-transparent",
    accent: "bg-emerald-500",
  },
];

export default function Categories() {
  return (
    <section className="section bg-white dark:bg-[#0a0a0a]">
      <div className="container-wide">
        {/* Başlık */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-white/5 rounded-full mb-6"
          >
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Koleksiyonları Keşfet</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-display text-foreground dark:text-white mb-4"
          >
            Kategoriler
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-body-large text-gray-500"
          >
            Aradığınız tarzı bulun
          </motion.p>
        </div>

        {/* Kategori Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
            >
              <Link
                href={category.href}
                className="group block relative h-[420px] md:h-[480px] rounded-apple overflow-hidden"
              >
                {/* Image with Next.js optimization */}
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  priority={index === 0}
                />

                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient}`} />

                {/* Dark bottom gradient for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />

                {/* Category badge */}
                <div className="absolute top-6 left-6">
                  <div className={`w-2 h-2 ${category.accent} rounded-full`} />
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="transform transition-transform duration-500 group-hover:translate-y-[-8px]">
                    {/* Brand tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {category.brands.map((brand) => (
                        <span
                          key={brand}
                          className="px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase bg-white/15 backdrop-blur-sm rounded-full border border-white/10 text-white/90"
                        >
                          {brand}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-2xl md:text-3xl font-semibold mb-2 tracking-tight">{category.name}</h3>
                    <p className="text-base text-white/70 mb-5">{category.description}</p>

                    {/* Arrow button */}
                    <div className="inline-flex items-center gap-3 text-white/80 group-hover:text-white transition-colors">
                      <span className="text-sm font-medium tracking-wide uppercase">Keşfet</span>
                      <div className="w-8 h-8 rounded-full border border-white/30 group-hover:border-white/60 group-hover:bg-white/10 flex items-center justify-center transition-all duration-300">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
