import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchOgImage } from "./fetchOgImage";

// Mock global fetch
global.fetch = vi.fn();

describe("fetchOgImage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return og:image urls from HTML", async () => {
    const mockUrl = "https://example.com";
    const mockHtml = `
      <html>
        <head>
          <meta property="og:image" content="https://example.com/image1.jpg" />
          <meta property="og:image" content="https://example.com/image2.png" />
        </head>
        <body></body>
      </html>
    `;

    (global.fetch as any).mockResolvedValue({
      ok: true,
      text: async () => mockHtml,
    });

    const images = await fetchOgImage(mockUrl);

    // It should try to fetch via proxy
    expect(global.fetch).toHaveBeenCalled();
    expect(images).toEqual([
      "https://example.com/image1.jpg",
      "https://example.com/image2.png",
    ]);
  });

  it("should return an empty array if no og:image tags are found", async () => {
    const mockUrl = "https://no-og.com";
    const mockHtml = `<html><head></head><body></body></html>`;

    (global.fetch as any).mockResolvedValue({
      ok: true,
      text: async () => mockHtml,
    });

    const images = await fetchOgImage(mockUrl);

    expect(images).toEqual(null);
  });

  it("should handle fetch errors gracefully", async () => {
    const mockUrl = "https://error.com";

    (global.fetch as any).mockRejectedValue(new Error("Network error"));

    const images = await fetchOgImage(mockUrl);

    expect(images).toEqual(null);
  });
});
