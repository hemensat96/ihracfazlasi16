"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

export default function PromoVideo() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Parallax on video section
  useEffect(() => {
    if (!sectionRef.current) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const section = sectionRef.current;
          if (!section) return;

          const rect = section.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          if (rect.top < windowHeight && rect.bottom > 0) {
            const progress = (windowHeight - rect.top) / (windowHeight + rect.height);

            // Parallax on video
            const video = section.querySelector(".promo-video") as HTMLElement;
            if (video) {
              const offset = (progress - 0.5) * 80;
              video.style.transform = `translateY(${offset}px) scale(1.15)`;
            }

            // Parallax on overlay opacity
            const overlay = section.querySelector(".promo-overlay") as HTMLElement;
            if (overlay) {
              overlay.style.opacity = String(0.3 + progress * 0.3);
            }

            // Content parallax
            if (contentRef.current) {
              const contentOffset = (progress - 0.5) * -30;
              contentRef.current.style.transform = `translateY(${contentOffset}px)`;
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Text entrance animation
  useEffect(() => {
    if (!contentRef.current) return;

    const title = contentRef.current.querySelector(".promo-title") as HTMLElement;
    const subtitle = contentRef.current.querySelector(".promo-subtitle") as HTMLElement;
    const line = contentRef.current.querySelector(".promo-line") as HTMLElement;

    [title, subtitle, line].forEach((el) => {
      if (el) {
        el.style.opacity = "0";
        el.style.transform = "translateY(40px)";
      }
    });

    if (line) {
      line.style.transform = "scaleX(0)";
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Title & subtitle entrance
            animate([title, subtitle].filter(Boolean), {
              opacity: [0, 1],
              translateY: [40, 0],
              duration: 1200,
              delay: stagger(200),
              ease: "outExpo",
            });

            // Decorative line
            if (line) {
              animate(line, {
                scaleX: [0, 1],
                opacity: [0, 1],
                duration: 1000,
                delay: 600,
                ease: "outExpo",
              });
            }

            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[60vh] min-h-[400px] max-h-[600px] overflow-hidden">
      {/* Video - Desktop */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="promo-video absolute inset-0 w-full h-full object-cover hidden md:block will-change-transform"
        style={{ transform: "scale(1.15)" }}
      >
        <source src="/promo-video.mp4" type="video/mp4" />
      </video>

      {/* Gradient Background - Mobile */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black md:hidden" />

      {/* Dark Overlay with dynamic opacity */}
      <div className="promo-overlay absolute inset-0 bg-black/50 transition-opacity" />

      {/* Decorative grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute left-1/3 top-0 w-px h-full bg-white" />
        <div className="absolute left-2/3 top-0 w-px h-full bg-white" />
        <div className="absolute left-0 top-1/3 w-full h-px bg-white" />
        <div className="absolute left-0 top-2/3 w-full h-px bg-white" />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 h-full flex items-center justify-center will-change-transform"
      >
        <div className="text-center px-4">
          <h2 className="promo-title text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
            Dünya Markalarında Erkek Giyim
          </h2>
          <div className="promo-line w-20 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-4" style={{ transformOrigin: "center" }} />
          <p className="promo-subtitle text-lg md:text-xl lg:text-2xl text-white/80 font-light">
            İthal kalite, uygun fiyat
          </p>
        </div>
      </div>
    </section>
  );
}
