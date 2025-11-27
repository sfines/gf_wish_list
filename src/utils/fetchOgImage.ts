const RAPIDAPI_KEY = '74a189bd12msh0092bcd7329621cp19e95djsnbd37617ee167';

// Extract ASIN from Amazon URL
function extractAmazonAsin(url: string): { asin: string; country: string } | null {
  const amazonPattern = /amazon\.(\w+)(?:\/.*)?\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i;
  const match = url.match(amazonPattern);
  if (match) {
    // Map domain to country code
    const domainToCountry: Record<string, string> = {
      'com': 'us',
      'co.uk': 'uk',
      'de': 'de',
      'fr': 'fr',
      'es': 'es',
      'it': 'it',
      'ca': 'ca',
      'com.au': 'au',
      'co.jp': 'jp',
    };
    const country = domainToCountry[match[1]] || 'us';
    return { asin: match[2], country };
  }
  return null;
}

// Fetch product image from Amazon via RapidAPI
async function fetchAmazonImage(asin: string, country: string): Promise<string | null> {
  try {
    console.log('[fetchAmazonImage] Fetching for ASIN:', asin, 'country:', country);
    const response = await fetch(
      `https://realtime-amazon-data.p.rapidapi.com/product-details?asin=${asin}&country=${country}`,
      {
        headers: {
          'x-rapidapi-host': 'realtime-amazon-data.p.rapidapi.com',
          'x-rapidapi-key': RAPIDAPI_KEY,
        },
      }
    );

    if (!response.ok) {
      console.warn('[fetchAmazonImage] API error:', response.status);
      return null;
    }

    const data = await response.json();
    console.log('[fetchAmazonImage] Status:', data.status, 'Title:', data.title?.slice(0, 50));
    
    if (data.status === 'success' && data.images && data.images.length > 0) {
      // Get larger image by replacing size suffix
      let imageUrl = data.images[0];
      // Replace _AC_.jpg or similar with larger version _AC_SL1500_.jpg
      imageUrl = imageUrl.replace(/\._[A-Z]{2}_\./, '._AC_SL500_.');
      console.log('[fetchAmazonImage] Found image:', imageUrl);
      return imageUrl;
    }
    
    return null;
  } catch (error) {
    console.warn('[fetchAmazonImage] Error:', error);
    return null;
  }
}

const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
];

export async function fetchOgImage(url: string): Promise<string | null> {
  if (!url) return null;

  console.log('[fetchOgImage] Starting fetch for:', url);

  // Check if it's an Amazon URL and use RapidAPI
  const amazonInfo = extractAmazonAsin(url);
  if (amazonInfo) {
    console.log('[fetchOgImage] Detected Amazon URL, using RapidAPI');
    const amazonImage = await fetchAmazonImage(amazonInfo.asin, amazonInfo.country);
    if (amazonImage) {
      return amazonImage;
    }
    console.log('[fetchOgImage] RapidAPI failed, falling back to CORS proxy');
  }

  for (const proxy of CORS_PROXIES) {
    try {
      console.log('[fetchOgImage] Trying proxy:', proxy);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(proxy + encodeURIComponent(url), {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('[fetchOgImage] Response status:', response.status);

      if (!response.ok) continue;

      const html = await response.text();
      console.log('[fetchOgImage] HTML length:', html.length);

      // Try og:image
      const ogImageMatch =
        html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i);

      if (ogImageMatch?.[1]) {
        const resolved = resolveImageUrl(ogImageMatch[1], url);
        console.log('[fetchOgImage] Found og:image:', resolved);
        return resolved;
      }

      // Fallback to twitter:image
      const twitterMatch =
        html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) ||
        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["'][^>]*>/i);

      if (twitterMatch?.[1]) {
        const resolved = resolveImageUrl(twitterMatch[1], url);
        console.log('[fetchOgImage] Found twitter:image:', resolved);
        return resolved;
      }

      console.log('[fetchOgImage] No image meta tags found');
      return null;
    } catch (error) {
      console.warn(`[fetchOgImage] Proxy ${proxy} failed:`, error);
      continue;
    }
  }

  console.log('[fetchOgImage] All proxies failed');
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
