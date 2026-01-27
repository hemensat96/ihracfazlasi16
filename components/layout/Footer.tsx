import Link from "next/link";
import { SITE_CONFIG, NAV_LINKS, WHATSAPP_PHONE } from "@/lib/constants";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 mt-auto">
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo & Açıklama */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              {SITE_CONFIG.name}
            </h3>
            <p className="text-gray-500 text-body leading-relaxed max-w-md">
              Kaliteli ihraç fazlası giyim ürünlerini uygun fiyatlarla sizlerle buluşturuyoruz.
              Avrupa standartlarında üretilmiş, en trend parçalar mağazamızda.
            </p>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h4 className="text-foreground font-medium mb-4">Hızlı Linkler</h4>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-500 hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/sepet"
                  className="text-gray-500 hover:text-foreground transition-colors"
                >
                  Sepetim
                </Link>
              </li>
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h4 className="text-foreground font-medium mb-4">İletişim</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={`https://wa.me/${WHATSAPP_PHONE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-success transition-colors inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              </li>
              <li className="text-gray-500">
                <span className="block text-sm">Telefon</span>
                <a href="tel:+905384793696" className="hover:text-foreground transition-colors">
                  0538 479 36 96
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Alt Kısım */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-caption">
              © {currentYear} {SITE_CONFIG.name}. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/gizlilik" className="text-gray-500 text-caption hover:text-foreground transition-colors">
                Gizlilik Politikası
              </Link>
              <Link href="/kullanim-sartlari" className="text-gray-500 text-caption hover:text-foreground transition-colors">
                Kullanım Şartları
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
