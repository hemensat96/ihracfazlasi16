"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
    {
        name: "Ahmet Y.",
        location: "İstanbul",
        rating: 5,
        text: "Ürün kalitesi mükemmel, fiyatları piyasanın çok altında. Hugo Boss bir gömlek aldım, kumaş kalitesi bire bir aynı. Kesinlikle tekrar alışveriş yapacağım.",
        product: "Hugo Boss Gömlek",
    },
    {
        name: "Mehmet K.",
        location: "Ankara",
        rating: 5,
        text: "İlk defa ihraç fazlası ürün aldım ve çok memnun kaldım. Tommy Hilfiger kazağın kalitesi harika. Kargolama da çok hızlıydı.",
        product: "Tommy Hilfiger Kazak",
    },
    {
        name: "Oğuz T.",
        location: "Bursa",
        rating: 5,
        text: "Mağazaya bizzat gittim, ürünlerin hepsi orijinal. Fiyat-performans oranı muhteşem. Lacoste polo tişört aldım, etiketleri bile üzerinde.",
        product: "Lacoste Polo T-shirt",
    },
    {
        name: "Emre S.",
        location: "İzmir",
        rating: 5,
        text: "WhatsApp'tan sipariş verdim, aynı gün kargoya verildi. Prada kemerin kalitesi çok iyi, orijinalden ayırt edemezsiniz.",
        product: "Prada Kemer",
    },
    {
        name: "Burak D.",
        location: "Antalya",
        rating: 5,
        text: "Calvin Klein jean aldım, kumaş ve kesim mükemmel. Mağazada 3000₺ olan ürünü burada çok daha uygun fiyata buldum.",
        product: "Calvin Klein Jean",
    },
];

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[...Array(rating)].map((_, i) => (
                <svg
                    key={i}
                    className="w-4 h-4 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

export default function Testimonials() {
    const [current, setCurrent] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    useEffect(() => {
        if (!isAutoPlaying) return;
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [isAutoPlaying]);

    const goTo = (index: number) => {
        setCurrent(index);
        setIsAutoPlaying(false);
        // Resume auto-play after 10 seconds
        setTimeout(() => setIsAutoPlaying(true), 10000);
    };

    return (
        <section className="py-20 md:py-28 bg-gradient-to-b from-gray-100 to-white dark:from-[#111] dark:to-[#0a0a0a] overflow-hidden">
            <div className="container-wide">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-14"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-full mb-6">
                        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                            Google&apos;da 5.0 Puan
                        </span>
                    </div>
                    <h2 className="text-headline text-foreground dark:text-white mb-3">
                        Müşterilerimiz Ne Diyor?
                    </h2>
                    <p className="text-body-large text-gray-500">
                        58 Google yorumundan bazıları
                    </p>
                </motion.div>

                {/* Testimonial Carousel */}
                <div className="relative max-w-3xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className="bg-white dark:bg-[#161616] rounded-apple p-8 md:p-12 shadow-apple text-center relative"
                        >
                            {/* Quote icon */}
                            <div className="absolute top-6 left-8 text-accent/10 dark:text-accent/20">
                                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
                                </svg>
                            </div>

                            <StarRating rating={testimonials[current].rating} />

                            <p className="text-lg md:text-xl text-foreground dark:text-white leading-relaxed mt-6 mb-8 font-light">
                                &ldquo;{testimonials[current].text}&rdquo;
                            </p>

                            <div className="flex items-center justify-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center text-sm font-semibold text-white">
                                    {testimonials[current].name.charAt(0)}
                                </div>
                                <div className="text-left">
                                    <p className="font-medium text-foreground dark:text-white text-sm">
                                        {testimonials[current].name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {testimonials[current].location} • {testimonials[current].product}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Dots */}
                    <div className="flex items-center justify-center gap-2 mt-8">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goTo(index)}
                                className={`transition-all duration-300 rounded-full ${index === current
                                        ? "w-8 h-2 bg-accent"
                                        : "w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"
                                    }`}
                                aria-label={`Yorum ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
