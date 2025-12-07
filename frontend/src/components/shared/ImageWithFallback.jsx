import React from "react";
import { getAssetPath } from "../../utils/assets.js";
import { getCdnAssetUrl, getCdnAssetWithFallback } from "../../utils/cdn.js";

/**
 * Generate a dynamic fallback image with text (blog title or company name)
 * Creates a data URL with gradient background and text overlay matching website theme
 */
function generateTextImage(text, width = 800, height = 400, usePlaceholderBg = false) {
  return new Promise((resolve) => {
    // Create a canvas element
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // Function to draw the gradient background and text
    const drawImage = () => {
      // Create sophisticated gradient matching website theme (blue to purple)
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#0f172a"); // slate-900 (dark)
      gradient.addColorStop(0.3, "#1e3a8a"); // blue-800
      gradient.addColorStop(0.6, "#3b82f6"); // blue-500
      gradient.addColorStop(0.8, "#6366f1"); // indigo-500
      gradient.addColorStop(1, "#8b5cf6"); // purple-500
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Add subtle overlay pattern for depth
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * width,
          Math.random() * height,
          Math.random() * 100 + 50,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // Text styling with better typography - ensure font is loaded
      ctx.fillStyle = "#ffffff";
      // Use a more reliable font stack
      ctx.font = "bold 40px Arial, 'Helvetica Neue', Helvetica, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Word wrap text with better line breaking
      const words = text ? text.split(" ").filter(w => w.length > 0) : [""];
      const lines = [];
      
      if (words.length === 0) {
        words.push("No Title");
      }
      
      let currentLine = words[0] || "No Title";
      const maxWidth = width - 100; // Padding on both sides

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine + " " + word;
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }

      // Limit to 3 lines max for readability
      if (lines.length > 3) {
        lines.splice(3);
        lines[2] = lines[2].substring(0, lines[2].length - 3) + "...";
      }

      // Draw text lines with better spacing and visibility
      const lineHeight = 48;
      const totalHeight = (lines.length - 1) * lineHeight;
      const startY = (height - totalHeight) / 2;
      
      // Ensure text is visible - draw with stroke outline for better contrast
      lines.forEach((line, index) => {
        const x = width / 2;
        const y = startY + index * lineHeight;
        
        // Draw black outline/stroke for contrast
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 8;
        ctx.lineJoin = "round";
        ctx.miterLimit = 2;
        ctx.strokeText(line, x, y);
        
        // Draw white fill text on top
        ctx.fillStyle = "#ffffff";
        ctx.fillText(line, x, y);
      });

      // Reset shadow
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      resolve(canvas.toDataURL("image/png"));
    };

    // If using placeholder background, load it first
    if (usePlaceholderBg) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        // Draw placeholder as background with overlay
        ctx.drawImage(img, 0, 0, width, height);
        
        // Add dark overlay for text readability
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 0, width, height);
        
        // Then draw gradient on top with transparency
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, "rgba(30, 58, 138, 0.7)"); // blue-800
        gradient.addColorStop(0.5, "rgba(59, 130, 246, 0.6)"); // blue-500
        gradient.addColorStop(1, "rgba(139, 92, 246, 0.7)"); // purple-500
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Now draw text
        ctx.fillStyle = "#ffffff";
        // Use a more reliable font stack
        ctx.font = "bold 40px Arial, 'Helvetica Neue', Helvetica, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const words = text ? text.split(" ").filter(w => w.length > 0) : [""];
        const lines = [];
        
        if (words.length === 0) {
          words.push("No Title");
        }
        
        let currentLine = words[0] || "No Title";
        const maxWidth = width - 100;

        for (let i = 1; i < words.length; i++) {
          const word = words[i];
          const testLine = currentLine + " " + word;
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && currentLine.length > 0) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) lines.push(currentLine);
        if (lines.length > 3) {
          lines.splice(3);
          lines[2] = lines[2].substring(0, lines[2].length - 3) + "...";
        }

        const lineHeight = 48;
        const totalHeight = (lines.length - 1) * lineHeight;
        const startY = (height - totalHeight) / 2;
        
        // Ensure text is visible - draw with stroke outline for better contrast
        lines.forEach((line, index) => {
          const x = width / 2;
          const y = startY + index * lineHeight;
          
          // Draw black outline/stroke for contrast
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 8;
          ctx.lineJoin = "round";
          ctx.miterLimit = 2;
          ctx.strokeText(line, x, y);
          
          // Draw white fill text on top
          ctx.fillStyle = "#ffffff";
          ctx.fillText(line, x, y);
        });

        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => {
        // If placeholder fails to load, use gradient only
        drawImage();
      };
      // Try to load placeholder from assets
      img.src = getAssetPath("/assets/placeholder.jpg");
    } else {
      // Use gradient only
      drawImage();
    }
  });
}

