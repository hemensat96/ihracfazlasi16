// Telegram Bot Configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ihracfazlasigiyim.com";
const SITE_API = process.env.TELEGRAM_SITE_API || `${SITE_URL}/api/v1`;
const API_KEY = process.env.API_SECRET_KEY || "";
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

// Known brands we sell with SKU prefixes
const BRAND_SKU_MAP: Record<string, string> = {
  "prada": "PRD",
  "lacoste": "LCST",
  "tommy hilfiger": "TH",
  "tommy jeans": "TJ",
  "hugo boss": "HB",
  "boss": "HB",
  "armani": "ARM",
  "emporio armani": "ARM",
  "giorgio armani": "ARM",
  "versace": "VRS",
  "calvin klein": "CK",
  "ck": "CK",
  "ralph lauren": "RL",
  "polo ralph lauren": "RL",
  "gucci": "GC",
  "burberry": "BRB",
  "loro piana": "LP",
  "zegna": "ZGN",
  "canali": "CNL",
  "brioni": "BRN",
};

const KNOWN_BRANDS = Object.keys(BRAND_SKU_MAP).map(b => b.charAt(0).toUpperCase() + b.slice(1));

// Main product categories (simplified - only 3)
const MAIN_CATEGORIES = [
  {
    name: "Üst Giyim",
    slug: "ust-giyim",
    keywords: ["t-shirt", "tişört", "polo", "tshirt", "gömlek", "shirt", "kazak", "triko", "sweater", "knitwear", "sweatshirt", "hoodie", "ceket", "mont", "jacket", "coat", "blazer", "yelek", "vest", "hırka", "cardigan"]
  },
  {
    name: "Alt Giyim",
    slug: "alt-giyim",
    keywords: ["pantolon", "pants", "trousers", "chino", "şort", "shorts", "bermuda", "eşofman", "jogger", "jean", "jeans", "kot", "denim"]
  },
  {
    name: "Aksesuar",
    slug: "aksesuar",
    keywords: ["kemer", "belt", "çanta", "bag", "cüzdan", "wallet", "şapka", "hat", "cap", "atkı", "scarf", "eldiven", "glove", "kravat", "tie", "papyon", "saat", "watch", "gözlük", "sunglasses"]
  }
];

// Default sizes for products by category
const SIZES_BY_CATEGORY: Record<string, string[]> = {
  "ust-giyim": ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"],
  "alt-giyim": ["28", "30", "32", "34", "36", "38", "40", "42"],
  "aksesuar": ["STD"],
};
const DEFAULT_SIZES = SIZES_BY_CATEGORY["ust-giyim"];

// Product type to size category mapping
const PRODUCT_TYPE_TO_SIZE_CATEGORY: Record<string, string> = {
  // Üst giyim
  "t-shirt": "ust-giyim", "tişört": "ust-giyim", "polo": "ust-giyim",
  "gömlek": "ust-giyim", "kazak": "ust-giyim", "triko": "ust-giyim",
  "sweatshirt": "ust-giyim", "hoodie": "ust-giyim", "ceket": "ust-giyim",
  "mont": "ust-giyim", "blazer": "ust-giyim", "yelek": "ust-giyim", "hırka": "ust-giyim",
  // Alt giyim
  "pantolon": "alt-giyim", "jean": "alt-giyim", "jeans": "alt-giyim", "kot": "alt-giyim",
  "şort": "alt-giyim", "bermuda": "alt-giyim", "eşofman altı": "alt-giyim",
  "jogger": "alt-giyim", "chino": "alt-giyim",
  // Aksesuar
  "kemer": "aksesuar", "çanta": "aksesuar", "cüzdan": "aksesuar", "şapka": "aksesuar",
  "atkı": "aksesuar", "eldiven": "aksesuar", "kravat": "aksesuar", "saat": "aksesuar", "gözlük": "aksesuar",
};

// Get sizes by product type or category
function getSizesByType(productType?: string, categorySlug?: string): string[] {
  // First try product type
  if (productType) {
    const lowerType = productType.toLowerCase();
    for (const [key, cat] of Object.entries(PRODUCT_TYPE_TO_SIZE_CATEGORY)) {
      if (lowerType.includes(key)) {
        return SIZES_BY_CATEGORY[cat] || DEFAULT_SIZES;
      }
    }
  }
  // Then try category
  if (categorySlug && SIZES_BY_CATEGORY[categorySlug]) {
    return SIZES_BY_CATEGORY[categorySlug];
  }
  return DEFAULT_SIZES;
}

// Generate stock entry example string based on sizes
function getStockEntryExample(sizes: string[]): string {
  const exampleNums = sizes.slice(0, 5).map((_, i) => i + 1);
  const sizeExamples = sizes.slice(0, 5).map((size, i) => `${size}=${i + 1}`).join(", ");
  const moreText = sizes.length > 5 ? "..." : "";
  return `Örnek: <code>${exampleNums.join(" ")}${sizes.length > 5 ? " ..." : ""}</code>\n(${sizeExamples}${moreText})`;
}

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

export interface TelegramVideo {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  duration: number;
  thumbnail?: TelegramPhoto;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

export interface TelegramMessage {
  message_id: number;
  from?: TelegramUser;
  chat: TelegramChat;
  date: number;
  text?: string;
  photo?: TelegramPhoto[];
  video?: TelegramVideo;
  caption?: string;
  media_group_id?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

// User state for multi-step operations
const userStates: Map<number, { action: string; data: Record<string, unknown> }> = new Map();

// Media group tracking for multiple photos/videos
interface MediaGroupData {
  chatId: number;
  userId: number;
  photos: string[]; // photo file_ids
  videos: string[]; // video file_ids
  caption?: string;
  timestamp: number;
  timeoutId?: NodeJS.Timeout;
}
const mediaGroups: Map<string, MediaGroupData> = new Map();
const MEDIA_GROUP_TIMEOUT = 2000; // 2 seconds to collect all media in a group

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

// Product analysis result from AI
interface ProductAnalysis {
  brand: string | null;
  productType: string;
  color: string;
  suggestedName: string;
  suggestedCategory: string | null;
  suggestedCategorySlug: string | null;
  autoSku: string | null;
  confidence: "high" | "medium" | "low";
  isPackaging?: boolean; // true if image shows packaging (bag, box) instead of actual product
  sizeType?: "ust-giyim" | "alt-giyim" | "aksesuar"; // AI-determined size category
}

// Ledger entry for cash book analysis
interface LedgerEntry {
  description: string;
  amount: number;
  paymentType?: "KK" | "AH" | "NH"; // Kredi Kartı, Açık Hesap/Nakit, Nakit
}

// Ledger analysis result
interface LedgerAnalysis {
  date: string;
  incomes: LedgerEntry[];
  expenses: LedgerEntry[];
  summary: {
    creditCard: number;
    cash: number;
    totalIncome: number;
    totalExpense: number;
    net: number;
  };
}

// Get SKU prefix for brand
function getBrandSkuPrefix(brand: string | null): string {
  if (!brand) return "URN";
  const lowerBrand = brand.toLowerCase();
  // Check for partial matches too
  for (const [key, prefix] of Object.entries(BRAND_SKU_MAP)) {
    if (lowerBrand.includes(key) || key.includes(lowerBrand)) {
      return prefix;
    }
  }
  return BRAND_SKU_MAP[lowerBrand] || "URN";
}

// Generate next SKU for brand prefix
async function generateNextSku(prefix: string): Promise<string> {
  try {
    // Get all products with this prefix
    const result = await apiCall(`/products?limit=1000`);
    if (!result.success || !result.data) {
      return `${prefix}01`;
    }

    // Find highest number for this prefix
    let maxNum = 0;
    for (const product of result.data) {
      const sku = product.sku?.toUpperCase() || "";
      if (sku.startsWith(prefix)) {
        const numPart = sku.replace(prefix, "");
        const num = parseInt(numPart);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }

    // Return next number with zero padding
    const nextNum = maxNum + 1;
    return `${prefix}${nextNum.toString().padStart(2, "0")}`;
  } catch {
    return `${prefix}01`;
  }
}

// Image type detection result
type ImageType = "product" | "ledger" | "receipt" | "other";

// Detect image type (product, ledger, receipt, other)
async function detectImageType(imageUrl: string): Promise<{ type: ImageType; base64: string; mediaType: string } | null> {
  if (!ANTHROPIC_API_KEY) {
    console.log("ANTHROPIC_API_KEY not configured, skipping image type detection");
    return null;
  }

  try {
    // Download image and convert to base64
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const mediaType = imageUrl.includes(".png") ? "image/png" : "image/jpeg";

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 100,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: base64Image,
                },
              },
              {
                type: "text",
                text: `Bu görselin türünü belirle. Sadece şu kelimelerden birini yaz:

- product: Kıyafet, giyim ürünü, tekstil ürünü (t-shirt, gömlek, pantolon, ceket, kazak vb.)
- ledger: Defter, kasa defteri, muhasebe defteri, el yazısı kayıt defteri
- receipt: Fiş, fatura, makbuz, hesap pusulası
- other: Yukarıdakilerden hiçbiri

Sadece tek kelime yanıt ver: product, ledger, receipt veya other`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Anthropic API error:", response.status);
      return null;
    }

    const data = await response.json();
    const content = data.content?.[0]?.text?.toLowerCase().trim() || "other";

    let imageType: ImageType = "other";
    if (content.includes("product")) imageType = "product";
    else if (content.includes("ledger")) imageType = "ledger";
    else if (content.includes("receipt")) imageType = "receipt";

    console.log(`[Image Type Detection] Type: ${imageType}, Raw: ${content}`);

    return { type: imageType, base64: base64Image, mediaType };
  } catch (error) {
    console.error("Error detecting image type:", error);
    return null;
  }
}

// Analyze product image with Claude Vision API (uses pre-fetched base64 if available)
async function analyzeProductImage(imageUrl: string, prefetchedData?: { base64: string; mediaType: string }): Promise<ProductAnalysis | null> {
  if (!ANTHROPIC_API_KEY) {
    console.log("ANTHROPIC_API_KEY not configured, skipping AI analysis");
    return null;
  }

  try {
    let base64Image: string;
    let mediaType: string;

    if (prefetchedData) {
      base64Image = prefetchedData.base64;
      mediaType = prefetchedData.mediaType;
    } else {
      // Download image and convert to base64
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      base64Image = Buffer.from(imageBuffer).toString("base64");
      mediaType = imageUrl.includes(".png") ? "image/png" : "image/jpeg";
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: base64Image,
                },
              },
              {
                type: "text",
                text: `Bu görseli analiz et. Bilinen markalar: ${KNOWN_BRANDS.join(", ")}.

ÖNEMLİ: Eğer görselde giysi/ürün değil de:
- Marka poşeti/torbası (shopping bag)
- Ürün kutusu/ambalajı
- Sadece etiket/logo
görüyorsan, bunu belirt.

BEDEN TİPİ BELİRLEME:
- Üst giyim (t-shirt, gömlek, kazak, ceket, mont, polo, triko, sweatshirt, hoodie, yelek, hırka, blazer): sizeType = "ust-giyim" (S, M, L, XL, XXL, 3XL, 4XL, 5XL)
- Alt giyim (pantolon, jean, kot, şort, bermuda, chino, jogger, eşofman altı): sizeType = "alt-giyim" (28, 30, 32, 34, 36, 38, 40, 42)
- Aksesuar (kemer, çanta, cüzdan, şapka, atkı, eldiven, kravat, saat, gözlük): sizeType = "aksesuar" (STD)

JSON formatında yanıt ver (başka bir şey yazma):
{
  "brand": "marka adı veya null",
  "productType": "ürün tipi (t-shirt, gömlek, kazak, ceket, pantolon, jean, şort, kemer vb.)",
  "color": "renk (lacivert, beyaz, siyah, gri, vb.)",
  "suggestedName": "Profesyonel ürün adı",
  "isPackaging": true/false - poşet, kutu veya ambalaj mı?,
  "sizeType": "ust-giyim/alt-giyim/aksesuar",
  "confidence": "high/medium/low"
}

Örnekler:
- T-shirt: sizeType: "ust-giyim"
- Pantolon/Jean: sizeType: "alt-giyim"
- Kemer: sizeType: "aksesuar"
- Poşet: sizeType: "aksesuar", isPackaging: true

Logo veya marka etiketi net görünüyorsa confidence: high
Stil benzerse ama logo net değilse: medium
Marka belirsizse: low ve brand: null`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Claude API error:", response.status, await response.text());
      return null;
    }

    const result = await response.json();
    const textContent = result.content?.find((c: { type: string }) => c.type === "text");
    if (!textContent?.text) return null;

    // Parse JSON from response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const analysis = JSON.parse(jsonMatch[0]) as ProductAnalysis;

    // If it's packaging (bag, box), set to Aksesuar category
    if (analysis.isPackaging) {
      analysis.suggestedCategory = "Aksesuar";
      analysis.suggestedCategorySlug = "aksesuar";
      analysis.sizeType = "aksesuar";
    } else {
      // Find matching main category (Üst Giyim, Alt Giyim, Aksesuar)
      const lowerProductType = analysis.productType.toLowerCase();
      for (const cat of MAIN_CATEGORIES) {
        if (cat.keywords.some(k => lowerProductType.includes(k))) {
          analysis.suggestedCategory = cat.name;
          analysis.suggestedCategorySlug = cat.slug;
          break;
        }
      }
      // Default to Üst Giyim if no match found
      if (!analysis.suggestedCategory) {
        analysis.suggestedCategory = "Üst Giyim";
        analysis.suggestedCategorySlug = "ust-giyim";
      }

      // Determine sizeType from productType if AI didn't provide it
      if (!analysis.sizeType) {
        for (const [key, cat] of Object.entries(PRODUCT_TYPE_TO_SIZE_CATEGORY)) {
          if (lowerProductType.includes(key)) {
            analysis.sizeType = cat as "ust-giyim" | "alt-giyim" | "aksesuar";
            break;
          }
        }
        // Default to category slug if still not set
        if (!analysis.sizeType && analysis.suggestedCategorySlug) {
          analysis.sizeType = analysis.suggestedCategorySlug as "ust-giyim" | "alt-giyim" | "aksesuar";
        }
      }
    }

    // Generate auto SKU based on brand
    const skuPrefix = getBrandSkuPrefix(analysis.brand);
    analysis.autoSku = await generateNextSku(skuPrefix);

    console.log(`[AI Analysis] Brand: ${analysis.brand}, SKU Prefix: ${skuPrefix}, Auto SKU: ${analysis.autoSku}`);

    return analysis;
  } catch (error) {
    console.error("Error analyzing product image:", error);
    return null;
  }
}

