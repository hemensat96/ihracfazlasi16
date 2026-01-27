"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface ProductGalleryProps {
  images: { id: number; imageUrl: string; isPrimary: boolean }[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-100 rounded-apple flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1}
          stroke="currentColor"
          className="w-24 h-24 text-gray-300"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div
          className="relative aspect-square bg-gray-100 rounded-apple overflow-hidden cursor-zoom-in"
          onClick={() => setIsZoomed(true)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <Image
                src={images[selectedIndex].imageUrl}
                alt={`${productName} - Görsel ${selectedIndex + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedIndex(index)}
                className={`relative flex-shrink-0 w-20 h-20 rounded-apple-sm overflow-hidden transition-all ${
                  selectedIndex === index
                    ? "ring-2 ring-accent"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={image.imageUrl}
                  alt={`${productName} - Küçük Görsel ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            onClick={() => setIsZoomed(false)}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              onClick={() => setIsZoomed(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="white"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            <div className="relative w-full h-full max-w-5xl max-h-[90vh] m-4">
              <Image
                src={images[selectedIndex].imageUrl}
                alt={`${productName} - Tam Ekran`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="white"
                    className="w-6 h-6"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="white"
                    className="w-6 h-6"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </>
            )}

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 px-4 py-2 rounded-full text-white text-sm">
              {selectedIndex + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
