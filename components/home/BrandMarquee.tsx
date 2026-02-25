"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { BRANDS } from "@/lib/constants";

export default function BrandMarquee() {
    const sectionRef = useRef<HTMLElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const allBrands = [...BRANDS, ...BRANDS, ...BRANDS];

    // Entrance animation
    useEffect(() => {
        if (!sectionRef.current) return;

        sectionRef.current.style.opacity = "0";

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        animate(sectionRef.current!, {
                            opacity: [0, 1],
                            duration: 800,
                            ease: "outExpo",
                        });
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.3 }
        );

        observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    // Infinite scroll animation with anime.js
    useEffect(() => {
        if (!trackRef.current) return;

        const track = trackRef.current;
        const totalWidth = track.scrollWidth / 3;

        animate(track, {
            translateX: [0, -totalWidth],
            duration: 30000,
            ease: "linear",
            loop: true,
        });
    }, []);

    // Hover pause effect
    useEffect(() => {
        if (!trackRef.current || !sectionRef.current) return;

        const section = sectionRef.current;
        const brands = section.querySelectorAll(".marquee-brand");

        const handleMouseEnter = (e: Event) => {
            const brand = e.currentTarget as HTMLElement;
            animate(brand, {
                scale: 1.15,
                color: "#ffffff",
                duration: 300,
                ease: "outExpo",
            });
        };

        const handleMouseLeave = (e: Event) => {
            const brand = e.currentTarget as HTMLElement;
            animate(brand, {
                scale: 1,
                duration: 400,
                ease: "outExpo",
            });
        };

        brands.forEach((brand) => {
            brand.addEventListener("mouseenter", handleMouseEnter);
            brand.addEventListener("mouseleave", handleMouseLeave);
        });

        return () => {
            brands.forEach((brand) => {
                brand.removeEventListener("mouseenter", handleMouseEnter);
                brand.removeEventListener("mouseleave", handleMouseLeave);
            });
        };
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative py-8 bg-gray-100 dark:bg-[#111] overflow-hidden border-y border-gray-200 dark:border-gray-800"
        >
            {/* Gradient fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-gray-100 dark:from-[#111] to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-100 dark:from-[#111] to-transparent z-10" />

            {/* Scrolling brands - anime.js powered */}
            <div
                ref={trackRef}
                className="flex items-center gap-12 whitespace-nowrap will-change-transform"
            >
                {allBrands.map((brand, i) => (
                    <span
                        key={`${brand}-${i}`}
                        className="marquee-brand text-lg md:text-xl font-semibold text-gray-400 dark:text-gray-500 tracking-wide uppercase select-none flex-shrink-0 cursor-default transition-colors duration-200"
                    >
                        {brand}
                    </span>
                ))}
            </div>
        </section>
    );
}