// Analyze ledger/cash book image with Claude Vision API
async function analyzeLedgerImage(imageUrl: string, prefetchedData?: { base64: string; mediaType: string }): Promise<LedgerAnalysis | null> {
  if (!ANTHROPIC_API_KEY) {
    console.log("ANTHROPIC_API_KEY not configured, skipping ledger analysis");
    return null;
  }

  try {
    let base64Image: string;
    let mediaType: string;

    if (prefetchedData) {
      base64Image = prefetchedData.base64;
      mediaType = prefetchedData.mediaType;
    } else {
      // Download image and convert to base64
      const imageResponse = await fetch(imageUrl);
      const imageBuffer = await imageResponse.arrayBuffer();
      base64Image = Buffer.from(imageBuffer).toString("base64");
      mediaType = imageUrl.includes(".png") ? "image/png" : "image/jpeg";
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: base64Image,
                },
              },
              {
                type: "text",
                text: `Bu Türkçe el yazısı kasa defteri fotoğrafını analiz et.

Sütunlar genellikle:
- İZAHAT / AÇIKLAMA: Ne satıldığı veya gider açıklaması
- ÇIKAN / LİRA veya GELİR: Gelir tutarı
- LİRA / GİDER: Gider tutarı

Ödeme türü kısaltmaları:
- KK = Kredi Kartı
- AH = Açık Hesap (Nakit)
- NH = Nakit

Tarihi sayfanın üstünden oku (örn: 22.01.2026 veya 22 Ocak).

JSON formatında yanıt ver (başka bir şey yazma):
{
  "date": "22.01.2026",
  "incomes": [
    {"description": "1 mont, 1 kazak", "amount": 7800, "paymentType": "KK"},
    {"description": "1 kazak, 1 pantolon", "amount": 3500, "paymentType": "AH"}
  ],
  "expenses": [
    {"description": "Kargo", "amount": 600},
    {"description": "Kargo", "amount": 180}
  ]
}

Kurallar:
- Tutarları sayı olarak yaz (nokta veya virgül kullanma)
- paymentType sadece gelirlerde olsun
- Ödeme türü belirtilmemişse "AH" kabul et
- Tüm satırları oku, atla etme
- El yazısını dikkatli oku`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("Anthropic API error:", response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      console.error("No content in Anthropic response");
      return null;
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", content);
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      date: string;
      incomes: LedgerEntry[];
      expenses: LedgerEntry[];
    };

    // Calculate summary
    let creditCard = 0;
    let cash = 0;
    let totalIncome = 0;
    let totalExpense = 0;

    for (const income of parsed.incomes) {
      totalIncome += income.amount;
      if (income.paymentType === "KK") {
        creditCard += income.amount;
      } else {
        cash += income.amount;
      }
    }

    for (const expense of parsed.expenses) {
      totalExpense += expense.amount;
    }

    const analysis: LedgerAnalysis = {
      date: parsed.date,
      incomes: parsed.incomes,
      expenses: parsed.expenses,
      summary: {
        creditCard,
        cash,
        totalIncome,
        totalExpense,
        net: totalIncome - totalExpense,
      },
    };

    console.log(`[Ledger Analysis] Date: ${analysis.date}, Incomes: ${parsed.incomes.length}, Expenses: ${parsed.expenses.length}`);

    return analysis;
  } catch (error) {
    console.error("Error analyzing ledger image:", error);
    return null;
  }
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

// Find or create category by name
async function findOrCreateCategory(categoryName: string): Promise<number | null> {
  if (!categoryName) return null;

  try {
    // First check if category exists
    const categoriesResult = await apiCall("/categories");
    if (categoriesResult.success && categoriesResult.data) {
      // Look for exact or similar match (case-insensitive)
      const existing = categoriesResult.data.find((c: { name: string; id: number }) =>
        c.name.toLowerCase() === categoryName.toLowerCase() ||
        c.name.toLowerCase().includes(categoryName.toLowerCase()) ||
        categoryName.toLowerCase().includes(c.name.toLowerCase())
      );

      if (existing) {
        console.log(`[Category] Found existing: ${existing.name} (ID: ${existing.id})`);
        return existing.id;
      }
    }

    // Category doesn't exist - create it
    // Generate slug from name
    const slug = categoryName
      .toLowerCase()
      .replace(/ü/g, "u")
      .replace(/ö/g, "o")
      .replace(/ş/g, "s")
      .replace(/ç/g, "c")
      .replace(/ğ/g, "g")
      .replace(/ı/g, "i")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const createResult = await apiCall("/categories", "POST", {
      name: categoryName,
      slug: slug || categoryName.toLowerCase().replace(/\s+/g, "-"),
    });

    if (createResult.success && createResult.data) {
      console.log(`[Category] Created new: ${categoryName} (ID: ${createResult.data.id})`);
      return createResult.data.id;
    }

    console.error(`[Category] Failed to create: ${categoryName}`, createResult.error);
    return null;
  } catch (error) {
    console.error(`[Category] Error finding/creating category:`, error);
    return null;
  }
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

<b>🚀 TAM OTOMATİK ÜRÜN EKLEME</b>
1. Fotoğraf gönderin (tekli veya çoklu)
2. AI markayı, tipi ve rengi tanır
3. SKU otomatik oluşturulur
4. Fiyat yazın: <code>450</code>
5. Seri stok girin: <code>1 2 3 3 2 1 1 1</code> veya tek sayı <code>5</code>
   Bedenler ürün tipine göre otomatik belirlenir:
   • Üst giyim: S, M, L, XL, XXL, 3XL, 4XL, 5XL
   • Alt giyim: 28, 30, 32, 34, 36, 38, 40, 42
   • Aksesuar: STD
6. Ürün tamamlandı! ✅

<b>📦 ÜRÜN YÖNETİMİ</b>
/urunekle - Yeni ürün ekle
/urunler - Ürün listesi
/urunsil [SKU] - Ürün sil
/fiyat [SKU] [fiyat] - Fiyat güncelle
/foto [SKU] - Ürüne fotoğraf ekle
/fotograflar [SKU] - Ürün fotoğraflarını listele

<b>📊 STOK YÖNETİMİ</b>
/stok [SKU] - Stok sorgula
/seristok [SKU] [stoklar] - Seri stok gir
  Örnek: <code>/seristok TH05 1 2 3 3 2 1 1 1</code>
/stokekle [SKU] [beden] [adet] - Tek stok ekle
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

<b>💵 KASA YÖNETİMİ</b>
/kasaac [tutar] - Günün başında kasa aç
/kasakapat - Gün sonu kasa kapat & rapor

<b>💲 TOPLU FİYAT</b>
/zamekle [yüzde] - Tüm ürünlere zam
/zamekle [yüzde] [SKU] - SKU'ya göre zam
/zamekle [yüzde] "kategori" - Kategoriye zam
/indirim [yüzde] - Tüm ürünlere indirim
→ Onay için /onayla

<b>📒 KASA DEFTERİ</b>
Fotoğraf + caption: <code>/defter</code> veya <code>/kasa</code>
AI el yazısı defteri okur → /onayla ile kaydet

<b>📁 KATEGORİ</b>
/kategoriler - Kategori listesi
/kategoriekle [isim] - Yeni kategori

💡 <b>Hızlı Ürün Ekleme (Manuel):</b>
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

  console.log(`[/sat] SKU: ${sku}, Size: ${size}, Qty: ${quantity}, Price: ${unitPrice}`);

  const result = await apiCall("/sales", "POST", {
    payment_method: "cash",
    items: [{
      sku: sku.toUpperCase(),
      size: size.toUpperCase(),
      quantity,
      unit_price: unitPrice,
    }],
    notes: "Telegram bot ile satış",
  });

  console.log(`[/sat] API Result:`, JSON.stringify(result));

  if (result.success) {
    const total = quantity * unitPrice;
    const saleId = result.data?.saleId || result.data?.id;
    await sendMessage(chatId, `✅ <b>Satış kaydedildi!</b>\n\nSatış #${saleId}\n${sku.toUpperCase()} - ${size.toUpperCase()}\n${quantity} x ${formatCurrency(unitPrice)}\n\n<b>Toplam: ${formatCurrency(total)}</b>\n\n📦 Stok otomatik düşüldü.`);
  } else {
    console.error(`[/sat] Error:`, result.error);
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
        videos: [],
        caption,
        timestamp: Date.now(),
      };
      mediaGroups.set(mediaGroupId, groupData);

      // Set timeout to process after all media arrive
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

  // State: Waiting for ledger photo
  if (state?.action === "wait_ledger_photo") {
    userStates.delete(userId);
    await handleDefter(chatId, userId, fileUrl);
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

    await sendMessage(chatId, `✅ Fotoğraf alındı!\n\nŞimdi ürün bilgilerini gönderin:\n\n<code>SKU İsim Fiyat</code>\n\nÖrnek:\n<code>YLDZ02 Loro Piano Kazak 1200</code>\n\n<i>Varsayılan bedenler: S, M, L, XL, XXL</i>\n<i>/iptal ile vazgeçebilirsiniz</i>`);
    return;
  }

  // Quick product add with caption
  if (caption) {
    // Check for /defter or /kasa command
    if (caption.toLowerCase().startsWith("/defter") || caption.toLowerCase().startsWith("/kasa")) {
      await handleDefter(chatId, userId, fileUrl);
      return;
    }

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
      await createProductWithPhoto(chatId, parsed.sku, parsed.name, parsed.price, fileUrl, undefined, undefined, userId);
      return;
    }
  }

  // No caption - detect image type first, then analyze
  await sendMessage(chatId, "🔍 Görsel analiz ediliyor...");

  // First detect what type of image this is
  const imageTypeResult = await detectImageType(fileUrl);

  if (imageTypeResult?.type === "ledger") {
    // It's a ledger/cash book - analyze as ledger
    await sendMessage(chatId, "📒 Kasa defteri tespit edildi, analiz ediliyor...");
    await handleDefter(chatId, userId, fileUrl, { base64: imageTypeResult.base64, mediaType: imageTypeResult.mediaType });
    return;
  }

  if (imageTypeResult?.type === "receipt") {
    await sendMessage(chatId, "🧾 Fiş/fatura tespit edildi. Şu an sadece ürün ve defter analizi destekleniyor.");
    return;
  }

  // It's a product (or unknown) - analyze as product
  const prefetchedData = imageTypeResult ? { base64: imageTypeResult.base64, mediaType: imageTypeResult.mediaType } : undefined;
  const analysis = await analyzeProductImage(fileUrl, prefetchedData);

  if (analysis && analysis.autoSku) {
    // Store analysis for later use - fully automatic mode
    userStates.set(userId, {
      action: "add_product_auto",
      data: {
        photoUrls: [fileUrl],
        analysis,
      },
    });

    const brandInfo = analysis.brand ? `<b>${analysis.brand}</b>` : "Bilinmeyen Marka";
    const confidenceEmoji = analysis.confidence === "high" ? "🎯" : analysis.confidence === "medium" ? "🤔" : "❓";
    const categoryInfo = analysis.suggestedCategory ? `📁 Kategori: ${analysis.suggestedCategory}\n` : "";
    const packagingWarning = analysis.isPackaging ? `\n⚠️ <i>Bu bir poşet/ambalaj gibi görünüyor. Ürün değilse /iptal yazın.</i>\n` : "";

    await sendMessage(
      chatId,
      `${confidenceEmoji} <b>Ürün Tanındı!</b>\n\n` +
      `🏷️ ${analysis.suggestedName}\n\n` +
      `🔖 SKU: <code>${analysis.autoSku}</code> (otomatik)\n` +
      `${categoryInfo}` +
      `🏪 Marka: ${brandInfo}\n` +
      `👔 Tip: ${analysis.productType}\n` +
      `🎨 Renk: ${analysis.color}${packagingWarning}\n\n` +
      `<b>💰 Sadece fiyat girin:</b>\n` +
      `Örnek: <code>450</code>\n\n` +
      `<i>Farklı SKU veya isim istiyorsanız:</i>\n` +
      `<code>[Fiyat] [SKU] [Yeni İsim]</code>\n\n` +
      `<i>/iptal ile vazgeçebilirsiniz</i>`
    );
  } else if (analysis) {
    // AI worked but couldn't generate SKU - ask for SKU and price
    userStates.set(userId, {
      action: "add_product_with_ai",
      data: {
        photoUrls: [fileUrl],
        analysis,
      },
    });

    const brandInfo = analysis.brand ? `<b>${analysis.brand}</b>` : "Marka belirlenemedi";
    const confidenceEmoji = analysis.confidence === "high" ? "🎯" : analysis.confidence === "medium" ? "🤔" : "❓";
    const categoryInfo = analysis.suggestedCategory ? `\n📁 Kategori: ${analysis.suggestedCategory}` : "";
    const packagingWarning = analysis.isPackaging ? `\n\n⚠️ <i>Bu bir poşet/ambalaj gibi görünüyor. Ürün değilse /iptal yazın.</i>` : "";

    await sendMessage(
      chatId,
      `${confidenceEmoji} <b>Ürün Tanındı!</b>\n\n` +
      `🏷️ Marka: ${brandInfo}\n` +
      `👔 Tip: ${analysis.productType}\n` +
      `🎨 Renk: ${analysis.color}${categoryInfo}${packagingWarning}\n\n` +
      `📝 <b>Önerilen İsim:</b>\n${analysis.suggestedName}\n\n` +
      `<b>SKU ve Fiyat girin:</b>\n<code>[SKU] [Fiyat]</code>\n\n` +
      `Örnek: <code>TH001 450</code>\n\n` +
      `<i>/iptal ile vazgeçebilirsiniz</i>`
    );
  } else {
    // No AI or failed - fallback to manual
    userStates.set(userId, {
      action: "add_product_info",
      data: { photoUrls: [fileUrl] },
    });

    await sendMessage(chatId, `📷 Fotoğraf alındı!\n\nÜrün bilgilerini gönderin:\n\n<code>SKU İsim Fiyat</code>\n\nÖrnek:\n<code>YLDZ02 Loro Piano Kazak 1200</code>\n\n<i>Varsayılan bedenler: S, M, L, XL, XXL</i>`);
  }
}

