const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
];

export async function fetchOgImage(url: string): Promise<string | null> {
  if (!url) return null;

  for (const proxy of CORS_PROXIES) {
    try {
      const response = await fetch(proxy + encodeURIComponent(url), {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) continue;

      const html = await response.text();

      // Try og:image
      const ogImageMatch =
        html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i);

      if (ogImageMatch?.[1]) {
        return resolveImageUrl(ogImageMatch[1], url);
      }

      // Fallback to twitter:image
      const twitterMatch =
        html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["'][^>]*>/i);

      if (twitterMatch?.[1]) {
        return resolveImageUrl(twitterMatch[1], url);
      }

      return null;
    } catch (error) {
      console.warn(`Proxy ${proxy} failed:`, error);
      continue;
    }
  }

  return null;
}

function resolveImageUrl(imageUrl: string, baseUrl: string): string {
  if (imageUrl.startsWith('//')) {
    return 'https:' + imageUrl;
  }
  if (imageUrl.startsWith('/')) {
    const urlObj = new URL(baseUrl);
    return urlObj.origin + imageUrl;
  }
  if (!imageUrl.startsWith('http')) {
    const urlObj = new URL(baseUrl);
    return urlObj.origin + '/' + imageUrl;
  }
  return imageUrl;
}
