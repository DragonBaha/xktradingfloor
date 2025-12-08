/**
 * Cloudflare CDN Utility
 *
 * Centralized configuration and utilities for Cloudflare R2/CDN asset delivery
 * Supports signed URLs, fallback handling, and performance optimizations
 */

/**
 * Get Cloudflare CDN base URL from environment variables
 * Falls back to empty string if not configured (for local development)
 */
export const getCdnBaseUrl = () => {
  // Check for VITE_CLOUDFLARE_CDN_BASE_URL first (custom domain)
  if (import.meta.env.VITE_CLOUDFLARE_CDN_BASE_URL) {
    return import.meta.env.VITE_CLOUDFLARE_CDN_BASE_URL.replace(/\/$/, "");
  }

  // Fallback to R2 public domain if available
  if (import.meta.env.VITE_R2_PUBLIC_DOMAIN) {
    return import.meta.env.VITE_R2_PUBLIC_DOMAIN.replace(/\/$/, "");
  }

  // For local development, return empty string to use relative paths
  return "";
};

/**
 * Get CDN asset URL with proper path handling
 *
 * @param {string} path - Asset path (e.g., "/assets/logo.png" or "assets/logo.png")
 * @param {Object} options - Options for URL generation
 * @param {boolean} options.signed - Whether to request a signed URL (requires backend)
 * @param {string} options.fallback - Fallback path if CDN fails
 * @returns {string} - Full CDN URL or relative path
 */
export const getCdnAssetUrl = (path, options = {}) => {
  if (!path) return path;

  const { signed = false, fallback = null } = options;
  const cdnBaseUrl = getCdnBaseUrl();

  // If no CDN configured, return relative path
  if (!cdnBaseUrl) {
    return path.startsWith("/") ? path : `/${path}`;
  }

  // Normalize path (remove leading slash if present, we'll add it back)
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

  // Construct CDN URL
  const cdnUrl = `${cdnBaseUrl}/${normalizedPath}`;

  // If signed URL is requested, we'll need backend support
  // For now, return the CDN URL directly
  // TODO: Implement signed URL generation when backend is ready
  if (signed) {
    // This would call a backend endpoint to get signed URL
    // For now, return regular CDN URL
    console.warn("Signed URLs not yet implemented. Using regular CDN URL.");
  }

  return cdnUrl;
};

/**
 * Get CDN asset URL with automatic fallback
 * Returns both CDN URL and fallback for use in image error handling
 *
 * @param {string} path - Asset path
 * @param {string} fallbackPath - Fallback path if CDN fails
 * @returns {Object} - { cdnUrl, fallbackUrl }
 */
export const getCdnAssetWithFallback = (
  path,
  fallbackPath = "/assets/placeholder.jpg"
) => {
  const cdnBaseUrl = getCdnBaseUrl();

  // If CDN is configured, use CDN URLs
  if (cdnBaseUrl) {
    const cdnUrl = getCdnAssetUrl(path);
    const fallbackUrl = getCdnAssetUrl(fallbackPath);
    return {
      cdnUrl,
      fallbackUrl: fallbackUrl || fallbackPath,
    };
  }

  // If CDN is not configured, handle base URL for GitHub Pages
  // This ensures GitHub Pages base path (/xktradingfloor/) is properly prepended
  const baseUrl = import.meta.env.BASE_URL || "/";
  const normalizePath = (p) => {
    if (!p) return p;
    if (p.startsWith("http://") || p.startsWith("https://")) return p;
    if (p.startsWith(baseUrl)) return p;
    if (p.startsWith("/")) {
      const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
      return `${normalizedBase}${p.slice(1)}`;
    }
    return p;
  };

  return {
    cdnUrl: normalizePath(path),
    fallbackUrl: normalizePath(fallbackPath),
  };
};

/**
 * Check if an asset URL is a CDN URL
 *
 * @param {string} url - URL to check
 * @returns {boolean} - True if URL is from CDN
 */
export const isCdnUrl = (url) => {
  if (!url) return false;
  const cdnBaseUrl = getCdnBaseUrl();
  if (!cdnBaseUrl) return false;
  return url.startsWith(cdnBaseUrl);
};

/**
 * Get optimized image URL with responsive parameters
 * Supports Cloudflare Image Resizing if available
 *
 * @param {string} path - Image path
 * @param {Object} options - Image optimization options
 * @param {number} options.width - Desired width
 * @param {number} options.height - Desired height
 * @param {string} options.format - Image format (webp, avif, etc.)
 * @param {number} options.quality - Image quality (1-100)
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (path, options = {}) => {
  const { width, height, format = "webp", quality = 85 } = options;
  const baseUrl = getCdnAssetUrl(path);

  // If no CDN configured, return original path
  if (!getCdnBaseUrl()) {
    return baseUrl;
  }

  // Cloudflare Image Resizing URL parameters
  // Format: /cdn-cgi/image/{options}/{path}
  const params = [];

  if (width) params.push(`width=${width}`);
  if (height) params.push(`height=${height}`);
  if (format) params.push(`format=${format}`);
  if (quality) params.push(`quality=${quality}`);

  if (params.length > 0) {
    const optionsString = params.join(",");
    // Insert Cloudflare image resizing path
    const url = new URL(baseUrl);
    url.pathname = `/cdn-cgi/image/${optionsString}${url.pathname}`;
    return url.toString();
  }

  return baseUrl;
};

/**
 * Preload an asset from CDN
 * Useful for critical assets like logos, hero images
 *
 * @param {string} path - Asset path
 * @param {string} as - Resource type (image, script, style, etc.)
 * @returns {Promise<void>}
 */
export const preloadCdnAsset = (path, as = "image") => {
  return new Promise((resolve, reject) => {
    const url = getCdnAssetUrl(path);

    if (as === "image") {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to preload image: ${url}`));
      img.src = url;
    } else {
      // For other resource types, use link preload
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = as;
      link.href = url;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to preload ${as}: ${url}`));
      document.head.appendChild(link);
    }
  });
};

/**
 * Batch preload multiple assets
 *
 * @param {Array<{path: string, as?: string}>} assets - Array of asset configs
 * @returns {Promise<void[]>}
 */
export const preloadCdnAssets = async (assets) => {
  const promises = assets.map(({ path, as = "image" }) =>
    preloadCdnAsset(path, as)
  );
  return Promise.allSettled(promises);
};
