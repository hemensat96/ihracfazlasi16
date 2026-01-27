"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const categories = [
  {
    name: "Elbiseler",
    slug: "elbiseler",
    description: "Şık ve rahat elbise modelleri",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop",
  },
  {
    name: "Gömlekler",
    slug: "gomlekler",
    description: "Her tarza uygun gömlekler",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=800&fit=crop",
  },
  {
    name: "Pantolonlar",
    slug: "pantolonlar",
    description: "Rahat ve şık pantolonlar",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=800&fit=crop",
  },
  {
    name: "Ceketler",
    slug: "ceketler",
    description: "Mevsime uygun ceketler",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop",
  },
];

export default function Categories() {
  return (
    <section className="section bg-white">
      <div className="container-wide">
        {/* Başlık */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-display text-foreground mb-4"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/kategori/${category.slug}`}
                className="group block relative h-[400px] rounded-apple overflow-hidden"
              >
                {/* Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-apple ease-apple group-hover:scale-105"
                  style={{ backgroundImage: `url(${category.image})` }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-title mb-2">{category.name}</h3>
                  <p className="text-body text-white/80">{category.description}</p>

                  {/* Arrow */}
                  <div className="mt-4 flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                    <span className="text-caption">Keşfet</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
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
