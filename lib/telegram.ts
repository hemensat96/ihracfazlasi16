// Telegram Bot Configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ihracfazlasigiyim.com";
const SITE_API = process.env.TELEGRAM_SITE_API || `${SITE_URL}/api/v1`;
const API_KEY = process.env.API_SECRET_KEY || "";

// Types
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

export interface TelegramChat {
  id: number;
  type: "private" | "group" | "supergroup" | "channel";
  title?: string;
}

export interface TelegramPhoto {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size?: number;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
  photo?: TelegramPhoto[];
  caption?: string;
  media_group_id?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

// User state for multi-step operations
const userStates: Map<number, { action: string; data: Record<string, unknown> }> = new Map();

// Media group tracking for multiple photos
interface MediaGroupData {
  chatId: number;
  userId: number;
  photos: string[]; // file_ids
  caption?: string;
  timestamp: number;
  timeoutId?: NodeJS.Timeout;
}
const mediaGroups: Map<string, MediaGroupData> = new Map();
const MEDIA_GROUP_TIMEOUT = 2000; // 2 seconds to collect all photos in a group

// Pending photo additions for /foto command
interface PendingPhotoAdd {
  sku: string;
  productId: number;
  photos: string[]; // file URLs
}
const pendingPhotoAdds: Map<string, PendingPhotoAdd> = new Map();

// Send message with robust retry mechanism
export async function sendMessage(
  chatId: number,
  text: string,
  options?: { parse_mode?: "HTML" | "Markdown"; reply_markup?: unknown }
): Promise<boolean> {
  const maxRetries = 5;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 saniye timeout

      const response = await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: options?.parse_mode || "HTML",
          reply_markup: options?.reply_markup,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return true;
      }

      console.log(`Telegram attempt ${attempt} failed: ${response.status}`);
    } catch (error) {
      console.log(`Telegram attempt ${attempt} error:`, error);
    }

    if (attempt < maxRetries) {
      await new Promise(r => setTimeout(r, attempt * 1000)); // 1s, 2s, 3s, 4s bekleme
    }
  }

  console.error(`Telegram sendMessage failed after ${maxRetries} attempts`);
  return false;
}

// Get file URL
export async function getFileUrl(fileId: string): Promise<string | null> {
  const response = await fetch(`${TELEGRAM_API}/getFile?file_id=${fileId}`);
  const data = await response.json();
  if (data.ok && data.result?.file_path) {
    return `https://api.telegram.org/file/bot${BOT_TOKEN}/${data.result.file_path}`;
  }
  return null;
}

// API helper
async function apiCall(endpoint: string, method: string = "GET", body?: unknown) {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const response = await fetch(`${SITE_API}${endpoint}`, options);
  return response.json();
}

// Format helpers
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(amount);
}

function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

// Parse simple product caption: "SKU İsim Fiyat" or "SKU | İsim | Fiyat"
function parseSimpleCaption(caption: string): { sku: string; name: string; price: number } | null {
  // First try pipe format: "SKU | İsim | Fiyat"
  if (caption.includes("|")) {
    const parts = caption.split("|").map(p => p.trim());
    if (parts.length >= 3) {
      const price = parseFloat(parts[2]);
      if (!isNaN(price)) {
        return { sku: parts[0], name: parts[1], price };
      }
    }
  }

  // Try space format: "SKU İsim1 İsim2 ... Fiyat"
  // SKU is first word, price is last word (number), name is everything in between
  const words = caption.trim().split(/\s+/);
  if (words.length >= 3) {
    const sku = words[0];
    const lastWord = words[words.length - 1];
    const price = parseFloat(lastWord);

    if (!isNaN(price) && price > 0) {
      const name = words.slice(1, -1).join(" ");
      if (name.length > 0) {
        return { sku, name, price };
      }
    }
  }

  return null;
}

// ==========================================
// COMMAND HANDLERS
// ==========================================

// /start - Welcome message
async function handleStart(chatId: number) {
  const message = `
🛍️ <b>İhraç Fazlası Giyim Bot</b>

Merhaba! Mağaza yönetim botuna hoş geldiniz.

<b>📦 ÜRÜN YÖNETİMİ</b>
/urunekle - Yeni ürün ekle
/urunler - Ürün listesi
/urunsil [SKU] - Ürün sil
/fiyat [SKU] [fiyat] - Fiyat güncelle
/foto [SKU] - Ürüne fotoğraf ekle
/fotograflar [SKU] - Ürün fotoğraflarını listele

<b>📊 STOK YÖNETİMİ</b>
/stok [SKU] - Stok sorgula
/stokekle [SKU] [beden] [adet] - Stok ekle
/stokdus [SKU] [beden] [adet] - Stok düş
/dusukstok - Düşük stokları göster

<b>💰 SATIŞ</b>
/sat [SKU] [beden] [adet] [fiyat] - Satış kaydet
/satisiptal [ID] - Satış iptal
/sonsatislar - Son 10 satış

<b>📈 RAPORLAR</b>
/gunluk - Günlük rapor
/haftalik - Haftalık rapor
/aylik - Aylık rapor
/ciro - Anlık ciro

<b>💸 GİDER & FİNANS</b>
/gider [tutar] [kategori] [açıklama] - Gider ekle
/giderler - Son giderleri listele
/kar - Kar/zarar raporu
/finans - Aylık finansal özet

<b>📁 KATEGORİ</b>
/kategoriler - Kategori listesi
/kategoriekle [isim] - Yeni kategori

💡 <b>Hızlı Ürün Ekleme:</b>
Fotoğraf + caption: <code>SKU İsim Fiyat</code>
Örnek: <code>YLDZ02 Loro Piano Kazak 1200</code>
`;
  await sendMessage(chatId, message);
}

