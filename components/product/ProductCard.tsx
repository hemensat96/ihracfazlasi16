"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { formatPrice, getStockStatus, slugify } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const stockStatus = getStockStatus(product.totalStock || 0);
  const slug = slugify(product.name);
  const primaryImage = product.primaryImage || product.images?.[0]?.imageUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="w-full"
    >
      <Link href={`/urunler/${slug}-${product.id}`} className="group block">
        {/* Image Container */}
        <div className="relative aspect-[3/4] bg-gray-100 rounded-xl sm:rounded-apple overflow-hidden mb-2 sm:mb-4">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
              className="object-cover transition-transform duration-apple ease-apple group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
                className="w-10 h-10 sm:w-16 sm:h-16"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </div>
          )}

          {/* Stock Badge */}
          {product.totalStock !== undefined && product.totalStock <= 5 && (
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
              <span
                className={`badge text-xs ${
                  stockStatus.color === "warning"
                    ? "badge-warning"
                    : stockStatus.color === "error"
                    ? "badge-error"
                    : ""
                }`}
              >
                {stockStatus.text}
              </span>
            </div>
          )}

          {/* Quick View on Hover - Desktop only */}
          <div className="hidden sm:flex absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-apple items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="bg-white px-4 py-2 rounded-full text-sm font-medium shadow-apple transform translate-y-2 group-hover:translate-y-0 transition-all duration-apple">
              İncele
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-0.5 sm:space-y-1">
          {/* Category - hidden on mobile */}
          {product.category && (
            <p className="hidden sm:block text-caption text-gray-500">{product.category.name}</p>
          )}

          {/* Name */}
          <h3 className="text-xs sm:text-body font-medium text-foreground group-hover:text-accent transition-colors line-clamp-2">
            {product.name}
          </h3>

          {/* Price */}
          <p className="text-sm sm:text-body font-semibold text-foreground">
            {formatPrice(product.price)}
          </p>

          {/* Available Sizes - hidden on mobile */}
          {product.variants && product.variants.length > 0 && (
            <div className="hidden sm:flex flex-wrap gap-1 pt-2">
              {[...new Set(product.variants.filter(v => v.stock > 0).map(v => v.size))]
                .filter(Boolean)
                .slice(0, 5)
                .map((size) => (
                  <span
                    key={size}
                    className="px-2 py-0.5 text-xs text-gray-500 bg-gray-100 rounded"
                  >
                    {size}
                  </span>
                ))}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
