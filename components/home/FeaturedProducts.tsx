"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { animate, stagger } from "animejs";
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
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Header animation
  useEffect(() => {
    if (!headerRef.current) return;

    const titleEl = headerRef.current.querySelector(".fp-title") as HTMLElement;
    const subtitleEl = headerRef.current.querySelector(".fp-subtitle") as HTMLElement;
    const viewAllEl = headerRef.current.querySelector(".fp-viewall") as HTMLElement;

    [titleEl, subtitleEl, viewAllEl].forEach((el) => {
      if (el) {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate([titleEl, subtitleEl, viewAllEl].filter(Boolean), {
              opacity: [0, 1],
              translateY: [20, 0],
              duration: 900,
              delay: stagger(100),
              ease: "outExpo",
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  // Product cards stagger animation
  useEffect(() => {
    if (!gridRef.current) return;

    const cards = gridRef.current.querySelectorAll(".product-card-wrapper");
    cards.forEach((card) => {
      (card as HTMLElement).style.opacity = "0";
      (card as HTMLElement).style.transform = "translateY(40px)";
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(cards, {
              opacity: [0, 1],
              translateY: [40, 0],
              duration: 800,
              delay: stagger(80),
              ease: "outExpo",
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.05 }
    );

    observer.observe(gridRef.current);
    return () => observer.disconnect();
  }, [products]);

  // Parallax on product cards
  useEffect(() => {
    if (!gridRef.current) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const cards = gridRef.current?.querySelectorAll(".product-card-wrapper");
          cards?.forEach((card, i) => {
            const rect = card.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            if (rect.top < windowHeight && rect.bottom > 0) {
              const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
              // Alternate up/down for visual interest
              const direction = i % 2 === 0 ? 1 : -1;
              const offset = (progress - 0.5) * 12 * direction;
              (card as HTMLElement).style.transform = `translateY(${offset}px)`;
            }
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [products]);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="section bg-gray-100 relative overflow-hidden">
      {/* Background gradient orb */}
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-wide relative z-10">
        {/* Header */}
        <div ref={headerRef} className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="fp-title text-display text-foreground mb-2">
              {title}
            </h2>
            <p className="fp-subtitle text-body-large text-gray-500">
              {subtitle}
            </p>
          </div>

          {showViewAll && (
            <div className="fp-viewall">
              <Link
                href="/urunler"
                className="inline-flex items-center gap-2 text-accent hover:underline underline-offset-4 mt-4 md:mt-0 group"
              >
                Tümünü Gör
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
              </Link>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div key={product.id} className="product-card-wrapper will-change-transform">
              <ProductCard product={product} index={index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
