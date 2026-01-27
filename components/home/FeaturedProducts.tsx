"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import ProductCard from "@/components/product/ProductCard";
import type { Product } from "@/types";

interface FeaturedProductsProps {
  products: Product[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
}

export default function FeaturedProducts({
  products,
  title = "Öne Çıkan Ürünler",
  subtitle = "En çok tercih edilen parçalar",
  showViewAll = true,
}: FeaturedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="section bg-gray-100">
      <div className="container-wide">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-display text-foreground mb-2"
            >
              {title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-body-large text-gray-500"
            >
              {subtitle}
            </motion.p>
          </div>

          {showViewAll && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link
                href="/urunler"
                className="inline-flex items-center gap-2 text-accent hover:underline underline-offset-4 mt-4 md:mt-0"
              >
                Tümünü Gör
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
            </motion.div>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
