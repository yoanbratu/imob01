/**
 * Utility functions for handling YouTube URLs, video IDs, and responsive embeds.
 * Supports:
 * - standard links: https://www.youtube.com/watch?v=VIDEO_ID
 * - short links: https://youtu.be/VIDEO_ID
 * - embed links: https://www.youtube.com/embed/VIDEO_ID
 * - shorts links: https://www.youtube.com/shorts/VIDEO_ID
 * - raw 11-char ID
 */

export function extractYouTubeId(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Raw 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Common YouTube URL regex
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regExp);
  return match && match[1] ? match[1] : null;
}

export function getYouTubeEmbedUrl(url?: string | null): string | null {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=0`;
}

export function getYouTubeThumbnailUrl(url?: string | null): string | null {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function isValidYouTubeUrl(url?: string | null): boolean {
  return !!extractYouTubeId(url);
}