// /urunler - Product list
async function handleUrunler(chatId: number) {
  const result = await apiCall("/products?limit=20");

  if (!result.success || !result.data?.length) {
    await sendMessage(chatId, "❌ Ürün bulunamadı.");
    return;
  }

  let message = "📦 <b>ÜRÜN LİSTESİ</b>\n\n";
  for (const product of result.data.slice(0, 15)) {
    const totalStock = product.variants?.reduce((sum: number, v: { stock: number }) => sum + v.stock, 0) || 0;
    const stockEmoji = totalStock > 5 ? "🟢" : totalStock > 0 ? "🟡" : "🔴";
    message += `${stockEmoji} <b>${product.sku}</b> - ${product.name}\n`;
    message += `   💰 ${formatCurrency(product.price)} | Stok: ${totalStock}\n\n`;
  }

  if (result.data.length > 15) {
    message += `\n<i>...ve ${result.data.length - 15} ürün daha</i>`;
  }

  await sendMessage(chatId, message);
}

// /stok [SKU] - Stock query
async function handleStok(chatId: number, args: string[]) {
  if (!args.length) {
    await sendMessage(chatId, "❌ Kullanım: /stok [SKU]\nÖrnek: /stok ELB001");
    return;
  }

  const sku = args[0].toUpperCase();
  const result = await apiCall(`/products/sku/${sku}`);

  if (!result.success || !result.data) {
    await sendMessage(chatId, `❌ Ürün bulunamadı: ${sku}`);
    return;
  }

  const product = result.data;
  let message = `📦 <b>${product.name}</b>\n`;
  message += `SKU: ${product.sku}\n`;
  message += `Fiyat: ${formatCurrency(product.price)}\n\n`;
  message += `<b>📊 Stok Durumu:</b>\n`;

  if (product.variants?.length) {
    for (const v of product.variants) {
      const emoji = v.stock > 5 ? "🟢" : v.stock > 0 ? "🟡" : "🔴";
      message += `${emoji} ${v.size || "-"} / ${v.color || "-"}: <b>${v.stock}</b> adet\n`;
    }
    const total = product.variants.reduce((sum: number, v: { stock: number }) => sum + v.stock, 0);
    message += `\n<b>Toplam:</b> ${total} adet`;
  } else {
    message += "Varyant yok";
  }

  await sendMessage(chatId, message);
}

// /stokekle [SKU] [beden] [adet] - Add stock
async function handleStokEkle(chatId: number, args: string[]) {
  if (args.length < 3) {
    await sendMessage(chatId, "❌ Kullanım: /stokekle [SKU] [beden] [adet]\nÖrnek: /stokekle ELB001 M 10");
    return;
  }

  const [sku, size, quantityStr] = args;
  const quantity = parseInt(quantityStr);

  if (isNaN(quantity) || quantity <= 0) {
    await sendMessage(chatId, "❌ Geçersiz adet. Pozitif sayı girin.");
    return;
  }

  const result = await apiCall("/stock/update-by-sku", "POST", {
    sku: sku.toUpperCase(),
    size: size.toUpperCase(),
    change: quantity,
    reason: "restock",
    note: "Telegram bot ile eklendi",
  });

  if (result.success) {
    await sendMessage(chatId, `✅ <b>Stok eklendi!</b>\n\n${sku.toUpperCase()} - ${size.toUpperCase()}\n+${quantity} adet\nYeni stok: ${result.data?.newStock || "?"}`);
  } else {
    await sendMessage(chatId, `❌ Hata: ${result.error?.message || "Stok eklenemedi"}`);
  }
}

// /stokdus [SKU] [beden] [adet] - Reduce stock
async function handleStokDus(chatId: number, args: string[]) {
  if (args.length < 3) {
    await sendMessage(chatId, "❌ Kullanım: /stokdus [SKU] [beden] [adet]\nÖrnek: /stokdus ELB001 M 2");
    return;
  }

  const [sku, size, quantityStr] = args;
  const quantity = parseInt(quantityStr);

  if (isNaN(quantity) || quantity <= 0) {
    await sendMessage(chatId, "❌ Geçersiz adet. Pozitif sayı girin.");
    return;
  }

  const result = await apiCall("/stock/update-by-sku", "POST", {
    sku: sku.toUpperCase(),
    size: size.toUpperCase(),
    change: -quantity,
    reason: "adjustment",
    note: "Telegram bot ile düşüldü",
  });

  if (result.success) {
    await sendMessage(chatId, `✅ <b>Stok düşüldü!</b>\n\n${sku.toUpperCase()} - ${size.toUpperCase()}\n-${quantity} adet\nYeni stok: ${result.data?.newStock || "?"}`);
  } else {
    await sendMessage(chatId, `❌ Hata: ${result.error?.message || "Stok düşürülemedi"}`);
  }
}

// /dusukstok - Low stock items
async function handleDusukStok(chatId: number) {
  const result = await apiCall("/stock/low?threshold=3");

  if (!result.success || !result.data?.length) {
    await sendMessage(chatId, "✅ Düşük stoklu ürün yok!");
    return;
  }

  let message = "⚠️ <b>DÜŞÜK STOK UYARISI</b>\n\n";
  for (const item of result.data) {
    const emoji = item.stock === 0 ? "🔴" : "🟡";
    message += `${emoji} <b>${item.productSku}</b> - ${item.size || "-"}/${item.color || "-"}\n`;
    message += `   Stok: <b>${item.stock}</b> adet\n\n`;
  }

  await sendMessage(chatId, message);
}