/**
 * ImageWithFallback - A reusable image component with fallback handling
 *
 * @param {string} src - Primary image source path
 * @param {string} fallback - Fallback image path (defaults to /assets/placeholder.jpg)
 * @param {string} alt - Alt text for accessibility (used for dynamic fallback if provided)
 * @param {string} className - Additional CSS classes
 * @param {boolean} useDynamicFallback - If true, generates dynamic image with alt text
 * @param {object} ...props - Other img element props
 */

export default function ImageWithFallback({
  src,
  fallback = "/assets/placeholder.jpg",
  alt = "",
  className = "",
  useDynamicFallback = false,
  useCdn = true, // Enable CDN by default
  ...props
}) {
  // Get CDN URLs with fallback
  const { cdnUrl, fallbackUrl } = React.useMemo(() => {
    if (useCdn && src) {
      return getCdnAssetWithFallback(src, fallback);
    }
    return {
      cdnUrl: getAssetPath(src),
      fallbackUrl: getAssetPath(fallback),
    };
  }, [src, fallback, useCdn]);

  const [imgSrc, setImgSrc] = React.useState(cdnUrl || null);
  const [hasError, setHasError] = React.useState(false);
  const [dynamicFallback, setDynamicFallback] = React.useState(null);
  const [errorCount, setErrorCount] = React.useState(0);

  React.useEffect(() => {
    // Generate dynamic fallback if alt text is provided and useDynamicFallback is true
    if (useDynamicFallback && alt && typeof window !== "undefined") {
      // Use placeholder as background for better visual appeal
      generateTextImage(alt, 800, 400, true)
        .then((dynamicImg) => {
          setDynamicFallback(dynamicImg);
          // If no src provided, use dynamic fallback immediately
          if (!src) {
            setImgSrc(dynamicImg);
          }
        })
        .catch((error) => {
          console.warn("Failed to generate dynamic fallback image:", error);
          // Fallback to gradient-only version
          generateTextImage(alt, 800, 400, false)
            .then((dynamicImg) => {
              setDynamicFallback(dynamicImg);
              // If no src provided, use dynamic fallback immediately
              if (!src) {
                setImgSrc(dynamicImg);
              }
            })
            .catch(() => {
              setDynamicFallback(null);
              if (!src) {
                setImgSrc(fallbackUrl);
              }
            });
        });
    }
    
    // Set image source if src is provided
    if (src) {
      setImgSrc(cdnUrl);
      setHasError(false);
      setErrorCount(0);
    }
  }, [src, alt, useDynamicFallback, cdnUrl, fallbackUrl]);

  const handleError = () => {
    // Prevent infinite error loops
    if (errorCount >= 2) {
      return;
    }

    setErrorCount((prev) => prev + 1);
    setHasError(true);

    // Fallback chain: CDN -> Local -> Dynamic -> Static placeholder
    if (errorCount === 0 && useCdn && imgSrc === cdnUrl) {
      // First error: try local fallback
      setImgSrc(fallbackUrl);
    } else if (useDynamicFallback && dynamicFallback) {
      // Second error: use dynamic fallback if available
      setImgSrc(dynamicFallback);
    } else {
      // Final fallback: static placeholder
      setImgSrc(fallbackUrl);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}
