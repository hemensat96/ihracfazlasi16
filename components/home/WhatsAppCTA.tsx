"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import { WHATSAPP_PHONE } from "@/lib/constants";
import { createWhatsAppLink } from "@/lib/utils";

export default function WhatsAppCTA() {
  const message = "Merhaba! Web sitenizden ulaşıyorum. Ürünleriniz hakkında bilgi almak istiyorum.";
  const whatsappLink = createWhatsAppLink(WHATSAPP_PHONE, message);
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);

  // Entrance animation
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    container.style.opacity = "0";
    container.style.transform = "translateY(40px) scale(0.96)";

    const icon = container.querySelector(".wca-icon") as HTMLElement;
    const title = container.querySelector(".wca-title") as HTMLElement;
    const desc = container.querySelector(".wca-desc") as HTMLElement;
    const btn = container.querySelector(".wca-btn") as HTMLElement;
    const phone = container.querySelector(".wca-phone") as HTMLElement;

    [icon, title, desc, btn, phone].forEach((el) => {
      if (el) { el.style.opacity = "0"; el.style.transform = "translateY(20px)"; }
    });

    if (icon) { icon.style.transform = "scale(0) rotate(-180deg)"; }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Container entrance
            animate(container, {
              opacity: [0, 1],
              translateY: [40, 0],
              scale: [0.96, 1],
              duration: 1000,
              ease: "outExpo",
            });

            // Icon bounce in
            if (icon) {
              animate(icon, {
                opacity: [0, 1],
                scale: [0, 1],
                rotate: [-180, 0],
                duration: 800,
                delay: 300,
                ease: "outElastic(1, 0.5)",
              });
            }

            // Text elements stagger
            animate([title, desc, btn, phone].filter(Boolean), {
              opacity: [0, 1],
              translateY: [20, 0],
              duration: 800,
              delay: stagger(100, { start: 500 }),
              ease: "outExpo",
            });

            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Icon pulse animation
  useEffect(() => {
    if (!iconRef.current) return;

    const icon = iconRef.current;

    const pulse = () => {
      animate(icon, {
        scale: [1, 1.15, 1],
        duration: 2000,
        ease: "inOutSine",
        onComplete: () => {
          setTimeout(pulse, 1000);
        },
      });
    };

    setTimeout(pulse, 2000);
  }, []);

  // Button magnetic hover
  useEffect(() => {
    if (!btnRef.current) return;

    const btn = btnRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.15;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.15;

      animate(btn, {
        translateX: x,
        translateY: y,
        duration: 200,
        ease: "outQuad",
      });
    };

    const handleMouseLeave = () => {
      animate(btn, {
        translateX: 0,
        translateY: 0,
        duration: 500,
        ease: "outElastic(1, 0.4)",
      });
    };

    btn.addEventListener("mousemove", handleMouseMove);
    btn.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      btn.removeEventListener("mousemove", handleMouseMove);
      btn.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Parallax on section
  useEffect(() => {
    if (!sectionRef.current || !containerRef.current) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const rect = sectionRef.current!.getBoundingClientRect();
          const windowHeight = window.innerHeight;

          if (rect.top < windowHeight && rect.bottom > 0) {
            const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
            const offset = (progress - 0.5) * -20;
            containerRef.current!.style.transform = `translateY(${offset}px)`;
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="section bg-white relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-green-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-green-500/3 rounded-full blur-[80px] pointer-events-none" />

      <div className="container-apple relative z-10">
        <div
          ref={containerRef}
          className="bg-gradient-to-br from-success/10 to-success/5 rounded-apple p-12 md:p-16 text-center will-change-transform"
        >
          {/* WhatsApp Icon */}
          <div
            ref={iconRef}
            className="wca-icon w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-8 will-change-transform"
          >
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>

          {/* Text */}
          <h2 className="wca-title text-headline text-foreground mb-4">
            Sorularınız mı var?
          </h2>
          <p className="wca-desc text-body-large text-gray-500 max-w-xl mx-auto mb-8">
            WhatsApp üzerinden bize ulaşın. Ürünler, bedenler ve teslimat hakkında
            tüm sorularınızı yanıtlayalım.
          </p>

          {/* Button */}
          <a
            ref={btnRef}
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="wca-btn btn-whatsapp inline-flex will-change-transform"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp ile İletişime Geç
          </a>

          {/* Phone Number */}
          <p className="wca-phone text-caption text-gray-500 mt-4">
            veya{" "}
            <a href="tel:+905384793696" className="text-accent hover:underline">
              0538 479 36 96
            </a>
            {" "}numarasından arayın
          </p>
        </div>
      </div>
    </section>
  );
}