// /sat [SKU] [beden] [adet] [fiyat] - Record sale
async function handleSat(chatId: number, args: string[]) {
  if (args.length < 4) {
    await sendMessage(chatId, "❌ Kullanım: /sat [SKU] [beden] [adet] [fiyat]\nÖrnek: /sat ELB001 M 1 450");
    return;
  }

  const [sku, size, quantityStr, priceStr] = args;
  const quantity = parseInt(quantityStr);
  const unitPrice = parseFloat(priceStr);

  if (isNaN(quantity) || quantity <= 0) {
    await sendMessage(chatId, "❌ Geçersiz adet.");
    return;
  }

  if (isNaN(unitPrice) || unitPrice <= 0) {
    await sendMessage(chatId, "❌ Geçersiz fiyat.");
    return;
  }

  const result = await apiCall("/sales", "POST", {
    paymentMethod: "cash",
    items: [{
      sku: sku.toUpperCase(),
      size: size.toUpperCase(),
      quantity,
      unitPrice,
    }],
    notes: "Telegram bot ile satış",
  });

  if (result.success) {
    const total = quantity * unitPrice;
    await sendMessage(chatId, `✅ <b>Satış kaydedildi!</b>\n\nSatış #${result.data?.id}\n${sku.toUpperCase()} - ${size.toUpperCase()}\n${quantity} x ${formatCurrency(unitPrice)}\n\n<b>Toplam: ${formatCurrency(total)}</b>\n\n📦 Stok otomatik düşüldü.`);
  } else {
    await sendMessage(chatId, `❌ Hata: ${result.error?.message || "Satış kaydedilemedi"}`);
  }
}

// /satisiptal [ID] - Cancel sale
async function handleSatisIptal(chatId: number, args: string[]) {
  if (!args.length) {
    await sendMessage(chatId, "❌ Kullanım: /satisiptal [ID]\nÖrnek: /satisiptal 5");
    return;
  }

  const saleId = parseInt(args[0]);
  if (isNaN(saleId)) {
    await sendMessage(chatId, "❌ Geçersiz satış ID.");
    return;
  }

  const result = await apiCall(`/sales/${saleId}/cancel`, "POST");

  if (result.success) {
    await sendMessage(chatId, `✅ Satış #${saleId} iptal edildi.\n📦 Stoklar geri yüklendi.`);
  } else {
    await sendMessage(chatId, `❌ Hata: ${result.error?.message || "Satış iptal edilemedi"}`);
  }
}

// /sonsatislar - Last 10 sales
async function handleSonSatislar(chatId: number) {
  const result = await apiCall("/sales?limit=10");

  if (!result.success || !result.data?.length) {
    await sendMessage(chatId, "📭 Henüz satış yok.");
    return;
  }

  let message = "💰 <b>SON SATIŞLAR</b>\n\n";
  for (const sale of result.data) {
    message += `#${sale.id} | ${formatDate(sale.saleDate)}\n`;
    message += `💵 ${formatCurrency(sale.totalAmount)}\n\n`;
  }

  await sendMessage(chatId, message);
}

// /gunluk - Daily report
async function handleGunluk(chatId: number) {
  const result = await apiCall("/reports/daily");

  if (!result.success || !result.data) {
    await sendMessage(chatId, "❌ Rapor alınamadı.");
    return;
  }

  const r = result.data;
  let message = `📊 <b>GÜNLÜK RAPOR</b>\n${r.date}\n\n`;
  message += `💰 Toplam Satış: <b>${r.summary?.totalSales || 0}</b>\n`;
  message += `💵 Ciro: <b>${formatCurrency(r.summary?.totalRevenue || 0)}</b>\n`;
  message += `📈 Kar: <b>${formatCurrency(r.summary?.totalProfit || 0)}</b>\n`;
  message += `📦 Satılan Ürün: <b>${r.summary?.totalItemsSold || 0}</b> adet\n\n`;

  if (r.topProducts?.length) {
    message += `<b>🏆 En Çok Satanlar:</b>\n`;
    for (const p of r.topProducts.slice(0, 3)) {
      message += `• ${p.name} (${p.quantitySold} adet)\n`;
    }
  }

  await sendMessage(chatId, message);
}

// /haftalik - Weekly report
async function handleHaftalik(chatId: number) {
  const result = await apiCall("/reports/weekly");

  if (!result.success || !result.data) {
    await sendMessage(chatId, "❌ Rapor alınamadı.");
    return;
  }

  const r = result.data;
  let message = `📊 <b>HAFTALIK RAPOR</b>\n${r.period}\n\n`;
  message += `💰 Toplam Satış: <b>${r.summary?.totalSales || 0}</b>\n`;
  message += `💵 Ciro: <b>${formatCurrency(r.summary?.totalRevenue || 0)}</b>\n`;
  message += `📈 Kar: <b>${formatCurrency(r.summary?.totalProfit || 0)}</b>\n`;
  message += `📦 Satılan Ürün: <b>${r.summary?.totalItemsSold || 0}</b> adet\n`;
  message += `📉 Günlük Ortalama: <b>${formatCurrency(r.summary?.averageDaily || 0)}</b>\n`;

  await sendMessage(chatId, message);
}

// /aylik - Monthly report
async function handleAylik(chatId: number) {
  const result = await apiCall("/reports/monthly");

  if (!result.success || !result.data) {
    await sendMessage(chatId, "❌ Rapor alınamadı.");
    return;
  }

  const r = result.data;
  let message = `📊 <b>AYLIK RAPOR</b>\n${r.period}\n\n`;
  message += `💰 Toplam Satış: <b>${r.summary?.totalSales || 0}</b>\n`;
  message += `💵 Ciro: <b>${formatCurrency(r.summary?.totalRevenue || 0)}</b>\n`;
  message += `📈 Kar: <b>${formatCurrency(r.summary?.totalProfit || 0)}</b>\n`;
  message += `📦 Satılan Ürün: <b>${r.summary?.totalItemsSold || 0}</b> adet\n\n`;

  if (r.comparison) {
    const trend = r.comparison.changePercent >= 0 ? "📈" : "📉";
    message += `${trend} Geçen aya göre: <b>${r.comparison.changePercent >= 0 ? "+" : ""}${r.comparison.changePercent.toFixed(1)}%</b>\n`;
  }

  if (r.bestDay) {
    message += `\n🏆 En iyi gün: ${r.bestDay.date} (${formatCurrency(r.bestDay.revenue)})`;
  }

  await sendMessage(chatId, message);
}