// Handle video upload for product (with media group support)
async function handleVideo(
  chatId: number,
  userId: number,
  video: TelegramVideo,
  caption?: string,
  mediaGroupId?: string
) {
  // If this is part of a media group, collect videos
  if (mediaGroupId) {
    const existingGroup = mediaGroups.get(mediaGroupId);

    if (existingGroup) {
      // Add video to existing group
      existingGroup.videos.push(video.file_id);
      if (caption && !existingGroup.caption) {
        existingGroup.caption = caption;
      }
      existingGroup.timestamp = Date.now();
    } else {
      // Create new media group with video
      const groupData: MediaGroupData = {
        chatId,
        userId,
        photos: [],
        videos: [video.file_id],
        caption,
        timestamp: Date.now(),
      };
      mediaGroups.set(mediaGroupId, groupData);

      // Set timeout to process after all media arrive
      groupData.timeoutId = setTimeout(() => {
        processMediaGroup(mediaGroupId);
      }, MEDIA_GROUP_TIMEOUT);
    }
    return;
  }

  // Single video handling
  const fileUrl = await getFileUrl(video.file_id);

  if (!fileUrl) {
    await sendMessage(chatId, "❌ Video alınamadı. Tekrar deneyin.");
    return;
  }

  // Get thumbnail URL for AI analysis
  let thumbnailUrl: string | null = null;
  if (video.thumbnail) {
    thumbnailUrl = await getFileUrl(video.thumbnail.file_id);
  }

  // Check for "video SKU" pattern in caption
  if (caption) {
    const videoMatch = caption.match(/^video\s+([A-Za-z0-9]+)$/i);
    if (videoMatch) {
      const sku = videoMatch[1].toUpperCase();
      const productResult = await apiCall(`/products/sku/${sku}`);
      if (productResult.success && productResult.data) {
        await addVideoToProduct(chatId, productResult.data.id, sku, fileUrl);
        return;
      } else {
        await sendMessage(chatId, `❌ Ürün bulunamadı: ${sku}`);
        return;
      }
    }

    // Try simple format: "SKU İsim Fiyat" or "SKU | İsim | Fiyat"
    const parsed = parseSimpleCaption(caption);
    if (parsed) {
      await createProductWithVideo(chatId, parsed.sku, parsed.name, parsed.price, fileUrl, undefined, undefined, userId);
      return;
    }
  }

  // No caption or couldn't parse - try AI analysis on thumbnail
  if (thumbnailUrl) {
    await sendMessage(chatId, "🎬 Video alındı!\n\n🔍 Ürün analiz ediliyor...");

    const analysis = await analyzeProductImage(thumbnailUrl);

    if (analysis && analysis.autoSku) {
      // Store analysis for later use - fully automatic mode
      userStates.set(userId, {
        action: "add_product_auto",
        data: {
          photoUrls: [],
          videoUrls: [fileUrl],
          thumbnailUrl,
          analysis,
        },
      });

      const brandInfo = analysis.brand ? `<b>${analysis.brand}</b>` : "Bilinmeyen Marka";
      const confidenceEmoji = analysis.confidence === "high" ? "🎯" : analysis.confidence === "medium" ? "🤔" : "❓";
      const categoryInfo = analysis.suggestedCategory ? `📁 Kategori: ${analysis.suggestedCategory}\n` : "";

      await sendMessage(
        chatId,
        `${confidenceEmoji} <b>Ürün Tanındı!</b>\n\n` +
        `🏷️ ${analysis.suggestedName}\n\n` +
        `🔖 SKU: <code>${analysis.autoSku}</code> (otomatik)\n` +
        `${categoryInfo}` +
        `🏪 Marka: ${brandInfo}\n` +
        `👔 Tip: ${analysis.productType}\n` +
        `🎨 Renk: ${analysis.color}\n` +
        `🎬 Video: 1 adet\n\n` +
        `<b>💰 Sadece fiyat girin:</b>\n` +
        `Örnek: <code>450</code>\n\n` +
        `<i>Farklı SKU veya isim istiyorsanız:</i>\n` +
        `<code>[Fiyat] [SKU] [Yeni İsim]</code>\n\n` +
        `<i>/iptal ile vazgeçebilirsiniz</i>`
      );
    } else if (analysis) {
      // AI worked but couldn't generate SKU - ask for SKU and price
      userStates.set(userId, {
        action: "add_product_with_ai",
        data: {
          photoUrls: [],
          videoUrls: [fileUrl],
          thumbnailUrl,
          analysis,
        },
      });

      const brandInfo = analysis.brand ? `<b>${analysis.brand}</b>` : "Marka belirlenemedi";
      const confidenceEmoji = analysis.confidence === "high" ? "🎯" : analysis.confidence === "medium" ? "🤔" : "❓";
      const categoryInfo = analysis.suggestedCategory ? `\n📁 Kategori: ${analysis.suggestedCategory}` : "";

      await sendMessage(
        chatId,
        `${confidenceEmoji} <b>Ürün Tanındı!</b>\n\n` +
        `🏷️ Marka: ${brandInfo}\n` +
        `👔 Tip: ${analysis.productType}\n` +
        `🎨 Renk: ${analysis.color}${categoryInfo}\n` +
        `🎬 Video: 1 adet\n\n` +
        `📝 <b>Önerilen İsim:</b>\n${analysis.suggestedName}\n\n` +
        `<b>SKU ve Fiyat girin:</b>\n<code>[SKU] [Fiyat]</code>\n\n` +
        `Örnek: <code>TH001 450</code>\n\n` +
        `<i>/iptal ile vazgeçebilirsiniz</i>`
      );
    } else {
      // No AI or failed - fallback to manual
      userStates.set(userId, {
        action: "add_product_info",
        data: { photoUrls: [], videoUrls: [fileUrl], thumbnailUrl },
      });

      await sendMessage(
        chatId,
        `🎬 Video alındı!\n\nÜrün bilgilerini gönderin:\n\n<code>SKU İsim Fiyat</code>\n\nÖrnek:\n<code>YLDZ02 Loro Piano Kazak 1200</code>\n\n<i>Varsayılan bedenler: S, M, L, XL, XXL</i>\n<i>/iptal ile vazgeçebilirsiniz</i>`
      );
    }
  } else {
    // No thumbnail available - fallback to manual entry
    userStates.set(userId, {
      action: "add_product_info",
      data: { photoUrls: [], videoUrls: [fileUrl] },
    });

    await sendMessage(
      chatId,
      `🎬 Video alındı!\n\nÜrün bilgilerini gönderin:\n\n<code>SKU İsim Fiyat</code>\n\nÖrnek:\n<code>YLDZ02 Loro Piano Kazak 1200</code>\n\n<i>Varsayılan bedenler: S, M, L, XL, XXL</i>\n<i>/iptal ile vazgeçebilirsiniz</i>`
    );
  }
}

