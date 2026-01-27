import { Suspense } from "react";
import { Metadata } from "next";
import ProductGrid from "@/components/product/ProductGrid";
import ProductFilters from "@/components/product/ProductFilters";
import { prisma } from "@/lib/prisma";
import type { Product, Category } from "@/types";

export const metadata: Metadata = {
  title: "Ürünler",
  description: "Kaliteli ihraç fazlası giyim ürünlerimizi keşfedin",
};

interface PageProps {
  searchParams: Promise<{
    kategori?: string;
    beden?: string;
    siralama?: string;
    arama?: string;
    sayfa?: string;
  }>;
}

async function getCategories(): Promise<Category[]> {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
      orderBy: { name: "asc" },
    });

    return categories.map((c) => ({
      ...c,
      productCount: c._count.products,
    }));
  } catch {
    return [];
  }
}

async function getProducts(params: {
  kategori?: string;
  beden?: string;
  siralama?: string;
  arama?: string;
  sayfa?: string;
}): Promise<{ products: Product[]; total: number }> {
  try {
    const page = parseInt(params.sayfa || "1");
    const limit = 12;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = { isActive: true };

    if (params.kategori) {
      const category = await prisma.category.findUnique({
        where: { slug: params.kategori },
      });
      if (category) {
        where.categoryId = category.id;
      }
    }

    if (params.arama) {
      where.OR = [
        { name: { contains: params.arama } },
        { sku: { contains: params.arama } },
        { description: { contains: params.arama } },
      ];
    }

    // Size filter - filter products that have variants with these sizes in stock
    if (params.beden) {
      const sizes = params.beden.split(",");
      where.variants = {
        some: {
          size: { in: sizes },
          stock: { gt: 0 },
        },
      };
    }

    // Build orderBy
    let orderBy: Record<string, string> = { createdAt: "desc" };
    switch (params.siralama) {
      case "price-asc":
        orderBy = { price: "asc" };
        break;
      case "price-desc":
        orderBy = { price: "desc" };
        break;
      case "name-asc":
        orderBy = { name: "asc" };
        break;
      case "name-desc":
        orderBy = { name: "desc" };
        break;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          variants: true,
          images: { orderBy: { sortOrder: "asc" } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products: products.map((p) => ({
        ...p,
        primaryImage: p.images.find((img) => img.isPrimary)?.imageUrl || p.images[0]?.imageUrl,
        totalStock: p.variants.reduce((sum, v) => sum + v.stock, 0),
      })),
      total,
    };
  } catch {
    return { products: [], total: 0 };
  }
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] bg-gray-200 rounded-apple mb-4" />
          <div className="h-4 bg-gray-200 rounded mb-2" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [categories, { products, total }] = await Promise.all([
    getCategories(),
    getProducts(params),
  ]);

  const page = parseInt(params.sayfa || "1");
  const limit = 12;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="section-sm">
      <div className="container-wide">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-display text-foreground mb-2">Ürünler</h1>
          <p className="text-body-large text-gray-500">
            {total > 0 ? `${total} ürün bulundu` : "Ürün bulunamadı"}
          </p>
        </div>

        {/* Content */}
        <div className="flex gap-12">
          {/* Filters */}
          <Suspense fallback={null}>
            <ProductFilters categories={categories} />
          </Suspense>

          {/* Products */}
          <div className="flex-1">
            {/* Desktop Sort */}
            <div className="hidden lg:flex justify-end mb-6">
              <select
                defaultValue={params.siralama || "newest"}
                className="px-4 py-2 bg-gray-100 rounded-apple-sm text-sm appearance-none cursor-pointer pr-10"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 10px center",
                  backgroundSize: "16px",
                }}
              >
                <option value="newest">En Yeni</option>
                <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
                <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
                <option value="name-asc">A-Z</option>
                <option value="name-desc">Z-A</option>
              </select>
            </div>

            <Suspense fallback={<LoadingGrid />}>
              <ProductGrid products={products} />
            </Suspense>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {page > 1 && (
                  <a
                    href={`/urunler?${new URLSearchParams({ ...params, sayfa: String(page - 1) }).toString()}`}
                    className="px-4 py-2 bg-gray-100 rounded-apple-sm hover:bg-gray-200 transition-colors"
                  >
                    Önceki
                  </a>
                )}

                {[...Array(totalPages)].map((_, i) => (
                  <a
                    key={i}
                    href={`/urunler?${new URLSearchParams({ ...params, sayfa: String(i + 1) }).toString()}`}
                    className={`px-4 py-2 rounded-apple-sm transition-colors ${
                      page === i + 1
                        ? "bg-accent text-white"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {i + 1}
                  </a>
                ))}

                {page < totalPages && (
                  <a
                    href={`/urunler?${new URLSearchParams({ ...params, sayfa: String(page + 1) }).toString()}`}
                    className="px-4 py-2 bg-gray-100 rounded-apple-sm hover:bg-gray-200 transition-colors"
                  >
                    Sonraki
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
