import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateApiKey, successResponse, errorResponse } from "@/lib/api-auth";
import { uploadImageFromUrl } from "@/lib/cloudinary";
import { z } from "zod";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const uploadFromUrlSchema = z.object({
  image_url: z.string().url("Geçerli bir URL girin"),
  is_primary: z.boolean().optional().default(false),
});

// POST /api/v1/products/[id]/images/url - URL'den görsel ekle
export async function POST(request: NextRequest, context: RouteContext) {
  const auth = await validateApiKey(request);
  if (!auth.success) return auth.error;

  try {
    const { id } = await context.params;
    const productId = parseInt(id);

    if (isNaN(productId)) {
      return errorResponse("INVALID_ID", "Geçersiz ürün ID", undefined, 400);
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!product) {
      return errorResponse("PRODUCT_NOT_FOUND", "Ürün bulunamadı", undefined, 404);
    }

    const body = await request.json();
    const validation = uploadFromUrlSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        "VALIDATION_ERROR",
        "Geçersiz veri",
        validation.error.errors.map((e) => e.message).join(", ")
      );
    }

    const { image_url, is_primary } = validation.data;

    // Upload from URL to Cloudinary
    const uploadResult = await uploadImageFromUrl(image_url, "products");

    // If setting as primary, unset other primaries
    if (is_primary) {
      await prisma.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });
    }

    // Save to database
    const image = await prisma.productImage.create({
      data: {
        productId,
        imageUrl: uploadResult.url,
        isPrimary: is_primary || product.images.length === 0,
        sortOrder: product.images.length,
      },
    });

    return successResponse(
      {
        id: image.id,
        url: image.imageUrl,
        isPrimary: image.isPrimary,
      },
      201
    );
  } catch (error) {
    console.error("Image upload from URL error:", error);
    return errorResponse(
      "UPLOAD_ERROR",
      "URL'den görsel yüklenemedi",
      "URL erişilebilir ve geçerli bir görsel olmalı",
      500
    );
  }
}