// /ciro - Current revenue
async function handleCiro(chatId: number) {
  const result = await apiCall("/reports/daily");

  if (!result.success) {
    await sendMessage(chatId, "❌ Ciro bilgisi alınamadı.");
    return;
  }

  const revenue = result.data?.summary?.totalRevenue || 0;
  const sales = result.data?.summary?.totalSales || 0;

  await sendMessage(chatId, `💰 <b>BUGÜNKÜ CİRO</b>\n\n${formatCurrency(revenue)}\n\n${sales} satış yapıldı.`);
}

// /kategoriler - Category list
async function handleKategoriler(chatId: number) {
  const result = await apiCall("/categories");

  if (!result.success || !result.data?.length) {
    await sendMessage(chatId, "📭 Kategori bulunamadı.");
    return;
  }

  let message = "📁 <b>KATEGORİLER</b>\n\n";
  for (const cat of result.data) {
    message += `• ${cat.name} (${cat.slug})\n`;
  }

  await sendMessage(chatId, message);
}

// /kategoriekle [isim] - Add category
async function handleKategoriEkle(chatId: number, args: string[]) {
  if (!args.length) {
    await sendMessage(chatId, "❌ Kullanım: /kategoriekle [isim]\nÖrnek: /kategoriekle Kazaklar");
    return;
  }

  const name = args.join(" ");
  const result = await apiCall("/categories", "POST", { name });

  if (result.success) {
    await sendMessage(chatId, `✅ Kategori eklendi: <b>${name}</b>`);
  } else {
    await sendMessage(chatId, `❌ Hata: ${result.error?.message || "Kategori eklenemedi"}`);
  }
}

// /fiyat [SKU] [yeni fiyat] - Update price
async function handleFiyat(chatId: number, args: string[]) {
  if (args.length < 2) {
    await sendMessage(chatId, "❌ Kullanım: /fiyat [SKU] [yeni fiyat]\nÖrnek: /fiyat ELB001 550");
    return;
  }

  const [sku, priceStr] = args;
  const price = parseFloat(priceStr);

  if (isNaN(price) || price <= 0) {
    await sendMessage(chatId, "❌ Geçersiz fiyat.");
    return;
  }

  // First get product ID
  const productResult = await apiCall(`/products/sku/${sku.toUpperCase()}`);
  if (!productResult.success || !productResult.data) {
    await sendMessage(chatId, `❌ Ürün bulunamadı: ${sku}`);
    return;
  }

  const result = await apiCall(`/products/${productResult.data.id}`, "PUT", { price });

  if (result.success) {
    await sendMessage(chatId, `✅ Fiyat güncellendi!\n\n${sku.toUpperCase()}\nYeni fiyat: <b>${formatCurrency(price)}</b>`);
  } else {
    await sendMessage(chatId, `❌ Hata: ${result.error?.message || "Fiyat güncellenemedi"}`);
  }
}

// /urunsil [SKU] - Delete product
async function handleUrunSil(chatId: number, args: string[]) {
  if (!args.length) {
    await sendMessage(chatId, "❌ Kullanım: /urunsil [SKU]\nÖrnek: /urunsil ELB001");
    return;
  }

  const sku = args[0].toUpperCase();

  // First get product ID
  const productResult = await apiCall(`/products/sku/${sku}`);
  if (!productResult.success || !productResult.data) {
    await sendMessage(chatId, `❌ Ürün bulunamadı: ${sku}`);
    return;
  }

  const result = await apiCall(`/products/${productResult.data.id}`, "DELETE");

  if (result.success) {
    await sendMessage(chatId, `✅ Ürün silindi: <b>${sku}</b>`);
  } else {
    await sendMessage(chatId, `❌ Hata: ${result.error?.message || "Ürün silinemedi"}`);
  }
}

// /urunekle - Start product add flow
async function handleUrunEkle(chatId: number, userId: number) {
  userStates.set(userId, { action: "add_product_photo", data: {} });
  await sendMessage(chatId, "📷 <b>ÜRÜN EKLEME</b>\n\nÜrün fotoğrafını gönderin...\n\n<i>/iptal ile vazgeçebilirsiniz</i>");
}

// Handle photo upload for product (with media group support)
async function handlePhoto(
  chatId: number,
  userId: number,
  photo: TelegramPhoto[],
  caption?: string,
  mediaGroupId?: string
) {
  const state = userStates.get(userId);
  const largestPhoto = photo[photo.length - 1];

  // If this is part of a media group, collect photos
  if (mediaGroupId) {
    const existingGroup = mediaGroups.get(mediaGroupId);

    if (existingGroup) {
      // Add photo to existing group
      existingGroup.photos.push(largestPhoto.file_id);
      if (caption && !existingGroup.caption) {
        existingGroup.caption = caption;
      }
      existingGroup.timestamp = Date.now();
    } else {
      // Create new media group
      const groupData: MediaGroupData = {
        chatId,
        userId,
        photos: [largestPhoto.file_id],
        caption,
        timestamp: Date.now(),
      };
      mediaGroups.set(mediaGroupId, groupData);

      // Set timeout to process after all photos arrive
      groupData.timeoutId = setTimeout(() => {
        processMediaGroup(mediaGroupId);
      }, MEDIA_GROUP_TIMEOUT);
    }
    return;
  }

  // Single photo handling
  const fileUrl = await getFileUrl(largestPhoto.file_id);

  if (!fileUrl) {
    await sendMessage(chatId, "❌ Fotoğraf alınamadı. Tekrar deneyin.");
    return;
  }

  // State: Adding photo to existing product
  if (state?.action === "add_photo_to_product") {
    const { sku, productId } = state.data as { sku: string; productId: number };
    userStates.delete(userId);
    await addPhotosToProduct(chatId, productId, sku, [fileUrl]);
    return;
  }

  // State: Adding product with photo
  if (state?.action === "add_product_photo") {
    userStates.set(userId, {
      action: "add_product_info",
      data: { photoUrls: [fileUrl] },
    });

    await sendMessage(chatId, `✅ Fotoğraf alındı!\n\nŞimdi ürün bilgilerini gönderin:\n\n<code>SKU İsim Fiyat</code>\n\nÖrnek:\n<code>YLDZ02 Loro Piano Kazak 1200</code>\n\n<i>Varsayılan bedenler: S, M, L, XL</i>\n<i>/iptal ile vazgeçebilirsiniz</i>`);
    return;
  }

  // Quick product add with caption
  if (caption) {
    // Check for "foto SKU" pattern first
    const fotoMatch = caption.match(/^foto\s+([A-Za-z0-9]+)$/i);
    if (fotoMatch) {
      const sku = fotoMatch[1].toUpperCase();
      const productResult = await apiCall(`/products/sku/${sku}`);
      if (productResult.success && productResult.data) {
        await addPhotosToProduct(chatId, productResult.data.id, sku, [fileUrl]);
        return;
      } else {
        await sendMessage(chatId, `❌ Ürün bulunamadı: ${sku}`);
        return;
      }
    }

    // Try simple format: "SKU İsim Fiyat" or "SKU | İsim | Fiyat"
    const parsed = parseSimpleCaption(caption);
    if (parsed) {
      await createProductWithPhoto(chatId, parsed.sku, parsed.name, parsed.price, fileUrl);
      return;
    }
  }

  // Start product add flow
  userStates.set(userId, {
    action: "add_product_info",
    data: { photoUrls: [fileUrl] },
  });

  await sendMessage(chatId, `📷 Fotoğraf alındı!\n\nÜrün bilgilerini gönderin:\n\n<code>SKU İsim Fiyat</code>\n\nÖrnek:\n<code>YLDZ02 Loro Piano Kazak 1200</code>\n\n<i>Varsayılan bedenler: S, M, L, XL</i>`);
}

