import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const { pathname, search } = url;

  // Tam URL'yi al (query string dahil)
  const fullUrl = request.url;

  // Eski URL formatlarini yakala ve 301 redirect yap
  // Format: /?product/123456789 -> /urunler
  // veya: ?product/123456789 (query string olarak)

  // ?product/ID formatini kontrol et (URL'nin herhangi bir yerinde)
  const productMatch = fullUrl.match(/\?product\/(\d+)/);
  if (productMatch) {
    return NextResponse.redirect(
      new URL("/urunler", request.url),
      { status: 301 }
    );
  }

  // ?category/slug formatini kontrol et
  const categoryMatch = fullUrl.match(/\?category\/([a-z0-9-]+)/i);
  if (categoryMatch) {
    const slug = categoryMatch[1].toLowerCase();
    return NextResponse.redirect(
      new URL(`/kategori/${slug}`, request.url),
      { status: 301 }
    );
  }

  // www olmayan URL'leri www'ye yonlendir (veya tersi - tercihe gore)
  // Canonical URL tutarliligi icin onemli
  const host = request.headers.get("host") || "";

  // Trailing slash kontrolu - tutarlilik icin
  if (pathname !== "/" && pathname.endsWith("/")) {
    const newUrl = new URL(pathname.slice(0, -1) + search, request.url);
    return NextResponse.redirect(newUrl, { status: 301 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // API ve static dosyalari haric tut
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|logo.png|og-image.jpg).*)",
  ],
};
