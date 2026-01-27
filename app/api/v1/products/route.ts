import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey, successResponse, errorResponse, paginatedResponse } from "@/lib/api-auth";
import { slugify } from "@/lib/utils";
import { z } from "zod";

// GET /api/v1/products - Ürün listesi
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("category_id");
    const isActive = searchParams.get("is_active");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (categoryId) {
      where.categoryId = parseInt(categoryId);
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    const [products, totalItems] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          variants: true,
          images: { orderBy: { sortOrder: "asc" } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    const formattedProducts = products.map((p) => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      price: p.price,
      costPrice: p.costPrice,
      category: p.category
        ? { id: p.category.id, name: p.category.name }
        : null,
      primaryImage:
        p.images.find((img) => img.isPrimary)?.imageUrl || p.images[0]?.imageUrl || null,
      totalStock: p.variants.reduce((sum, v) => sum + v.stock, 0),
      variants: p.variants.map((v) => ({
        id: v.id,
        size: v.size,
        color: v.color,
        stock: v.stock,
      })),
    }));

    return paginatedResponse(formattedProducts, page, limit, totalItems);
  } catch (error) {
    console.error("Products GET error:", error);
    return errorResponse("SERVER_ERROR", "Ürünler alınamadı", undefined, 500);
  }
}

// POST /api/v1/products - Yeni ürün ekle
const createProductSchema = z.object({
  sku: z.string().min(1, "SKU zorunlu"),
  name: z.string().min(1, "Ürün adı zorunlu"),
  description: z.string().optional(),
  price: z.number().positive("Fiyat pozitif olmalı"),
  costPrice: z.number().positive().optional(),
  categoryId: z.number().optional(),
  variants: z
    .array(
      z.object({
        size: z.string().optional(),
        color: z.string().optional(),
        stock: z.number().int().min(0).default(0),
        barcode: z.string().optional(),
      })
    )
    .optional(),
});

export async function POST(request: NextRequest) {
  // Auth check
  const auth = await validateApiKey(request);
  if (!auth.success) return auth.error;

  try {
    const body = await request.json();
    const validation = createProductSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Geçersiz veri",
        validation.error.errors.map((e) => e.message).join(", ")
      );
    }

    const data = validation.data;

    // Check if SKU already exists
    const existingProduct = await prisma.product.findUnique({
      where: { sku: data.sku },
    });

    if (existingProduct) {
      return errorResponse("SKU_EXISTS", "Bu SKU zaten kullanılıyor", data.sku, 409);
    }

    // If categoryId provided, verify it exists
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) {
        return errorResponse("CATEGORY_NOT_FOUND", "Kategori bulunamadı", undefined, 404);
      }
    }

    // Create product with variants
    const product = await prisma.product.create({
      data: {
        sku: data.sku,
        name: data.name,
        description: data.description,
        price: data.price,
        costPrice: data.costPrice,
        categoryId: data.categoryId,
        variants: data.variants
          ? {
              create: data.variants.map((v) => ({
                size: v.size || null,
                color: v.color || null,
                stock: v.stock,
                barcode: v.barcode || null,
              })),
            }
          : undefined,
      },
      include: {
        variants: true,
      },
    });

    return successResponse(
      {
        id: product.id,
        sku: product.sku,
        message: "Ürün başarıyla eklendi",
      },
      201
    );
  } catch (error) {
    console.error("Products POST error:", error);
    return errorResponse("SERVER_ERROR", "Ürün eklenemedi", undefined, 500);
  }
}