// Create product with photo
async function createProductWithPhoto(
  chatId: number,
  sku: string,
  name: string,
  price: number,
  photoUrl: string,
  categorySlug?: string,
  customSizes?: string[]
) {
  // Default sizes: S, M, L, XL
  const sizes = customSizes && customSizes.length > 0 ? customSizes : ["S", "M", "L", "XL"];

  // Create product
  const productData: Record<string, unknown> = {
    sku: sku.toUpperCase(),
    name,
    price,
    variants: sizes.map(size => ({
      size: size.toUpperCase(),
      color: "Standart",
      stock: 0,
    })),
  };

  // Get category ID if provided
  if (categorySlug) {
    const catResult = await apiCall("/categories");
    if (catResult.success && catResult.data) {
      const category = catResult.data.find((c: { slug: string }) =>
        c.slug.toLowerCase() === categorySlug.toLowerCase()
      );
      if (category) {
        productData.categoryId = category.id;
      }
    }
  }

  const result = await apiCall("/products", "POST", productData);

  if (!result.success) {
    await sendMessage(chatId, `❌ Ürün eklenemedi: ${result.error?.message || "Bilinmeyen hata"}`);
    return;
  }

  // Upload image
  console.log(`Uploading image for product ${sku}: ${photoUrl}`);
  const imageResult = await apiCall(`/products/${result.data.id}/images/url`, "POST", {
    imageUrl: photoUrl,
    isPrimary: true,
  });

  if (imageResult.success) {
    await sendMessage(chatId, `✅ <b>Ürün eklendi!</b>\n\n📦 SKU: ${sku.toUpperCase()}\n📝 İsim: ${name}\n💰 Fiyat: ${formatCurrency(price)}\n📏 Bedenler: ${sizes.join(", ")}\n🖼️ Fotoğraf: Yüklendi\n\n<i>Stok eklemek için:</i>\n/stokekle ${sku.toUpperCase()} M 10`);
  } else {
    console.error(`Cloudinary upload failed for ${sku}:`, imageResult.error);
    await sendMessage(chatId, `⚠️ Ürün eklendi ama fotoğraf yüklenemedi.\n\nSKU: ${sku.toUpperCase()}\n\n<i>Hata: ${imageResult.error?.message || "Cloudinary hatası"}</i>\n\n<i>Fotoğraf eklemek için:</i>\n/foto ${sku.toUpperCase()}`);
  }
}

// Process media group after timeout - upload all photos
async function processMediaGroup(mediaGroupId: string) {
  const groupData = mediaGroups.get(mediaGroupId);
  if (!groupData) return;

  mediaGroups.delete(mediaGroupId);

  const { chatId, userId, photos, caption } = groupData;

  // Get file URLs for all photos
  const photoUrls: string[] = [];
  for (const fileId of photos) {
    const url = await getFileUrl(fileId);
    if (url) photoUrls.push(url);
  }

  if (photoUrls.length === 0) {
    await sendMessage(chatId, "❌ Fotoğraflar alınamadı. Tekrar deneyin.");
    return;
  }

  // Check if this is a /foto command pending
  const pendingAdd = pendingPhotoAdds.get(`${chatId}_${userId}`);
  if (pendingAdd) {
    pendingPhotoAdds.delete(`${chatId}_${userId}`);
    await addPhotosToProduct(chatId, pendingAdd.productId, pendingAdd.sku, photoUrls);
    return;
  }

  // Check caption for product info
  if (caption) {
    // Check for "foto SKU" pattern first
    const fotoMatch = caption.match(/^foto\s+([A-Za-z0-9]+)$/i);
    if (fotoMatch) {
      const sku = fotoMatch[1].toUpperCase();
      const productResult = await apiCall(`/products/sku/${sku}`);
      if (productResult.success && productResult.data) {
        await addPhotosToProduct(chatId, productResult.data.id, sku, photoUrls);
        return;
      } else {
        await sendMessage(chatId, `❌ Ürün bulunamadı: ${sku}`);
        return;
      }
    }

    // Try simple format: "SKU İsim Fiyat" or "SKU | İsim | Fiyat"
    const parsed = parseSimpleCaption(caption);
    if (parsed) {
      await createProductWithMultiplePhotos(chatId, parsed.sku, parsed.name, parsed.price, photoUrls);
      return;
    }
  }

  // Start product add flow with multiple photos
  userStates.set(userId, {
    action: "add_product_info",
    data: { photoUrls },
  });

  await sendMessage(
    chatId,
    `📷 <b>${photoUrls.length} fotoğraf alındı!</b>\n\nÜrün bilgilerini gönderin:\n\n<code>SKU İsim Fiyat</code>\n\nÖrnek:\n<code>YLDZ02 Loro Piano Kazak 1200</code>\n\n<i>Varsayılan bedenler: S, M, L, XL</i>\n<i>/iptal ile vazgeçebilirsiniz</i>`
  );
}

