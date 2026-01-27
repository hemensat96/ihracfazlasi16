// Site bilgileri
const getBaseUrl = () => {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  return "";
};

export const SITE_CONFIG = {
  name: "İhraç Fazlası Giyim",
  description: "Kaliteli ihraç fazlası giyim ürünleri",
  url: getBaseUrl(),
};

// WhatsApp
export const WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "905384793696";

// Navigasyon linkleri
export const NAV_LINKS = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/urunler", label: "Ürünler" },
  { href: "/hakkimizda", label: "Hakkımızda" },
];

// Kategoriler (başlangıç için)
export const DEFAULT_CATEGORIES = [
  { name: "Elbiseler", slug: "elbiseler" },
  { name: "Gömlekler", slug: "gomlekler" },
  { name: "Pantolonlar", slug: "pantolonlar" },
  { name: "Etekler", slug: "etekler" },
  { name: "Ceketler", slug: "ceketler" },
  { name: "Tişörtler", slug: "tisortler" },
  { name: "Kazaklar", slug: "kazaklar" },
  { name: "Aksesuar", slug: "aksesuar" },
];

// Bedenler
export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

// Renkler (Türkçe)
export const COLORS = [
  { name: "Siyah", value: "#000000" },
  { name: "Beyaz", value: "#FFFFFF" },
  { name: "Kırmızı", value: "#DC2626" },
  { name: "Mavi", value: "#2563EB" },
  { name: "Yeşil", value: "#16A34A" },
  { name: "Sarı", value: "#EAB308" },
  { name: "Turuncu", value: "#EA580C" },
  { name: "Mor", value: "#9333EA" },
  { name: "Pembe", value: "#EC4899" },
  { name: "Gri", value: "#6B7280" },
  { name: "Lacivert", value: "#1E3A5F" },
  { name: "Bej", value: "#D4C4B0" },
  { name: "Kahverengi", value: "#78350F" },
  { name: "Bordo", value: "#7F1D1D" },
];

// Sıralama seçenekleri
export const SORT_OPTIONS = [
  { value: "newest", label: "En Yeni" },
  { value: "price-asc", label: "Fiyat: Düşükten Yükseğe" },
  { value: "price-desc", label: "Fiyat: Yüksekten Düşüğe" },
  { value: "name-asc", label: "A-Z" },
  { value: "name-desc", label: "Z-A" },
];

// Ödeme yöntemleri
export const PAYMENT_METHODS = [
  { value: "cash", label: "Nakit" },
  { value: "card", label: "Kredi Kartı" },
];

// Stok değişim nedenleri
export const STOCK_CHANGE_REASONS = [
  { value: "sale", label: "Satış" },
  { value: "restock", label: "Yeni Stok" },
  { value: "adjustment", label: "Düzeltme" },
  { value: "return", label: "İade" },
];

// Düşük stok eşiği
export const LOW_STOCK_THRESHOLD = 3;

// API limitleri
export const API_LIMITS = {
  productsPerPage: 50,
  salesPerPage: 20,
  maxImageSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
};
