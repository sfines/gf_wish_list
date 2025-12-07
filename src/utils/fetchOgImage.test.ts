import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchOgImage } from "./fetchOgImage";

// Mock the global fetch function
global.fetch = vi.fn();

describe("fetchOgImage", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should return an array of image URLs for an Amazon URL", async () => {
    const mockAmazonUrl = "https://www.amazon.com/dp/B08C1K352D";
    const mockApiResponse = {
      status: "success",
      images: [
        "https://m.media-amazon.com/images/I/71jG+e7-eSL._AC_SL1500_.jpg",
        "https://m.media-amazon.com/images/I/81j+e7-eSL._AC_SL1500_.jpg",
      ],
    };

    (fetch as vi.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    const images = await fetchOgImage(mockAmazonUrl);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("realtime-amazon-data.p.rapidapi.com"),
      expect.any(Object)
    );
    expect(images).toEqual([
      "https://m.media-amazon.com/images/I/71jG+e7-eSL._AC_SL1500_.jpg",
      "https://m.media-amazon.com/images/I/81j+e7-eSL._AC_SL1500_.jpg",
    ]);
  });

  it("should return an array of image URLs from OG meta tags", async () => {
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

    (fetch as vi.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockHtml),
    });

    const images = await fetchOgImage(mockUrl);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("corsproxy.io"),
      expect.any(Object)
    );
    expect(images).toEqual([
      "https://example.com/image1.jpg",
      "https://example.com/image2.png",
    ]);
  });

  it("should return a single image URL in an array if only one is found", async () => {
    const mockUrl = "https://singleimage.com";
    const mockHtml = `
      <html>
        <head>
          <meta property="og:image" content="https://singleimage.com/image.gif" />
        </head>
        <body></body>
      </html>
    `;

    (fetch as vi.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockHtml),
    });

    const images = await fetchOgImage(mockUrl);
    expect(images).toEqual(["https://singleimage.com/image.gif"]);
  });

  it("should return null if no images are found", async () => {
    const mockUrl = "https://noimages.com";
    const mockHtml = `<html><head></head><body></body></html>`;

    (fetch as vi.Mock).mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockHtml),
    });

    const images = await fetchOgImage(mockUrl);
    expect(images).toBeNull();
  });

  it("should return null if the fetch fails", async () => {
    const mockUrl = "https://fails.com";
    (fetch as vi.Mock).mockRejectedValue(new Error("Network error"));

    const images = await fetchOgImage(mockUrl);
    expect(images).toBeNull();
  });
});