// Add video to existing product
async function addVideoToProduct(
  chatId: number,
  productId: number,
  sku: string,
  videoUrl: string
) {
  await sendMessage(chatId, "🎬 Video yükleniyor...");

  const result = await apiCall(`/products/${productId}/videos/url`, "POST", {
    videoUrl,
    isPrimary: false,
  });

  if (result.success) {
    await sendMessage(
      chatId,
      `✅ <b>Video eklendi!</b>\n\n📦 SKU: ${sku}\n🎬 Video yüklendi\n⏱️ Süre: ${result.data?.duration || 0} saniye`
    );
  } else {
    console.error(`[Video Upload] Error for ${sku}:`, result.error);
    await sendMessage(
      chatId,
      `❌ Video yüklenemedi.\n\n<i>Hata: ${result.error?.message || "Bilinmeyen hata"}</i>`
    );
  }
}

// Create product with photo
async function createProductWithPhoto(
  chatId: number,
  sku: string,
  name: string,
  price: number,
  photoUrl: string,
  categorySlug?: string,
  customSizes?: string[],
  userId?: number
) {
  // Default sizes: S, M, L, XL, XXL
  const sizes = customSizes && customSizes.length > 0 ? customSizes : DEFAULT_SIZES;

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

  let message: string;
  if (imageResult.success) {
    message = `✅ <b>Ürün eklendi!</b>\n\n📦 SKU: <code>${sku.toUpperCase()}</code>\n📝 İsim: ${name}\n💰 Fiyat: ${formatCurrency(price)}\n📏 Bedenler: ${sizes.join(", ")}\n🖼️ Fotoğraf: Yüklendi`;
  } else {
    console.error(`Cloudinary upload failed for ${sku}:`, imageResult.error);
    message = `⚠️ Ürün eklendi ama fotoğraf yüklenemedi.\n\n📦 SKU: <code>${sku.toUpperCase()}</code>\n📏 Bedenler: ${sizes.join(", ")}\n\n<i>Hata: ${imageResult.error?.message || "Cloudinary hatası"}</i>`;
  }

  // Ask for stock entry
  message += `\n\n📦 <b>Stok girin (seri format):</b>\n${getStockEntryExample(sizes)}\n\nVeya tek sayı: <code>5</code>\n(Tüm bedenlere 5 adet)\n\n<i>/atla ile stok girişini atlayabilirsiniz</i>`;

  await sendMessage(chatId, message);

  // Set state to wait for stock entry
  if (userId) {
    userStates.set(userId, {
      action: "add_stock_serial",
      data: { sku: sku.toUpperCase(), sizes },
    });
  }
}

// Create product with video (and optional thumbnail as photo)
async function createProductWithVideo(
  chatId: number,
  sku: string,
  name: string,
  price: number,
  videoUrl: string,
  categorySlug?: string,
  customSizes?: string[],
  userId?: number
) {
  // Default sizes: S, M, L, XL, XXL
  const sizes = customSizes && customSizes.length > 0 ? customSizes : DEFAULT_SIZES;

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

  let message = `✅ <b>Ürün eklendi!</b>\n\n📦 SKU: <code>${sku.toUpperCase()}</code>\n📝 İsim: ${name}\n💰 Fiyat: ${formatCurrency(price)}\n📏 Bedenler: ${sizes.join(", ")}`;

  // Upload video only (no thumbnail - user can add photos later)
  console.log(`Uploading video for product ${sku}: ${videoUrl}`);
  const videoResult = await apiCall(`/products/${result.data.id}/videos/url`, "POST", {
    videoUrl,
    isPrimary: false,
  });

  if (videoResult.success) {
    message += `\n🎬 Video: Yüklendi`;
  } else {
    console.error(`Video upload failed for ${sku}:`, videoResult.error);
    message += `\n⚠️ Video yüklenemedi: ${videoResult.error?.message || "Bilinmeyen hata"}`;
  }

  // Ask for stock entry
  message += `\n\n📦 <b>Stok girin (seri format):</b>\n${getStockEntryExample(sizes)}\n\nVeya tek sayı: <code>5</code>\n(Tüm bedenlere 5 adet)\n\n<i>/atla ile stok girişini atlayabilirsiniz</i>`;

  await sendMessage(chatId, message);

  // Set state to wait for stock entry
  if (userId) {
    userStates.set(userId, {
      action: "add_stock_serial",
      data: { sku: sku.toUpperCase(), sizes },
    });
  }
}

