import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const { pathname, search } = url;

  // Eski URL formatlarini yakala ve 301 redirect yap
  // Format: /?product/123456789 -> /urunler
  if (pathname === "/" && search) {
    // ?product/ID formatini kontrol et
    const productMatch = search.match(/^\?product\/(\d+)/);
    if (productMatch) {
      // Eski product ID'si var, urunler sayfasina yonlendir
      // Not: Eski ID'den yeni slug'a esleme icin veritabani sorgusu gerekir
      // Su an icin genel urunler sayfasina yonlendiriyoruz
      return NextResponse.redirect(
        new URL("/urunler", request.url),
        { status: 301 }
      );
    }

    // ?category/slug formatini kontrol et
    const categoryMatch = search.match(/^\?category\/([a-z0-9-]+)/i);
    if (categoryMatch) {
      const slug = categoryMatch[1].toLowerCase();
      return NextResponse.redirect(
        new URL(`/kategori/${slug}`, request.url),
        { status: 301 }
      );
    }
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
