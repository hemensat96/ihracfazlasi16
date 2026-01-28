import Hero from "@/components/home/Hero";
import PromoVideo from "@/components/home/PromoVideo";
import Categories from "@/components/home/Categories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import WhatsAppCTA from "@/components/home/WhatsAppCTA";
import { prisma } from "@/lib/prisma";
import type { Product } from "@/types";

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      include: {
        category: true,
        variants: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
    });

    return products.map((p) => ({
      ...p,
      primaryImage: p.images.find((img) => img.isPrimary)?.imageUrl || p.images[0]?.imageUrl,
      totalStock: p.variants.reduce((sum, v) => sum + v.stock, 0),
    }));
  } catch {
    // Veritabanı henüz kurulmamış olabilir
    return [];
  }
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <>
      <Hero />
      <PromoVideo />
      <Categories />
      <FeaturedProducts
        products={featuredProducts}
        title="Yeni Gelenler"
        subtitle="En son eklenen ürünlerimizi keşfedin"
      />
      <WhatsAppCTA />
    </>
  );
}