// Create product with multiple photos
async function createProductWithMultiplePhotos(
  chatId: number,
  sku: string,
  name: string,
  price: number,
  photoUrls: string[],
  categorySlug?: string,
  customSizes?: string[]
) {
  const sizes = customSizes && customSizes.length > 0 ? customSizes : ["S", "M", "L", "XL"];

  const productData: Record<string, unknown> = {
    sku: sku.toUpperCase(),
    name,
    price,
    variants: sizes.map(size => ({
      size: size.toUpperCase(),
      color: "Standart",
      stock: 0,
    })),
  };

  if (categorySlug) {
    const catResult = await apiCall("/categories");
    if (catResult.success && catResult.data) {
      const category = catResult.data.find((c: { slug: string }) =>
        c.slug.toLowerCase() === categorySlug.toLowerCase()
      );
      if (category) {
        productData.categoryId = category.id;
      }
    }
  }

  const result = await apiCall("/products", "POST", productData);

  if (!result.success) {
    await sendMessage(chatId, `❌ Ürün eklenemedi: ${result.error?.message || "Bilinmeyen hata"}`);
    return;
  }

  // Upload all images - first one is primary
  let uploadedCount = 0;
  const errors: string[] = [];
  for (let i = 0; i < photoUrls.length; i++) {
    console.log(`Uploading image ${i + 1}/${photoUrls.length} for ${sku}: ${photoUrls[i]}`);
    const imageResult = await apiCall(`/products/${result.data.id}/images/url`, "POST", {
      imageUrl: photoUrls[i],
      isPrimary: i === 0,
    });
    if (imageResult.success) {
      uploadedCount++;
    } else {
      console.error(`Cloudinary upload failed for ${sku} image ${i + 1}:`, imageResult.error);
      errors.push(imageResult.error?.message || `Fotoğraf ${i + 1} yüklenemedi`);
    }
  }

  let message = `✅ <b>Ürün eklendi!</b>\n\n📦 SKU: ${sku.toUpperCase()}\n📝 İsim: ${name}\n💰 Fiyat: ${formatCurrency(price)}\n📏 Bedenler: ${sizes.join(", ")}\n🖼️ Fotoğraf: ${uploadedCount}/${photoUrls.length} yüklendi`;

  if (errors.length > 0) {
    message += `\n\n⚠️ Bazı fotoğraflar yüklenemedi:\n${errors.slice(0, 3).join("\n")}`;
  }

  message += `\n\n<i>Stok eklemek için:</i>\n/stokekle ${sku.toUpperCase()} M 10`;

  await sendMessage(chatId, message);
}

// Add photos to existing product
async function addPhotosToProduct(
  chatId: number,
  productId: number,
  sku: string,
  photoUrls: string[]
) {
  let uploadedCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < photoUrls.length; i++) {
    console.log(`Adding image ${i + 1}/${photoUrls.length} to ${sku}: ${photoUrls[i]}`);
    const imageResult = await apiCall(`/products/${productId}/images/url`, "POST", {
      imageUrl: photoUrls[i],
      isPrimary: false, // Additional photos are not primary
    });
    if (imageResult.success) {
      uploadedCount++;
    } else {
      console.error(`Cloudinary upload failed for ${sku} image ${i + 1}:`, imageResult.error);
      errors.push(imageResult.error?.message || `Fotoğraf ${i + 1} yüklenemedi`);
    }
  }

  if (uploadedCount > 0) {
    let message = `✅ <b>Fotoğraflar eklendi!</b>\n\n📦 SKU: ${sku}\n🖼️ ${uploadedCount}/${photoUrls.length} fotoğraf yüklendi`;

    if (errors.length > 0) {
      message += `\n\n⚠️ Bazı fotoğraflar yüklenemedi:\n${errors.slice(0, 3).join("\n")}`;
    }

    message += `\n\n<i>Tüm fotoğrafları görmek için:</i>\n/fotograflar ${sku}`;
    await sendMessage(chatId, message);
  } else {
    await sendMessage(chatId, `❌ Fotoğraflar yüklenemedi.\n\n<i>Hata: ${errors[0] || "Cloudinary hatası"}</i>`);
  }
}

// /foto [SKU] - Add photo(s) to existing product
async function handleFoto(chatId: number, userId: number, args: string[]) {
  if (!args.length) {
    await sendMessage(chatId, "❌ Kullanım: /foto [SKU]\nÖrnek: /foto ELB001\n\nKomutu yazdıktan sonra fotoğraf(lar) gönderin.");
    return;
  }

  const sku = args[0].toUpperCase();
  const productResult = await apiCall(`/products/sku/${sku}`);

  if (!productResult.success || !productResult.data) {
    await sendMessage(chatId, `❌ Ürün bulunamadı: ${sku}`);
    return;
  }

  // Set state to wait for photos
  userStates.set(userId, {
    action: "add_photo_to_product",
    data: { sku, productId: productResult.data.id },
  });

  await sendMessage(
    chatId,
    `📷 <b>${sku}</b> ürününe fotoğraf ekle\n\nŞimdi fotoğraf(lar) gönderin.\n<i>Birden fazla fotoğraf seçip tek seferde gönderebilirsiniz.</i>\n\n<i>/iptal ile vazgeçebilirsiniz</i>`
  );
}