// Process media group after timeout - upload all photos and videos
async function processMediaGroup(mediaGroupId: string) {
  const groupData = mediaGroups.get(mediaGroupId);
  if (!groupData) return;

  mediaGroups.delete(mediaGroupId);

  const { chatId, userId, photos, videos, caption } = groupData;

  // Get file URLs for all photos
  const photoUrls: string[] = [];
  for (const fileId of photos) {
    const url = await getFileUrl(fileId);
    if (url) photoUrls.push(url);
  }

  // Get file URLs for all videos
  const videoUrls: string[] = [];
  for (const fileId of videos) {
    const url = await getFileUrl(fileId);
    if (url) videoUrls.push(url);
  }

  const totalMedia = photoUrls.length + videoUrls.length;

  if (totalMedia === 0) {
    await sendMessage(chatId, "❌ Medya dosyaları alınamadı. Tekrar deneyin.");
    return;
  }

  // Check if this is a /foto command pending
  const pendingAdd = pendingPhotoAdds.get(`${chatId}_${userId}`);
  if (pendingAdd) {
    pendingPhotoAdds.delete(`${chatId}_${userId}`);
    await addPhotosToProduct(chatId, pendingAdd.productId, pendingAdd.sku, photoUrls);
    // Also upload videos if any
    for (const videoUrl of videoUrls) {
      await addVideoToProduct(chatId, pendingAdd.productId, pendingAdd.sku, videoUrl);
    }
    return;
  }

  // Check caption for product info
  if (caption) {
    // Check for "foto SKU" or "video SKU" pattern first
    const mediaMatch = caption.match(/^(foto|video)\s+([A-Za-z0-9]+)$/i);
    if (mediaMatch) {
      const sku = mediaMatch[2].toUpperCase();
      const productResult = await apiCall(`/products/sku/${sku}`);
      if (productResult.success && productResult.data) {
        if (photoUrls.length > 0) {
          await addPhotosToProduct(chatId, productResult.data.id, sku, photoUrls);
        }
        for (const videoUrl of videoUrls) {
          await addVideoToProduct(chatId, productResult.data.id, sku, videoUrl);
        }
        return;
      } else {
        await sendMessage(chatId, `❌ Ürün bulunamadı: ${sku}`);
        return;
      }
    }

    // Try simple format: "SKU İsim Fiyat" or "SKU | İsim | Fiyat"
    const parsed = parseSimpleCaption(caption);
    if (parsed) {
      await createProductWithMultiplePhotos(chatId, parsed.sku, parsed.name, parsed.price, photoUrls, undefined, undefined, userId, videoUrls);
      return;
    }
  }

  // No caption or couldn't parse - try AI analysis on first photo
  const mediaInfo = videoUrls.length > 0
    ? `📷 <b>${photoUrls.length} fotoğraf + 🎬 ${videoUrls.length} video alındı!</b>`
    : `📷 <b>${photoUrls.length} fotoğraf alındı!</b>`;

  await sendMessage(chatId, `${mediaInfo}\n\n🔍 Ürün analiz ediliyor...`);

  const analysis = photoUrls.length > 0 ? await analyzeProductImage(photoUrls[0]) : null;

  if (analysis && analysis.autoSku) {
    // Store analysis for later use - fully automatic mode
    userStates.set(userId, {
      action: "add_product_auto",
      data: {
        photoUrls,
        videoUrls,
        analysis,
      },
    });

    const brandInfo = analysis.brand ? `<b>${analysis.brand}</b>` : "Bilinmeyen Marka";
    const confidenceEmoji = analysis.confidence === "high" ? "🎯" : analysis.confidence === "medium" ? "🤔" : "❓";
    const categoryInfo = analysis.suggestedCategory ? `📁 Kategori: ${analysis.suggestedCategory}\n` : "";
    const mediaCount = videoUrls.length > 0
      ? `🖼️ Fotoğraf: ${photoUrls.length} | 🎬 Video: ${videoUrls.length}\n\n`
      : `🖼️ Fotoğraf: ${photoUrls.length} adet\n\n`;

    await sendMessage(
      chatId,
      `${confidenceEmoji} <b>Ürün Tanındı!</b>\n\n` +
      `🏷️ ${analysis.suggestedName}\n\n` +
      `🔖 SKU: <code>${analysis.autoSku}</code> (otomatik)\n` +
      `${categoryInfo}` +
      `🏪 Marka: ${brandInfo}\n` +
      `👔 Tip: ${analysis.productType}\n` +
      `🎨 Renk: ${analysis.color}\n` +
      mediaCount +
      `<b>💰 Sadece fiyat girin:</b>\n` +
      `Örnek: <code>450</code>\n\n` +
      `<i>Farklı SKU veya isim istiyorsanız:</i>\n` +
      `<code>[Fiyat] [SKU] [Yeni İsim]</code>\n\n` +
      `<i>/iptal ile vazgeçebilirsiniz</i>`
    );
  } else if (analysis) {
    // AI worked but couldn't generate SKU - ask for SKU and price
    userStates.set(userId, {
      action: "add_product_with_ai",
      data: {
        photoUrls,
        videoUrls,
        analysis,
      },
    });

    const brandInfo = analysis.brand ? `<b>${analysis.brand}</b>` : "Marka belirlenemedi";
    const confidenceEmoji = analysis.confidence === "high" ? "🎯" : analysis.confidence === "medium" ? "🤔" : "❓";
    const categoryInfo = analysis.suggestedCategory ? `\n📁 Kategori: ${analysis.suggestedCategory}` : "";
    const mediaCount = videoUrls.length > 0
      ? `🖼️ Fotoğraf: ${photoUrls.length} | 🎬 Video: ${videoUrls.length}\n\n`
      : `🖼️ Fotoğraf: ${photoUrls.length} adet\n\n`;

    await sendMessage(
      chatId,
      `${confidenceEmoji} <b>Ürün Tanındı!</b>\n\n` +
      `🏷️ Marka: ${brandInfo}\n` +
      `👔 Tip: ${analysis.productType}\n` +
      `🎨 Renk: ${analysis.color}${categoryInfo}\n` +
      mediaCount +
      `📝 <b>Önerilen İsim:</b>\n${analysis.suggestedName}\n\n` +
      `<b>SKU ve Fiyat girin:</b>\n<code>[SKU] [Fiyat]</code>\n\n` +
      `Örnek: <code>TH001 450</code>\n\n` +
      `<i>/iptal ile vazgeçebilirsiniz</i>`
    );
  } else {
    // No AI or failed - fallback to manual
    userStates.set(userId, {
      action: "add_product_info",
      data: { photoUrls, videoUrls },
    });

    const manualMediaInfo = videoUrls.length > 0
      ? `📷 <b>${photoUrls.length} fotoğraf + 🎬 ${videoUrls.length} video alındı!</b>`
      : `📷 <b>${photoUrls.length} fotoğraf alındı!</b>`;

    await sendMessage(
      chatId,
      `${manualMediaInfo}\n\nÜrün bilgilerini gönderin:\n\n<code>SKU İsim Fiyat</code>\n\nÖrnek:\n<code>YLDZ02 Loro Piano Kazak 1200</code>\n\n<i>Varsayılan bedenler: S, M, L, XL, XXL</i>\n<i>/iptal ile vazgeçebilirsiniz</i>`
    );
  }
}

