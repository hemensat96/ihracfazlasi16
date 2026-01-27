import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/product/ProductGrid";
import { prisma } from "@/lib/prisma";
import type { Product, Category } from "@/types";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getCategory(slug: string): Promise<Category | null> {
  try {
    const category = await prisma.category.findUnique({
      where: { slug, isActive: true },
    });
    return category;
  } catch {
    return null;
  }
}

async function getCategoryProducts(categoryId: number): Promise<Product[]> {
  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId,
        isActive: true,
      },
      include: {
        category: true,
        variants: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return products.map((p) => ({
      ...p,
      primaryImage:
        p.images.find((img) => img.isPrimary)?.imageUrl || p.images[0]?.imageUrl,
      totalStock: p.variants.reduce((sum, v) => sum + v.stock, 0),
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return { title: "Kategori Bulunamadı" };
  }

  return {
    title: category.name,
    description: `${category.name} kategorisindeki tüm ürünler`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const products = await getCategoryProducts(category.id);

  return (
    <div className="section-sm">
      <div className="container-wide">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-display text-foreground mb-4">{category.name}</h1>
          <p className="text-body-large text-gray-500">
            {products.length} ürün bulundu
          </p>
        </div>

        {/* Products */}
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
