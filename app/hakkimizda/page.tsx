import { Metadata } from "next";
import { SITE_CONFIG, WHATSAPP_PHONE } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: `${SITE_CONFIG.name} - Kaliteli ihraç fazlası giyim ürünleri`,
};

export default function AboutPage() {
  return (
    <div className="section-sm">
      <div className="container-apple">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-display text-foreground mb-6">Hakkımızda</h1>
          <p className="text-body-large text-gray-500 max-w-2xl mx-auto">
            Kaliteli ihraç fazlası giyim ürünlerini uygun fiyatlarla sizlere
            sunmak için buradayız.
          </p>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-headline text-foreground mb-6">Biz Kimiz?</h2>
            <div className="space-y-4 text-body text-gray-500">
              <p>
                <strong className="text-foreground">{SITE_CONFIG.name}</strong>,
                Avrupa'nın önde gelen markalarının ihraç fazlası ürünlerini
                sizlerle buluşturan bir giyim mağazasıdır.
              </p>
              <p>
                Yıllardır sektörde edindiğimiz tecrübe ile kaliteli ürünleri en
                uygun fiyatlarla müşterilerimize sunmaktayız. Her sezon yeni
                koleksiyonlarla karşınızdayız.
              </p>
              <p>
                Müşteri memnuniyeti bizim için her şeyden önemlidir. Sorularınız
                için her zaman WhatsApp üzerinden bize ulaşabilirsiniz.
              </p>
            </div>
          </div>

          <div className="bg-gray-100 rounded-apple p-8">
            <h3 className="text-title text-foreground mb-6">Neden Biz?</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5 text-accent"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Premium Kalite</h4>
                  <p className="text-sm text-gray-500">
                    Avrupa standartlarında üretilmiş ürünler
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5 text-accent"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Uygun Fiyat</h4>
                  <p className="text-sm text-gray-500">
                    Piyasanın %70 altında fiyatlar
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5 text-accent"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Kolay İletişim</h4>
                  <p className="text-sm text-gray-500">
                    WhatsApp üzerinden 7/24 destek
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5 text-accent"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Hızlı Teslimat</h4>
                  <p className="text-sm text-gray-500">
                    Türkiye'nin her yerine kargo
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gray-100 rounded-apple p-12 text-center">
          <h2 className="text-headline text-foreground mb-4">İletişime Geçin</h2>
          <p className="text-body text-gray-500 mb-8 max-w-lg mx-auto">
            Ürünlerimiz, siparişleriniz veya herhangi bir konuda yardıma ihtiyacınız mı var?
            Bize ulaşın!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              WhatsApp ile Yazın
            </a>

            <a
              href="tel:+905384793696"
              className="btn-secondary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                />
              </svg>
              0538 479 36 96
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