// Create product with multiple photos and videos
async function createProductWithMultiplePhotos(
  chatId: number,
  sku: string,
  name: string,
  price: number,
  photoUrls: string[],
  categoryName?: string,
  customSizes?: string[],
  userId?: number,
  videoUrls?: string[]
) {
  const sizes = customSizes && customSizes.length > 0 ? customSizes : DEFAULT_SIZES;

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

  // Find or create category if provided
  if (categoryName) {
    const categoryId = await findOrCreateCategory(categoryName);
    if (categoryId) {
      productData.categoryId = categoryId;
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

  // Upload videos if any
  let videoUploadedCount = 0;
  if (videoUrls && videoUrls.length > 0) {
    for (let i = 0; i < videoUrls.length; i++) {
      console.log(`Uploading video ${i + 1}/${videoUrls.length} for ${sku}: ${videoUrls[i]}`);
      const videoResult = await apiCall(`/products/${result.data.id}/videos/url`, "POST", {
        videoUrl: videoUrls[i],
        isPrimary: false,
      });
      if (videoResult.success) {
        videoUploadedCount++;
      } else {
        console.error(`Video upload failed for ${sku} video ${i + 1}:`, videoResult.error);
        errors.push(videoResult.error?.message || `Video ${i + 1} yüklenemedi`);
      }
    }
  }

  // Get category name for display
  let categoryDisplay = "";
  if (categoryName) {
    categoryDisplay = `\n📁 Kategori: ${categoryName}`;
  }

  const mediaDisplay = videoUrls && videoUrls.length > 0
    ? `🖼️ Fotoğraf: ${uploadedCount}/${photoUrls.length} | 🎬 Video: ${videoUploadedCount}/${videoUrls.length}`
    : `🖼️ Fotoğraf: ${uploadedCount}/${photoUrls.length} yüklendi`;

  let message = `✅ <b>Ürün eklendi!</b>\n\n📦 SKU: <code>${sku.toUpperCase()}</code>\n📝 İsim: ${name}\n💰 Fiyat: ${formatCurrency(price)}${categoryDisplay}\n📏 Bedenler: ${sizes.join(", ")}\n${mediaDisplay}`;

  if (errors.length > 0) {
    message += `\n\n⚠️ Bazı dosyalar yüklenemedi:\n${errors.slice(0, 3).join("\n")}`;
  }

  // Ask for stock entry
  message += `\n\n📦 <b>Stok girin (seri format):</b>\n${getStockEntryExample(sizes)}\n\nVeya tek sayı: <code>5</code>\n(Tüm bedenlere 5 adet)\n\n<i>/atla ile stok girişini atlayabilirsiniz</i>`;

  await sendMessage(chatId, message);

  // Set state to wait for stock entry
  if (userId) {
    userStates.set(userId, {
      action: "add_stock_serial",
      data: { sku: sku.toUpperCase(), sizes },
    });
  }
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
    const videoUrls = (state.data.videoUrls as string[]) || [];
    const thumbnailUrl = state.data.thumbnailUrl as string | undefined;
    const photoUrl = state.data.photoUrl as string | undefined;

    if (photoUrls && photoUrls.length > 0) {
      await createProductWithMultiplePhotos(chatId, sku, name, price, photoUrls, undefined, undefined, userId, videoUrls);
    } else if (videoUrls.length > 0) {
      // Only video(s), no photos - use video with thumbnail
      await createProductWithVideo(chatId, sku, name, price, videoUrls[0], undefined, undefined, userId);
    } else if (photoUrl) {
      await createProductWithPhoto(chatId, sku, name, price, photoUrl, undefined, undefined, userId);
    }

    // Don't delete state - create functions set new state for stock entry
    return true;
  }

  // Fully automatic product creation: just price, or "price sku name"
  if (state.action === "add_product_auto") {
    const analysis = state.data.analysis as ProductAnalysis;
    const photoUrls = state.data.photoUrls as string[];
    const videoUrls = (state.data.videoUrls as string[]) || [];
    const thumbnailUrl = state.data.thumbnailUrl as string | undefined;

    const words = text.trim().split(/\s+/);
    const firstWord = words[0];
    const price = parseFloat(firstWord);

    // Validate price
    if (isNaN(price) || price <= 0) {
      await sendMessage(chatId, "❌ Geçersiz fiyat. Sayı girin.\n\nÖrnek: <code>450</code>");
      return true;
    }

    // Use auto SKU by default, or custom if provided
    let sku = analysis.autoSku || "URN01";
    let productName = analysis.suggestedName;

    // If user provided more than just price: "450 TH001 Custom Name"
    if (words.length >= 2) {
      // Second word might be custom SKU
      const possibleSku = words[1].toUpperCase();
      // Check if it looks like a SKU (alphanumeric, 2-10 chars)
      if (/^[A-Z0-9]{2,10}$/.test(possibleSku)) {
        sku = possibleSku;
        // Rest is custom name
        if (words.length > 2) {
          productName = words.slice(2).join(" ");
        }
      } else {
        // Not a SKU, treat as part of custom name
        productName = words.slice(1).join(" ");
      }
    }

    // Use suggested category name (will be auto-created if needed)
    const categoryName = analysis.suggestedCategory || undefined;
    // Get correct sizes based on product type
    const sizes = getSizesByType(analysis.productType, analysis.sizeType);

    if (photoUrls && photoUrls.length > 0) {
      await createProductWithMultiplePhotos(chatId, sku, productName, price, photoUrls, categoryName, sizes, userId, videoUrls);
    } else if (videoUrls.length > 0) {
      // Only video(s), no photos - use video with thumbnail
      await createProductWithVideo(chatId, sku, productName, price, videoUrls[0], analysis.suggestedCategorySlug || undefined, sizes, userId);
    }

    // Don't delete state - create functions set new state for stock entry
    return true;
  }

  // AI-assisted product creation: "SKU Fiyat" or "SKU Fiyat Farklı İsim"
  if (state.action === "add_product_with_ai") {
    const analysis = state.data.analysis as ProductAnalysis;
    const photoUrls = state.data.photoUrls as string[];
    const videoUrls = (state.data.videoUrls as string[]) || [];
    const thumbnailUrl = state.data.thumbnailUrl as string | undefined;

    // Parse input: "SKU Fiyat" or "SKU Fiyat Custom Name Here"
    const words = text.trim().split(/\s+/);

    if (words.length < 2) {
      await sendMessage(chatId, "❌ Geçersiz format.\n\n<code>[SKU] [Fiyat]</code>\n\nÖrnek: <code>TH001 450</code>");
      return true;
    }

    const sku = words[0].toUpperCase();
    const price = parseFloat(words[1]);

    if (isNaN(price) || price <= 0) {
      await sendMessage(chatId, "❌ Geçersiz fiyat. Sayı girin.");
      return true;
    }

    // Use custom name if provided, otherwise use AI suggestion
    const customName = words.length > 2 ? words.slice(2).join(" ") : null;
    const productName = customName || analysis.suggestedName;

    // Use suggested category name (will be auto-created if needed)
    const categoryName = analysis.suggestedCategory || undefined;
    // Get correct sizes based on product type
    const sizes = getSizesByType(analysis.productType, analysis.sizeType);

    if (photoUrls && photoUrls.length > 0) {
      await createProductWithMultiplePhotos(chatId, sku, productName, price, photoUrls, categoryName, sizes, userId, videoUrls);
    } else if (videoUrls.length > 0) {
      // Only video(s), no photos - use video with thumbnail
      await createProductWithVideo(chatId, sku, productName, price, videoUrls[0], analysis.suggestedCategorySlug || undefined, sizes, userId);
    }

    // Don't delete state - create functions set new state for stock entry
    return true;
  }

  // Serial stock entry: "1 2 3 2 1" or single number "5"
  if (state.action === "add_stock_serial") {
    // Check for skip command
    if (text.toLowerCase() === "/atla") {
      userStates.delete(userId);
      await sendMessage(chatId, "⏭️ Stok girişi atlandı.\n\n<i>Daha sonra stok eklemek için:</i>\n/seristok veya /stokekle");
      return true;
    }

    const { sku, sizes } = state.data as { sku: string; sizes: string[] };
    const numbers = text.trim().split(/\s+/).map(n => parseInt(n));

    // Validate all are numbers
    if (numbers.some(n => isNaN(n) || n < 0)) {
      await sendMessage(chatId, "❌ Geçersiz format. Sadece sayı girin.\n\nÖrnek: <code>1 2 3 2 1</code>\nVeya: <code>5</code>");
      return true;
    }

    let stockUpdates: { size: string; quantity: number }[] = [];

    if (numbers.length === 1) {
      // Single number - apply to all sizes
      const quantity = numbers[0];
      stockUpdates = sizes.map(size => ({ size, quantity }));
    } else if (numbers.length === sizes.length) {
      // Match sizes with numbers
      stockUpdates = sizes.map((size, i) => ({ size, quantity: numbers[i] }));
    } else {
      await sendMessage(
        chatId,
        `❌ ${sizes.length} beden için ${sizes.length} sayı girin.\n\n` +
        `Bedenler: ${sizes.join(", ")}\n` +
        `Örnek: <code>${sizes.map((_, i) => i + 1).join(" ")}</code>\n\n` +
        `Veya tek sayı girerek tüm bedenlere aynı stok ekleyin:\n<code>5</code>`
      );
      return true;
    }

    // Add stocks
    let successCount = 0;
    let totalStock = 0;
    const results: string[] = [];

    for (const { size, quantity } of stockUpdates) {
      if (quantity > 0) {
        const result = await apiCall("/stock/update-by-sku", "POST", {
          sku,
          size,
          change: quantity,
          reason: "restock",
          note: "Telegram bot ile eklendi (seri giriş)",
        });
        if (result.success) {
          successCount++;
          totalStock += quantity;
          results.push(`${size}: +${quantity}`);
        }
      } else {
        results.push(`${size}: 0`);
      }
    }

    userStates.delete(userId);

    if (successCount > 0) {
      await sendMessage(
        chatId,
        `✅ <b>Stok eklendi!</b>\n\n` +
        `📦 SKU: ${sku}\n` +
        `📊 ${results.join(" | ")}\n` +
        `📈 Toplam: +${totalStock} adet\n\n` +
        `<i>Stok sorgulamak için:</i> /stok ${sku}`
      );
    } else {
      await sendMessage(chatId, `ℹ️ Stok girişi yapılmadı (tüm değerler 0).`);
    }

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
  kargo: "Kargo",
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
// KASA YÖNETİMİ KOMUTLARI
// ==========================================

// /kasaac [tutar] - Kasa aç
async function handleKasaAc(chatId: number, args: string[]) {
  if (args.length < 1) {
    await sendMessage(chatId, "❌ Kullanım: /kasaac [tutar]\nÖrnek: /kasaac 5000");
    return;
  }

  const amount = parseFloat(args[0]);
  if (isNaN(amount) || amount < 0) {
    await sendMessage(chatId, "❌ Geçersiz tutar.");
    return;
  }

  const notes = args.slice(1).join(" ") || undefined;

  const result = await apiCall("/cash-register", "POST", {
    openingAmount: amount,
    notes,
  });

  if (result.success) {
    const today = new Date().toLocaleDateString("tr-TR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    await sendMessage(
      chatId,
      `✅ <b>KASA AÇILDI</b>\n\n📅 ${today}\n💵 Açılış: ${formatCurrency(amount)}${notes ? `\n📝 Not: ${notes}` : ""}\n\nGün sonu için: /kasakapat`
    );
  } else {
    await sendMessage(chatId, `❌ ${result.error?.message || "Kasa açılamadı"}`);
  }
}

// /kasakapat - Kasa kapat ve rapor al
async function handleKasaKapat(chatId: number) {
  const result = await apiCall("/cash-register/close", "POST", {});

  if (!result.success) {
    await sendMessage(chatId, `❌ ${result.error?.message || "Kasa kapatılamadı"}`);
    return;
  }

  const r = result.data.report;
  const diffEmoji = r.difference === 0 ? "✅" : r.difference > 0 ? "📈" : "📉";
  const diffText = r.difference === 0 ? "Tam!" : r.difference > 0 ? `+${formatCurrency(r.difference)} fazla` : `${formatCurrency(r.difference)} eksik`;

  let message = `💵 <b>KASA KAPANIŞ RAPORU</b>\n\n`;
  message += `📂 Açılış: ${formatCurrency(r.openingAmount)}\n\n`;

  message += `<b>💰 SATIŞLAR</b>\n`;
  message += `• Nakit: ${formatCurrency(r.cashSales)}\n`;
  message += `• Kart: ${formatCurrency(r.cardSales)}\n`;
  message += `• Toplam: ${formatCurrency(r.totalSales)} (${r.salesCount} satış)\n\n`;

  message += `<b>💸 GİDERLER</b>\n`;
  message += `• Toplam: ${formatCurrency(r.totalExpenses)} (${r.expenseCount} gider)\n\n`;

  message += `<b>📊 HESAPLAMA</b>\n`;
  message += `Açılış + Nakit Satış - Gider\n`;
  message += `${formatCurrency(r.openingAmount)} + ${formatCurrency(r.cashSales)} - ${formatCurrency(r.totalExpenses)}\n`;
  message += `= <b>${formatCurrency(r.expectedClosing)}</b> (Beklenen)\n\n`;

  message += `${diffEmoji} <b>Durum: ${diffText}</b>`;

  await sendMessage(chatId, message);
}

// ==========================================
// TOPLU FİYAT GÜNCELLEME KOMUTLARI
// ==========================================

// Pending bulk price update storage
interface PendingPriceUpdate {
  percentage: number;
  action: "increase" | "decrease";
  skuPrefix?: string;
  categorySlug?: string;
  count: number;
}
const pendingPriceUpdates: Map<number, PendingPriceUpdate> = new Map();

// /zamekle [yüzde] [filtre] - Zam ekle (önizleme)
async function handleZamEkle(chatId: number, userId: number, args: string[]) {
  if (args.length < 1) {
    await sendMessage(
      chatId,
      `❌ Kullanım:\n/zamekle [yüzde] - Tüm ürünlere\n/zamekle [yüzde] [SKU] - SKU başlangıcına göre\n/zamekle [yüzde] "kategori" - Kategoriye göre\n\nÖrnekler:\n• /zamekle 10\n• /zamekle 15 LCST\n• /zamekle 20 "Üst Giyim"`
    );
    return;
  }

  const percentage = parseFloat(args[0]);
  if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
    await sendMessage(chatId, "❌ Geçerli bir yüzde girin (1-100)");
    return;
  }

  // Parse filter
  let skuPrefix: string | undefined;
  let categorySlug: string | undefined;

  if (args.length > 1) {
    const filter = args.slice(1).join(" ");
    // Check if it's a category (in quotes)
    const categoryMatch = filter.match(/"([^"]+)"/);
    if (categoryMatch) {
      // Convert category name to slug
      categorySlug = categoryMatch[1]
        .toLowerCase()
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ç/g, "c")
        .replace(/ğ/g, "g")
        .replace(/\s+/g, "-");
    } else {
      skuPrefix = args[1].toUpperCase();
    }
  }

  const result = await apiCall("/products/bulk-price", "POST", {
    percentage,
    action: "increase",
    skuPrefix,
    categorySlug,
  });

  if (!result.success) {
    await sendMessage(chatId, `❌ ${result.error?.message || "Önizleme alınamadı"}`);
    return;
  }

  const data = result.data;

  // Store pending update
  pendingPriceUpdates.set(userId, {
    percentage,
    action: "increase",
    skuPrefix,
    categorySlug,
    count: data.count,
  });

  let filterText = "Tüm ürünler";
  if (skuPrefix) filterText = `SKU: ${skuPrefix}*`;
  if (categorySlug) filterText = `Kategori: ${categorySlug}`;

  let message = `📈 <b>ZAM ÖNİZLEME</b>\n\n`;
  message += `🎯 Filtre: ${filterText}\n`;
  message += `📊 Etkilenen: <b>${data.count} ürün</b>\n`;
  message += `📈 Zam: <b>%${percentage}</b>\n\n`;

  message += `<b>Örnek ürünler:</b>\n`;
  for (const p of data.preview.slice(0, 5)) {
    message += `• ${p.sku}: ${formatCurrency(p.oldPrice)} → ${formatCurrency(p.newPrice)}\n`;
  }

  message += `\n⚠️ Onaylamak için /onayla yazın\n❌ İptal için /iptal`;

  await sendMessage(chatId, message);
}

