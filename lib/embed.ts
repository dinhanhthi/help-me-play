export interface ParsedMedia {
  provider: string;
  embedUrl: string;
  type: "video" | "gif" | "image";
}

export function parseMediaUrl(url: string): ParsedMedia {
  // Validate URL protocol to prevent javascript: and data: injection
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { provider: "invalid", embedUrl: "", type: "image" };
    }
  } catch {
    return { provider: "invalid", embedUrl: "", type: "image" };
  }

  // YouTube: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?.*v=)([\w-]+)/,
    /(?:youtu\.be\/)([\w-]+)/,
    /(?:youtube\.com\/shorts\/)([\w-]+)/,
  ];
  for (const pattern of youtubePatterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        provider: "youtube",
        embedUrl: `https://www.youtube.com/embed/${match[1]}`,
        type: "video",
      };
    }
  }

  // Vimeo: vimeo.com/ID
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return {
      provider: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      type: "video",
    };
  }

  // Dailymotion: dailymotion.com/video/ID
  const dailymotionMatch = url.match(/dailymotion\.com\/video\/([\w-]+)/);
  if (dailymotionMatch) {
    return {
      provider: "dailymotion",
      embedUrl: `https://www.dailymotion.com/embed/video/${dailymotionMatch[1]}`,
      type: "video",
    };
  }

  // Giphy: URLs containing giphy.com
  if (url.includes("giphy.com")) {
    const giphyIdMatch = url.match(/giphy\.com\/(?:gifs|media)\/(?:.*-)?(\w+)/);
    const giphyId = giphyIdMatch ? giphyIdMatch[1] : null;
    const embedUrl = giphyId ? `https://media.giphy.com/media/${giphyId}/giphy.gif` : url;
    return {
      provider: "giphy",
      embedUrl,
      type: "gif",
    };
  }

  // Cloudinary: URLs containing res.cloudinary.com
  if (url.includes("res.cloudinary.com")) {
    const type = detectTypeFromExtension(url);
    return {
      provider: "cloudinary",
      embedUrl: url,
      type,
    };
  }

  // Direct URLs: detect type from extension
  return {
    provider: "direct",
    embedUrl: url,
    type: detectTypeFromExtension(url),
  };
}

function detectTypeFromExtension(url: string): "video" | "gif" | "image" {
  // Strip query string and fragment before checking extension
  const pathname = url.split("?")[0].split("#")[0].toLowerCase();

  if (pathname.endsWith(".mp4") || pathname.endsWith(".webm")) {
    return "video";
  }
  if (pathname.endsWith(".gif")) {
    return "gif";
  }
  if (
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".webp")
  ) {
    return "image";
  }

  // Default to video for unknown extensions
  return "video";
}
