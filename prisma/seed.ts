import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "elbiseler" },
      update: {},
      create: { name: "Elbiseler", slug: "elbiseler" },
    }),
    prisma.category.upsert({
      where: { slug: "gomlekler" },
      update: {},
      create: { name: "Gömlekler", slug: "gomlekler" },
    }),
    prisma.category.upsert({
      where: { slug: "pantolonlar" },
      update: {},
      create: { name: "Pantolonlar", slug: "pantolonlar" },
    }),
    prisma.category.upsert({
      where: { slug: "etekler" },
      update: {},
      create: { name: "Etekler", slug: "etekler" },
    }),
    prisma.category.upsert({
      where: { slug: "ceketler" },
      update: {},
      create: { name: "Ceketler", slug: "ceketler" },
    }),
    prisma.category.upsert({
      where: { slug: "tisortler" },
      update: {},
      create: { name: "Tişörtler", slug: "tisortler" },
    }),
  ]);

  console.log(`Created ${categories.length} categories`);

  // Sample products data
  const productsData = [
    {
      sku: "ELB001",
      name: "Yazlık Çiçekli Elbise",
      description: "Hafif kumaştan yazlık çiçek desenli elbise. Rahat kesim.",
      price: 450,
      costPrice: 180,
      categorySlug: "elbiseler",
      variants: [
        { size: "S", color: "Kırmızı", stock: 5 },
        { size: "M", color: "Kırmızı", stock: 8 },
        { size: "L", color: "Kırmızı", stock: 3 },
        { size: "S", color: "Mavi", stock: 4 },
        { size: "M", color: "Mavi", stock: 6 },
        { size: "L", color: "Mavi", stock: 2 },
      ],
      images: [
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop",
      ],
    },
    {
      sku: "ELB002",
      name: "Pamuklu Midi Elbise",
      description: "100% pamuklu, günlük kullanıma uygun midi boy elbise.",
      price: 380,
      costPrice: 150,
      categorySlug: "elbiseler",
      variants: [
        { size: "S", color: "Siyah", stock: 10 },
        { size: "M", color: "Siyah", stock: 12 },
        { size: "L", color: "Siyah", stock: 8 },
        { size: "XL", color: "Siyah", stock: 5 },
      ],
      images: [
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&h=1000&fit=crop",
      ],
    },
    {
      sku: "GML001",
      name: "Beyaz Keten Gömlek",
      description: "Saf keten kumaştan, yaz sıcaklarına ideal beyaz gömlek.",
      price: 320,
      costPrice: 130,
      categorySlug: "gomlekler",
      variants: [
        { size: "S", color: "Beyaz", stock: 15 },
        { size: "M", color: "Beyaz", stock: 20 },
        { size: "L", color: "Beyaz", stock: 18 },
        { size: "XL", color: "Beyaz", stock: 10 },
      ],
      images: [
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=1000&fit=crop",
      ],
    },
    {
      sku: "GML002",
      name: "Oversize Denim Gömlek",
      description: "Rahat kesim, yıkamalı denim gömlek. Her tarza uyum sağlar.",
      price: 280,
      costPrice: 110,
      categorySlug: "gomlekler",
      variants: [
        { size: "S", color: "Mavi", stock: 8 },
        { size: "M", color: "Mavi", stock: 12 },
        { size: "L", color: "Mavi", stock: 10 },
      ],
      images: [
        "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&h=1000&fit=crop",
      ],
    },
    {
      sku: "PNT001",
      name: "Yüksek Bel Wide Leg Pantolon",
      description: "Yüksek bel, geniş paça, şık ve rahat pantolon.",
      price: 420,
      costPrice: 170,
      categorySlug: "pantolonlar",
      variants: [
        { size: "S", color: "Siyah", stock: 6 },
        { size: "M", color: "Siyah", stock: 10 },
        { size: "L", color: "Siyah", stock: 8 },
        { size: "S", color: "Bej", stock: 5 },
        { size: "M", color: "Bej", stock: 7 },
        { size: "L", color: "Bej", stock: 4 },
      ],
      images: [
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=1000&fit=crop",
      ],
    },
    {
      sku: "PNT002",
      name: "Slim Fit Kumaş Pantolon",
      description: "Ofis ve özel günler için ideal slim fit kesim pantolon.",
      price: 350,
      costPrice: 140,
      categorySlug: "pantolonlar",
      variants: [
        { size: "S", color: "Lacivert", stock: 7 },
        { size: "M", color: "Lacivert", stock: 12 },
        { size: "L", color: "Lacivert", stock: 9 },
        { size: "XL", color: "Lacivert", stock: 5 },
      ],
      images: [
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=1000&fit=crop",
      ],
    },
    {
      sku: "ETK001",
      name: "Pileli Midi Etek",
      description: "Zarif pileli kesim, midi boy şık etek.",
      price: 290,
      costPrice: 115,
      categorySlug: "etekler",
      variants: [
        { size: "S", color: "Bordo", stock: 6 },
        { size: "M", color: "Bordo", stock: 8 },
        { size: "L", color: "Bordo", stock: 5 },
      ],
      images: [
        "https://images.unsplash.com/photo-1583496661160-fb5886a0ebb9?w=800&h=1000&fit=crop",
      ],
    },
    {
      sku: "CKT001",
      name: "Oversize Blazer Ceket",
      description: "Trend oversize kesim, her kombine uyumlu blazer ceket.",
      price: 680,
      costPrice: 280,
      categorySlug: "ceketler",
      variants: [
        { size: "S", color: "Siyah", stock: 4 },
        { size: "M", color: "Siyah", stock: 6 },
        { size: "L", color: "Siyah", stock: 5 },
        { size: "S", color: "Bej", stock: 3 },
        { size: "M", color: "Bej", stock: 5 },
        { size: "L", color: "Bej", stock: 3 },
      ],
      images: [
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop",
      ],
    },
  ];

  // Create products
  for (const data of productsData) {
    const category = categories.find((c) => c.slug === data.categorySlug);

    const product = await prisma.product.upsert({
      where: { sku: data.sku },
      update: {},
      create: {
        sku: data.sku,
        name: data.name,
        description: data.description,
        price: data.price,
        costPrice: data.costPrice,
        categoryId: category?.id,
        variants: {
          create: data.variants,
        },
        images: {
          create: data.images.map((url, index) => ({
            imageUrl: url,
            isPrimary: index === 0,
            sortOrder: index,
          })),
        },
      },
    });

    console.log(`Created product: ${product.name}`);
  }

  // Create API key
  await prisma.apiKey.upsert({
    where: { key: "ihrac-fazlasi-api-key-2026" },
    update: {},
    create: {
      key: "ihrac-fazlasi-api-key-2026",
      name: "Default API Key",
    },
  });

  console.log("Created default API key");

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