// /indirim [yüzde] [filtre] - İndirim uygula (önizleme)
async function handleIndirim(chatId: number, userId: number, args: string[]) {
  if (args.length < 1) {
    await sendMessage(
      chatId,
      `❌ Kullanım:\n/indirim [yüzde] - Tüm ürünlere\n/indirim [yüzde] [SKU] - SKU başlangıcına göre\n/indirim [yüzde] "kategori" - Kategoriye göre\n\nÖrnekler:\n• /indirim 10\n• /indirim 15 LCST\n• /indirim 20 "Üst Giyim"`
    );
    return;
  }

  const percentage = parseFloat(args[0]);
  if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
    await sendMessage(chatId, "❌ Geçerli bir yüzde girin (1-100)");
    return;
  }

  // Parse filter
  let skuPrefix: string | undefined;
  let categorySlug: string | undefined;

  if (args.length > 1) {
    const filter = args.slice(1).join(" ");
    const categoryMatch = filter.match(/"([^"]+)"/);
    if (categoryMatch) {
      categorySlug = categoryMatch[1]
        .toLowerCase()
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ç/g, "c")
        .replace(/ğ/g, "g")
        .replace(/\s+/g, "-");
    } else {
      skuPrefix = args[1].toUpperCase();
    }
  }

  const result = await apiCall("/products/bulk-price", "POST", {
    percentage,
    action: "decrease",
    skuPrefix,
    categorySlug,
  });

  if (!result.success) {
    await sendMessage(chatId, `❌ ${result.error?.message || "Önizleme alınamadı"}`);
    return;
  }

  const data = result.data;

  // Store pending update
  pendingPriceUpdates.set(userId, {
    percentage,
    action: "decrease",
    skuPrefix,
    categorySlug,
    count: data.count,
  });

  let filterText = "Tüm ürünler";
  if (skuPrefix) filterText = `SKU: ${skuPrefix}*`;
  if (categorySlug) filterText = `Kategori: ${categorySlug}`;

  let message = `📉 <b>İNDİRİM ÖNİZLEME</b>\n\n`;
  message += `🎯 Filtre: ${filterText}\n`;
  message += `📊 Etkilenen: <b>${data.count} ürün</b>\n`;
  message += `📉 İndirim: <b>%${percentage}</b>\n\n`;

  message += `<b>Örnek ürünler:</b>\n`;
  for (const p of data.preview.slice(0, 5)) {
    message += `• ${p.sku}: ${formatCurrency(p.oldPrice)} → ${formatCurrency(p.newPrice)}\n`;
  }

  message += `\n⚠️ Onaylamak için /onayla yazın\n❌ İptal için /iptal`;

  await sendMessage(chatId, message);
}

// Handle price update confirmation
async function handlePriceUpdateConfirm(chatId: number, userId: number): Promise<boolean> {
  const pending = pendingPriceUpdates.get(userId);
  if (!pending) return false;

  pendingPriceUpdates.delete(userId);

  const result = await apiCall("/products/bulk-price", "PUT", {
    percentage: pending.percentage,
    action: pending.action,
    skuPrefix: pending.skuPrefix,
    categorySlug: pending.categorySlug,
  });

  if (result.success) {
    const actionText = pending.action === "increase" ? "zam" : "indirim";
    await sendMessage(
      chatId,
      `✅ <b>${pending.count} ürüne %${pending.percentage} ${actionText} uygulandı!</b>`
    );
  } else {
    await sendMessage(chatId, `❌ ${result.error?.message || "Güncelleme başarısız"}`);
  }

  return true;
}

// /defter or /kasa - Analyze ledger photo
async function handleDefter(chatId: number, userId: number, imageUrl: string, prefetchedData?: { base64: string; mediaType: string }) {
  if (!prefetchedData) {
    await sendMessage(chatId, "📒 Kasa defteri analiz ediliyor...");
  }

  const analysis = await analyzeLedgerImage(imageUrl, prefetchedData);

  if (!analysis) {
    await sendMessage(chatId, "❌ Defter analiz edilemedi. Lütfen daha net bir fotoğraf gönderin.");
    return;
  }

  // Store analysis in user state for confirmation
  userStates.set(userId, {
    action: "ledger_confirm",
    data: { analysis, imageUrl },
  });

  // Format the output message
  let message = `📒 <b>KASA DEFTERİ - ${analysis.date}</b>\n\n`;

  // Incomes
  if (analysis.incomes.length > 0) {
    message += `💰 <b>GELİRLER:</b>\n`;
    for (const income of analysis.incomes) {
      const paymentLabel = income.paymentType === "KK" ? " (KK)" : income.paymentType === "NH" ? " (NH)" : " (AH)";
      message += `• ${income.description} - ${formatCurrency(income.amount)}${paymentLabel}\n`;
    }
    message += `\n`;
  }

  // Expenses
  if (analysis.expenses.length > 0) {
    message += `📤 <b>GİDERLER:</b>\n`;
    for (const expense of analysis.expenses) {
      message += `• ${expense.description} - ${formatCurrency(expense.amount)}\n`;
    }
    message += `\n`;
  }

  // Summary
  message += `📊 <b>ÖZET:</b>\n`;
  if (analysis.summary.creditCard > 0) {
    message += `• Kredi Kartı: ${formatCurrency(analysis.summary.creditCard)}\n`;
  }
  if (analysis.summary.cash > 0) {
    message += `• Nakit/AH: ${formatCurrency(analysis.summary.cash)}\n`;
  }
  message += `• Toplam Gelir: ${formatCurrency(analysis.summary.totalIncome)}\n`;
  if (analysis.summary.totalExpense > 0) {
    message += `• Toplam Gider: ${formatCurrency(analysis.summary.totalExpense)}\n`;
  }
  message += `• <b>Net: ${formatCurrency(analysis.summary.net)}</b>\n\n`;

  message += `✅ Kaydetmek için: /onayla\n`;
  message += `❌ İptal: /iptal`;

  await sendMessage(chatId, message);
}

