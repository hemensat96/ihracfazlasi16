import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

// Görsel yükleme (base64 veya URL'den)
export async function uploadImage(
  source: string, // base64 data veya URL
  folder: string = "products"
): Promise<UploadResult> {
  try {
    const result = await cloudinary.uploader.upload(source, {
      folder: `ihrac-fazlasi/${folder}`,
      transformation: [
        { width: 1200, height: 1200, crop: "limit" },
        { quality: "auto:good" },
        { format: "webp" },
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Görsel yükleme başarısız");
  }
}

// URL'den görsel yükleme
export async function uploadImageFromUrl(
  imageUrl: string,
  folder: string = "products"
): Promise<UploadResult> {
  return uploadImage(imageUrl, folder);
}

// Görsel silme
export async function deleteImage(publicId: string): Promise<boolean> {
  try {
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return false;
  }
}

// Optimize edilmiş görsel URL'i oluşturma
export function getOptimizedUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: string;
  } = {}
): string {
  const { width = 800, height, quality = "auto:good" } = options;

  // Cloudinary URL'i değilse olduğu gibi döndür
  if (!url.includes("cloudinary.com")) {
    return url;
  }

  // URL'den transformation ekle
  const parts = url.split("/upload/");
  if (parts.length !== 2) return url;

  const transformations = [`q_${quality}`, `w_${width}`];
  if (height) transformations.push(`h_${height}`);
  transformations.push("c_limit", "f_auto");

  return `${parts[0]}/upload/${transformations.join(",")}/${parts[1]}`;
}

export default cloudinary;