// /fotograflar [SKU] - List product photos
async function handleFotograflar(chatId: number, args: string[]) {
  if (!args.length) {
    await sendMessage(chatId, "❌ Kullanım: /fotograflar [SKU]\nÖrnek: /fotograflar ELB001");
    return;
  }

  const sku = args[0].toUpperCase();
  const productResult = await apiCall(`/products/sku/${sku}`);

  if (!productResult.success || !productResult.data) {
    await sendMessage(chatId, `❌ Ürün bulunamadı: ${sku}`);
    return;
  }

  const product = productResult.data;
  const images = product.images || [];

  if (images.length === 0) {
    await sendMessage(chatId, `📷 <b>${sku}</b> - ${product.name}\n\nHenüz fotoğraf yok.\n\n<i>Fotoğraf eklemek için:</i>\n/foto ${sku}`);
    return;
  }

  let message = `📷 <b>${sku}</b> - ${product.name}\n\n`;
  message += `<b>Fotoğraflar:</b> ${images.length} adet\n\n`;

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    const isPrimary = img.isPrimary ? " ⭐" : "";
    message += `${i + 1}. ${isPrimary}${img.url || "Yüklendi"}\n`;
  }

  message += `\n<i>Yeni fotoğraf eklemek için:</i>\n/foto ${sku}`;

  await sendMessage(chatId, message);
}

// Handle text input for multi-step operations
async function handleTextInput(chatId: number, userId: number, text: string) {
  const state = userStates.get(userId);

  if (!state) return false;

  if (text.toLowerCase() === "/iptal") {
    userStates.delete(userId);
    await sendMessage(chatId, "❌ İşlem iptal edildi.");
    return true;
  }

  if (state.action === "add_product_info") {
    // Try simple format first: "SKU İsim Fiyat" or "SKU | İsim | Fiyat"
    const parsed = parseSimpleCaption(text);

    if (!parsed) {
      await sendMessage(chatId, "❌ Geçersiz format.\n\nDoğru formatlar:\n<code>SKU İsim Fiyat</code>\n<code>SKU | İsim | Fiyat</code>\n\nÖrnek:\n<code>YLDZ02 Loro Piano Kazak 1200</code>");
      return true;
    }

    const { sku, name, price } = parsed;

    // Support both single photo (legacy) and multiple photos
    const photoUrls = state.data.photoUrls as string[] | undefined;
    const photoUrl = state.data.photoUrl as string | undefined;

    if (photoUrls && photoUrls.length > 0) {
      await createProductWithMultiplePhotos(chatId, sku, name, price, photoUrls);
    } else if (photoUrl) {
      await createProductWithPhoto(chatId, sku, name, price, photoUrl);
    }

    userStates.delete(userId);
    return true;
  }

  return false;
}

// /yardim - Help message
async function handleYardim(chatId: number) {
  await handleStart(chatId);
}

// ==========================================
// GİDER VE FİNANS KOMUTLARI
// ==========================================

const EXPENSE_CATEGORIES: Record<string, string> = {
  kira: "Kira",
  fatura: "Fatura",
  maas: "Maaş",
  mal_alimi: "Mal Alımı",
  diger: "Diğer",
};

// /gider [tutar] [kategori] [açıklama] - Gider ekle
async function handleGider(chatId: number, args: string[]) {
  if (args.length < 2) {
    const categories = Object.entries(EXPENSE_CATEGORIES)
      .map(([k, v]) => `• ${k} - ${v}`)
      .join("\n");
    await sendMessage(
      chatId,
      `❌ Kullanım: /gider [tutar] [kategori] [açıklama]\n\nÖrnek: /gider 5000 kira Ocak kirası\n\n<b>Kategoriler:</b>\n${categories}`
    );
    return;
  }

  const amount = parseFloat(args[0]);
  const category = args[1].toLowerCase();
  const description = args.slice(2).join(" ") || undefined;

  if (isNaN(amount) || amount <= 0) {
    await sendMessage(chatId, "❌ Geçersiz tutar.");
    return;
  }

  if (!EXPENSE_CATEGORIES[category]) {
    await sendMessage(
      chatId,
      `❌ Geçersiz kategori. Geçerli kategoriler: ${Object.keys(EXPENSE_CATEGORIES).join(", ")}`
    );
    return;
  }

  const result = await apiCall("/expenses", "POST", {
    amount,
    category,
    description,
  });

  if (result.success) {
    await sendMessage(
      chatId,
      `✅ <b>Gider eklendi!</b>\n\n💸 Tutar: ${formatCurrency(amount)}\n📁 Kategori: ${EXPENSE_CATEGORIES[category]}\n${description ? `📝 Açıklama: ${description}` : ""}`
    );
  } else {
    await sendMessage(chatId, `❌ Hata: ${result.error?.message || "Gider eklenemedi"}`);
  }
}

// /giderler - Son giderleri listele
async function handleGiderler(chatId: number) {
  const result = await apiCall("/expenses?limit=15");

  if (!result.success || !result.data?.length) {
    await sendMessage(chatId, "📭 Henüz gider kaydı yok.");
    return;
  }

  let message = "💸 <b>SON GİDERLER</b>\n\n";
  for (const expense of result.data) {
    const date = formatDate(expense.expenseDate);
    const category = EXPENSE_CATEGORIES[expense.category] || expense.category;
    message += `• ${formatCurrency(expense.amount)} - ${category}\n`;
    message += `  📅 ${date}${expense.description ? ` | ${expense.description}` : ""}\n\n`;
  }

  if (result.summary) {
    message += `\n<b>Toplam:</b> ${formatCurrency(result.summary.total)}`;
  }

  await sendMessage(chatId, message);
}

