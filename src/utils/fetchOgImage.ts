const RAPIDAPI_KEY = "74a189bd12msh0092bcd7329621cp19e95djsnbd37617ee167";

// Extract ASIN from Amazon URL
function extractAmazonAsin(
  url: string
): { asin: string; country: string } | null {
  const amazonPattern =
    /amazon\.(\w+)(?:\/.*)?\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i;
  const match = url.match(amazonPattern);
  if (match) {
    // Map domain to country code
    const domainToCountry: Record<string, string> = {
      com: "us",
      "co.uk": "uk",
      de: "de",
      fr: "fr",
      es: "es",
      it: "it",
      ca: "ca",
      "com.au": "au",
      "co.jp": "jp",
    };
    const country = domainToCountry[match[1]] || "us";
    return { asin: match[2], country };
  }
  return null;
}

// Fetch product image from Amazon via RapidAPI
async function fetchAmazonImage(
  asin: string,
  country: string
): Promise<string[] | null> {
  try {
    console.log(
      "[fetchAmazonImage] Fetching for ASIN:",
      asin,
      "country:",
      country
    );
    const response = await fetch(
      `https://realtime-amazon-data.p.rapidapi.com/product-details?asin=${asin}&country=${country}`,
      {
        headers: {
          "x-rapidapi-host": "realtime-amazon-data.p.rapidapi.com",
          "x-rapidapi-key": RAPIDAPI_KEY,
        },
      }
    );

    if (!response.ok) {
      console.warn("[fetchAmazonImage] API error:", response.status);
      return null;
    }

    const data = await response.json();
    console.log(
      "[fetchAmazonImage] Status:",
      data.status,
      "Title:",
      data.title?.slice(0, 50)
    );

    if (data.status === "success" && data.images && data.images.length > 0) {
      // Get larger images by replacing size suffix
      const imageUrls = data.images.map((imageUrl: string) => {
        // Replace _AC_.jpg or similar with larger version _AC_SL1500_.jpg
        return imageUrl.replace(/\._[A-Z]{2}_.*_\./, "._AC_SL1500_.");
      });
      console.log("[fetchAmazonImage] Found images:", imageUrls);
      return imageUrls;
    }

    return null;
  } catch (error) {
    console.warn("[fetchAmazonImage] Error:", error);
    return null;
  }
}

const CORS_PROXIES = [
  "https://corsproxy.io/?",
  "https://api.allorigins.win/raw?url=",
];

export async function fetchOgImage(url: string): Promise<string[] | null> {
  if (!url) return null;

  console.log("[fetchOgImage] Starting fetch for:", url);

  // Check if it's an Amazon URL and use RapidAPI
  const amazonInfo = extractAmazonAsin(url);
  if (amazonInfo) {
    console.log("[fetchOgImage] Detected Amazon URL, using RapidAPI");
    const amazonImages = await fetchAmazonImage(
      amazonInfo.asin,
      amazonInfo.country
    );
    if (amazonImages) {
      return amazonImages;
    }
    console.log("[fetchOgImage] RapidAPI failed, falling back to CORS proxy");
  }

  for (const proxy of CORS_PROXIES) {
    try {
      console.log("[fetchOgImage] Trying proxy:", proxy);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(proxy + encodeURIComponent(url), {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("[fetchOgImage] Response status:", response.status);

      if (!response.ok) continue;

      const html = await response.text();

      // Use DOMParser to find og:image meta tags
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const imageElements = doc.querySelectorAll('meta[property="og:image"]');

      if (imageElements.length > 0) {
        const images = Array.from(imageElements)
          .map((el) => el.getAttribute("content"))
          .filter(Boolean) as string[];
        if (images.length > 0) {
          console.log("[fetchOgImage] Found OG images:", images);
          return images;
        }
      }

      // Fallback for cases where DOMParser might fail or no meta tags are found
      const match = html.match(
        /<meta\s+property="og:image"\s+content="([^"]+)"/
      );
      if (match && match[1]) {
        console.log("[fetchOgImage] Found OG image with regex:", match[1]);
        return [match[1]];
      }
    } catch (error) {
      console.warn(`[fetchOgImage] Proxy ${proxy} failed:`, error);
    }
  }

  console.log("[fetchOgImage] No OG image found for:", url);
  return null;
}
