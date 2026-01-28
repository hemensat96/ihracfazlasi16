"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SIZES, SORT_OPTIONS } from "@/lib/constants";
import type { Category } from "@/types";

interface ProductFiltersProps {
  categories: Category[];
}

export default function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const currentCategory = searchParams.get("kategori") || "";
  const currentSort = searchParams.get("siralama") || "newest";
  const currentSizes = searchParams.get("beden")?.split(",") || [];

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("sayfa"); // Reset page when filters change
    router.push(`/urunler?${params.toString()}`);
  };

  const toggleSize = (size: string) => {
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter((s) => s !== size)
      : [...currentSizes, size];
    updateFilters("beden", newSizes.join(","));
  };

  const clearFilters = () => {
    router.push("/urunler");
  };

  const hasActiveFilters = currentCategory || currentSizes.length > 0;

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Kategoriler */}
      <div>
        <h3 className="text-body font-medium text-foreground mb-4">Kategoriler</h3>
        <div className="space-y-2">
          <button
            onClick={() => updateFilters("kategori", "")}
            className={`block w-full text-left px-3 py-2 rounded-apple-sm transition-colors ${
              !currentCategory
                ? "bg-accent text-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            Tümü
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => updateFilters("kategori", category.slug)}
              className={`block w-full text-left px-3 py-2 rounded-apple-sm transition-colors ${
                currentCategory === category.slug
                  ? "bg-accent text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {category.name}
              {category.productCount !== undefined && (
                <span className="text-caption ml-2 opacity-70">
                  ({category.productCount})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bedenler */}
      <div>
        <h3 className="text-body font-medium text-foreground mb-4">Beden</h3>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`px-4 py-2 rounded-apple-sm text-sm font-medium transition-colors ${
                currentSizes.includes(size)
                  ? "bg-accent text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Filtreleri Temizle */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="text-accent text-sm hover:underline"
        >
          Filtreleri Temizle
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Filters */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24">
          <FilterContent />
        </div>
      </aside>

      {/* Mobile Filter Bar */}
      <div className="lg:hidden flex items-center justify-between gap-3 mb-4">
        <button
          onClick={() => setIsMobileFiltersOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
            />
          </svg>
          Filtre
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 bg-accent rounded-full" />
          )}
        </button>

        {/* Sort Dropdown */}
        <select
          value={currentSort}
          onChange={(e) => updateFilters("siralama", e.target.value)}
          className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm appearance-none cursor-pointer truncate"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40 lg:hidden"
              onClick={() => setIsMobileFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-white z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-title">Filtrele</h2>
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <FilterContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
