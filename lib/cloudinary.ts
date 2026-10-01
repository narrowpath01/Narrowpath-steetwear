/**
 * Cloudinary Image Optimization Utility
 * 
 * Injects automatic format negotiation (f_auto -> AVIF/WebP) and
 * quality optimization (q_auto), as well as responsive width/height caps
 * directly into Cloudinary delivery URLs without altering visual dimensions,
 * aspect ratios, or non-Cloudinary images.
 */

interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  quality?: string | number;
  format?: string;
  crop?: string;
}

export function getOptimizedCloudinaryUrl(
  url: string | null | undefined,
  options: CloudinaryTransformOptions = {}
): string {
  if (!url || typeof url !== "string") {
    return url || "";
  }

  // Only transform Cloudinary URLs that have an upload endpoint
  if (!url.includes("res.cloudinary.com") || !url.includes("/image/upload/")) {
    return url;
  }

  const {
    width,
    height,
    quality = "auto",
    format = "auto",
    crop = "limit",
  } = options;

  // Build the transformation parameters string
  const transforms: string[] = [`f_${format}`, `q_${quality}`];

  if (width && width > 0) {
    transforms.push(`w_${Math.round(width)}`);
    transforms.push(`c_${crop}`);
  }

  if (height && height > 0) {
    transforms.push(`h_${Math.round(height)}`);
    if (!transforms.includes(`c_${crop}`)) {
      transforms.push(`c_${crop}`);
    }
  }

  const transformString = transforms.join(",");

  // Split around /image/upload/
  const uploadIndex = url.indexOf("/image/upload/");
  if (uploadIndex === -1) return url;

  const prefix = url.slice(0, uploadIndex + "/image/upload/".length);
  const suffix = url.slice(uploadIndex + "/image/upload/".length);

  // Check if URL already has transformation flags at the start of suffix
  // e.g. "f_auto,q_auto/v12345/..." or "w_600/..."
  const firstSlashIndex = suffix.indexOf("/");
  if (firstSlashIndex !== -1) {
    const firstSegment = suffix.slice(0, firstSlashIndex);
    // If the first segment starts with standard Cloudinary flags (f_, q_, w_, c_, etc.)
    if (/^(?:[a-z]{1,2}_[a-zA-Z0-9_-]+,?)+$/.test(firstSegment)) {
      // Replace existing transformation segment with our optimized one
      return `${prefix}${transformString}/${suffix.slice(firstSlashIndex + 1)}`;
    }
  }

  // Suffix starts with version (v123456/...) or public_id directly
  return `${prefix}${transformString}/${suffix}`;
}