// /kar - Kar/zarar raporu
async function handleKar(chatId: number) {
  const result = await apiCall("/reports/financial?period=month");

  if (!result.success || !result.data) {
    await sendMessage(chatId, "❌ Kar raporu alınamadı.");
    return;
  }

  const r = result.data;
  const profitEmoji = r.profit.net >= 0 ? "📈" : "📉";
  const statusEmoji = r.profit.net >= 0 ? "✅" : "⚠️";

  let message = `${profitEmoji} <b>KAR/ZARAR RAPORU</b>\n${r.period}\n\n`;
  message += `<b>GELİR</b>\n`;
  message += `💰 Satış Geliri: ${formatCurrency(r.revenue.total)}\n`;
  message += `📦 Satış Adedi: ${r.revenue.salesCount}\n\n`;

  message += `<b>GİDER</b>\n`;
  message += `🏭 Ürün Maliyeti: ${formatCurrency(r.costs.productCost)}\n`;
  message += `💸 Diğer Giderler: ${formatCurrency(r.costs.expenses)}\n`;
  message += `📊 Toplam Gider: ${formatCurrency(r.costs.total)}\n\n`;

  message += `<b>KAR</b>\n`;
  message += `📊 Brüt Kar: ${formatCurrency(r.profit.gross)} (%${r.profit.grossMargin})\n`;
  message += `${statusEmoji} <b>Net Kar: ${formatCurrency(r.profit.net)}</b> (%${r.profit.netMargin})\n\n`;

  message += `Durum: <b>${r.profit.net >= 0 ? "KARDA" : "ZARARDA"}</b>`;

  await sendMessage(chatId, message);
}

// /finans - Aylık finansal özet
async function handleFinans(chatId: number) {
  const result = await apiCall("/reports/financial?period=month");

  if (!result.success || !result.data) {
    await sendMessage(chatId, "❌ Finansal rapor alınamadı.");
    return;
  }

  const r = result.data;
  let message = `📊 <b>AYLIK FİNANSAL ÖZET</b>\n${r.period}\n\n`;

  message += `<b>💰 GELİR</b>\n`;
  message += `Toplam Satış: ${formatCurrency(r.revenue.total)}\n`;
  message += `Satış Sayısı: ${r.revenue.salesCount}\n`;
  message += `Ortalama Sipariş: ${formatCurrency(r.revenue.averageOrder)}\n\n`;

  message += `<b>💸 GİDERLER</b>\n`;
  if (Object.keys(r.expenseBreakdown).length > 0) {
    for (const [cat, amount] of Object.entries(r.expenseBreakdown)) {
      const catName = EXPENSE_CATEGORIES[cat] || cat;
      message += `• ${catName}: ${formatCurrency(amount as number)}\n`;
    }
    message += `<b>Toplam:</b> ${formatCurrency(r.costs.expenses)}\n\n`;
  } else {
    message += `Kayıtlı gider yok\n\n`;
  }

  message += `<b>📈 ÖZET</b>\n`;
  message += `Brüt Kar: ${formatCurrency(r.profit.gross)}\n`;
  message += `Net Kar: <b>${formatCurrency(r.profit.net)}</b>\n`;
  message += `Kar Marjı: %${r.profit.netMargin}`;

  await sendMessage(chatId, message);
}

// ==========================================
// MAIN MESSAGE HANDLER
// ==========================================

export async function handleUpdate(update: TelegramUpdate) {
  const message = update.message;
  if (!message) return;

  const chatId = message.chat.id;
  const userId = message.from?.id || chatId;
  const text = message.text?.trim() || "";

  // Handle photo (with media group support)
  if (message.photo) {
    await handlePhoto(chatId, userId, message.photo, message.caption, message.media_group_id);
    return;
  }

  // Check for state-based input
  if (text && !text.startsWith("/")) {
    const handled = await handleTextInput(chatId, userId, text);
    if (handled) return;
  }

  // Parse command
  if (!text.startsWith("/")) return;

  const parts = text.split(/\s+/);
  const command = parts[0].toLowerCase().replace("@", "").split("@")[0];
  const args = parts.slice(1);

  // Clear state on new command (except /iptal)
  if (command !== "/iptal") {
    userStates.delete(userId);
  }

  try {
    switch (command) {
      case "/start":
      case "/yardim":
      case "/help":
        await handleStart(chatId);
        break;
      case "/urunler":
        await handleUrunler(chatId);
        break;
      case "/urunekle":
        await handleUrunEkle(chatId, userId);
        break;
      case "/urunsil":
        await handleUrunSil(chatId, args);
        break;
      case "/fiyat":
        await handleFiyat(chatId, args);
        break;
      case "/stok":
        await handleStok(chatId, args);
        break;
      case "/stokekle":
        await handleStokEkle(chatId, args);
        break;
      case "/stokdus":
        await handleStokDus(chatId, args);
        break;
      case "/dusukstok":
        await handleDusukStok(chatId);
        break;
      case "/sat":
        await handleSat(chatId, args);
        break;
      case "/satisiptal":
        await handleSatisIptal(chatId, args);
        break;
      case "/sonsatislar":
        await handleSonSatislar(chatId);
        break;
      case "/gunluk":
        await handleGunluk(chatId);
        break;
      case "/haftalik":
        await handleHaftalik(chatId);
        break;
      case "/aylik":
        await handleAylik(chatId);
        break;
      case "/ciro":
        await handleCiro(chatId);
        break;
      case "/kategoriler":
        await handleKategoriler(chatId);
        break;
      case "/kategoriekle":
        await handleKategoriEkle(chatId, args);
        break;
      case "/gider":
        await handleGider(chatId, args);
        break;
      case "/giderler":
        await handleGiderler(chatId);
        break;
      case "/kar":
        await handleKar(chatId);
        break;
      case "/finans":
        await handleFinans(chatId);
        break;
      case "/foto":
        await handleFoto(chatId, userId, args);
        break;
      case "/fotograflar":
        await handleFotograflar(chatId, args);
        break;
      default:
        await sendMessage(chatId, "❓ Bilinmeyen komut. /yardim yazarak komutları görebilirsiniz.");
    }
  } catch (error) {
    console.error("Telegram command error:", error);
    await sendMessage(chatId, "❌ Bir hata oluştu. Lütfen tekrar deneyin.");
  }
}
