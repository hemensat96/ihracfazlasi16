"use client";

import { motion } from "framer-motion";
import { BRANDS } from "@/lib/constants";

export default function BrandMarquee() {
    // Duplicate brands for seamless loop
    const allBrands = [...BRANDS, ...BRANDS, ...BRANDS];

    return (
        <section className="relative py-8 bg-gray-100 dark:bg-[#111] overflow-hidden border-y border-gray-200 dark:border-gray-800">
            {/* Gradient fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-gray-100 dark:from-[#111] to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-100 dark:from-[#111] to-transparent z-10" />

            {/* Scrolling brands */}
            <motion.div
                className="flex items-center gap-12 whitespace-nowrap"
                animate={{ x: ["0%", "-33.33%"] }}
                transition={{
                    x: {
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 25,
                        ease: "linear",
                    },
                }}
            >
                {allBrands.map((brand, i) => (
                    <span
                        key={`${brand}-${i}`}
                        className="text-lg md:text-xl font-semibold text-gray-400 dark:text-gray-500 tracking-wide uppercase select-none flex-shrink-0"
                    >
                        {brand}
                    </span>
                ))}
            </motion.div>
        </section>
    );
}