// /onayla - Confirm and save ledger entries
async function handleOnayla(chatId: number, userId: number) {
  // Check for pending price update first
  if (pendingPriceUpdates.has(userId)) {
    await handlePriceUpdateConfirm(chatId, userId);
    return;
  }

  const state = userStates.get(userId);

  if (!state || state.action !== "ledger_confirm") {
    await sendMessage(chatId, "❌ Onaylanacak bir işlem yok.");
    return;
  }

  const analysis = state.data.analysis as LedgerAnalysis;
  userStates.delete(userId);

  await sendMessage(chatId, "💾 Kayıtlar ekleniyor...");

  let savedIncomes = 0;
  let savedExpenses = 0;
  const errors: string[] = [];

  // Save incomes as sales
  for (const income of analysis.incomes) {
    const paymentMethod = income.paymentType === "KK" ? "credit_card" : "cash";
    const result = await apiCall("/sales", "POST", {
      payment_method: paymentMethod,
      items: [{
        sku: "DEFTER",
        size: "-",
        quantity: 1,
        unit_price: income.amount,
      }],
      notes: `Defter: ${income.description} (${income.paymentType || "AH"})`,
    });

    if (result.success) {
      savedIncomes++;
    } else {
      errors.push(`Gelir kaydedilemedi: ${income.description}`);
    }
  }

  // Save expenses
  for (const expense of analysis.expenses) {
    // Determine category based on description
    let category = "diger";
    const desc = expense.description.toLowerCase();
    if (desc.includes("kargo")) {
      category = "kargo";
    } else if (desc.includes("kira")) {
      category = "kira";
    } else if (desc.includes("fatura") || desc.includes("elektrik") || desc.includes("su") || desc.includes("doğalgaz")) {
      category = "fatura";
    } else if (desc.includes("maaş") || desc.includes("maas")) {
      category = "maas";
    }

    const result = await apiCall("/expenses", "POST", {
      amount: expense.amount,
      category,
      description: `Defter: ${expense.description}`,
    });

    if (result.success) {
      savedExpenses++;
    } else {
      errors.push(`Gider kaydedilemedi: ${expense.description}`);
    }
  }

  // Send summary
  let message = `✅ <b>Defter kaydedildi!</b>\n\n`;
  message += `📅 Tarih: ${analysis.date}\n`;
  message += `💰 Gelir kaydı: ${savedIncomes}/${analysis.incomes.length}\n`;
  message += `💸 Gider kaydı: ${savedExpenses}/${analysis.expenses.length}\n\n`;
  message += `💵 Toplam Gelir: ${formatCurrency(analysis.summary.totalIncome)}\n`;
  message += `💸 Toplam Gider: ${formatCurrency(analysis.summary.totalExpense)}\n`;
  message += `📈 Net: <b>${formatCurrency(analysis.summary.net)}</b>`;

  if (errors.length > 0) {
    message += `\n\n⚠️ Hatalar:\n${errors.join("\n")}`;
  }

  await sendMessage(chatId, message);
}

// /seristok [SKU] [stoklar] - Seri stok girişi
async function handleSeriStok(chatId: number, args: string[]) {
  if (args.length < 2) {
    await sendMessage(
      chatId,
      `❌ Kullanım: /seristok [SKU] [stok değerleri]\n\n` +
      `<b>Seri format:</b>\n` +
      `<code>/seristok LCST05 1 2 3 3 2 1 1 1</code>\n\n` +
      `<b>Tek sayı (tüm bedenlere):</b>\n` +
      `<code>/seristok LCST05 5</code>\n\n` +
      `<i>Bedenler ürün tipine göre otomatik:</i>\n` +
      `• Üst giyim: S-5XL (8 beden)\n` +
      `• Alt giyim: 28-42 (8 beden)\n` +
      `• Aksesuar: STD (1 beden)`
    );
    return;
  }

  const sku = args[0].toUpperCase();
  const stockValues = args.slice(1).map(n => parseInt(n));

  // Validate SKU exists
  const productResult = await apiCall(`/products/sku/${sku}`);
  if (!productResult.success || !productResult.data) {
    await sendMessage(chatId, `❌ Ürün bulunamadı: ${sku}`);
    return;
  }

  // Get product sizes from variants
  const variants = productResult.data.variants || [];
  const sizes = variants.map((v: { size: string }) => v.size);

  if (sizes.length === 0) {
    await sendMessage(chatId, `❌ Ürünün varyantı yok: ${sku}`);
    return;
  }

  // Validate all are numbers
  if (stockValues.some(n => isNaN(n) || n < 0)) {
    await sendMessage(chatId, "❌ Geçersiz stok değeri. Sadece pozitif sayı girin.");
    return;
  }

  let stockUpdates: { size: string; quantity: number }[] = [];

  if (stockValues.length === 1) {
    // Single number - apply to all sizes
    const quantity = stockValues[0];
    stockUpdates = sizes.map((size: string) => ({ size, quantity }));
  } else if (stockValues.length === sizes.length) {
    // Match sizes with numbers
    stockUpdates = sizes.map((size: string, i: number) => ({ size, quantity: stockValues[i] }));
  } else {
    await sendMessage(
      chatId,
      `❌ ${sizes.length} beden için ${sizes.length} sayı girin.\n\n` +
      `Bedenler: ${sizes.join(", ")}\n` +
      `Örnek: <code>/seristok ${sku} ${sizes.map((_: string, i: number) => i + 1).join(" ")}</code>`
    );
    return;
  }

  // Add stocks
  let successCount = 0;
  let totalStock = 0;
  const results: string[] = [];

  for (const { size, quantity } of stockUpdates) {
    if (quantity > 0) {
      const result = await apiCall("/stock/update-by-sku", "POST", {
        sku,
        size,
        change: quantity,
        reason: "restock",
        note: "Telegram bot ile eklendi (seri stok)",
      });
      if (result.success) {
        successCount++;
        totalStock += quantity;
        results.push(`${size}: +${quantity}`);
      }
    } else {
      results.push(`${size}: 0`);
    }
  }

  if (successCount > 0) {
    await sendMessage(
      chatId,
      `✅ <b>Stok eklendi!</b>\n\n` +
      `📦 SKU: ${sku}\n` +
      `📊 ${results.join(" | ")}\n` +
      `📈 Toplam: +${totalStock} adet\n\n` +
      `<i>Stok sorgulamak için:</i> /stok ${sku}`
    );
  } else {
    await sendMessage(chatId, `ℹ️ Stok girişi yapılmadı (tüm değerler 0).`);
  }
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

  // Debug logging for media
  if (message.photo) {
    console.log('[Webhook] Photo received:', message.photo[message.photo.length - 1]?.file_id);
  }
  if (message.video) {
    console.log('[Webhook] Video received:', message.video.file_id, 'thumbnail:', message.video.thumbnail?.file_id);
  }

  // Handle photo (with media group support)
  if (message.photo) {
    await handlePhoto(chatId, userId, message.photo, message.caption, message.media_group_id);
    return;
  }

  // Handle video (with media group support)
  if (message.video) {
    await handleVideo(chatId, userId, message.video, message.caption, message.media_group_id);
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

  // Clear state on new command (except /iptal, /atla, /onayla which handle state themselves)
  if (command !== "/iptal" && command !== "/atla" && command !== "/onayla") {
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
      case "/kasaac":
        await handleKasaAc(chatId, args);
        break;
      case "/kasakapat":
        await handleKasaKapat(chatId);
        break;
      case "/zamekle":
        await handleZamEkle(chatId, userId, args);
        break;
      case "/indirim":
        await handleIndirim(chatId, userId, args);
        break;
      case "/defter":
      case "/kasa":
        userStates.set(userId, { action: "wait_ledger_photo", data: {} });
        await sendMessage(chatId, "📒 Kasa defteri fotoğrafını gönderin...\n\n<i>/iptal ile vazgeçebilirsiniz</i>");
        break;
      case "/onayla":
        await handleOnayla(chatId, userId);
        break;
      case "/iptal":
        if (pendingPriceUpdates.has(userId)) {
          pendingPriceUpdates.delete(userId);
          await sendMessage(chatId, "❌ Fiyat güncelleme iptal edildi.");
        } else if (userStates.has(userId)) {
          userStates.delete(userId);
          await sendMessage(chatId, "❌ İşlem iptal edildi.");
        } else {
          await sendMessage(chatId, "ℹ️ İptal edilecek bir işlem yok.");
        }
        break;
      case "/foto":
        await handleFoto(chatId, userId, args);
        break;
      case "/fotograflar":
        await handleFotograflar(chatId, args);
        break;
      case "/seristok":
        await handleSeriStok(chatId, args);
        break;
      case "/atla":
        // Skip stock entry if in that state
        if (userStates.get(userId)?.action === "add_stock_serial") {
          userStates.delete(userId);
          await sendMessage(chatId, "⏭️ Stok girişi atlandı.");
        } else {
          await sendMessage(chatId, "ℹ️ Atlanacak bir işlem yok.");
        }
        break;
      default:
        await sendMessage(chatId, "❓ Bilinmeyen komut. /yardim yazarak komutları görebilirsiniz.");
    }
  } catch (error) {
    console.error("Telegram command error:", error);
    await sendMessage(chatId, "❌ Bir hata oluştu. Lütfen tekrar deneyin.");
  }
}
