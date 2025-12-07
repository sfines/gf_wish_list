import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { addItem, updateItemImage, deleteItem, updateItem } from "./api";
import { fetchOgImage } from "./fetchOgImage";

// Mock global fetch
global.fetch = vi.fn();

// Mock fetchOgImage
vi.mock("./fetchOgImage", () => ({
  fetchOgImage: vi.fn(),
}));

describe("api", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Default mock implementation for fetchOgImage
    (fetchOgImage as any).mockResolvedValue([]);
  });

  describe("addItem", () => {
    it("should add an item and return it", async () => {
      const accessToken = "test-token";
      const wishlistId = "wishlist-123";
      const itemData = {
        title: "Test Item",
        description: "A cool item",
        url: "https://example.com",
      };
      const mockResponse = {
        id: "item-456",
        ...itemData,
        wishlist_id: wishlistId,
        claimed: false,
        image_url: null,
      };

      // Mock fetchOgImage to return a specific URL for this test
      (fetchOgImage as any).mockResolvedValue(["https://example.com/og.png"]);

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await addItem(accessToken, wishlistId, itemData);

      expect(fetchOgImage).toHaveBeenCalledWith("https://example.com");

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/wishlists/${wishlistId}/items`),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: `Bearer ${accessToken}`,
          }),
          body: expect.stringContaining(JSON.stringify(itemData).slice(1, -1)), // Partial match
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateItemImage", () => {
    it("should update the item's image_url", async () => {
      const accessToken = "test-token";
      const wishlistId = "wishlist-123";
      const itemId = "item-789";
      const newImageUrl = "https://example.com/new-image.jpg";
      const mockResponse = { wishlist: { id: wishlistId } };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await updateItemImage(accessToken, itemId, wishlistId, newImageUrl);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          `/wishlists/${wishlistId}/items/${itemId}/image`
        ),
        expect.objectContaining({
          method: "PATCH",
          headers: expect.objectContaining({
            Authorization: `Bearer ${accessToken}`,
          }),
          body: JSON.stringify({ imageUrl: newImageUrl }),
        })
      );
    });
  });

  describe("deleteItem", () => {
    it("should delete the specified item", async () => {
      const accessToken = "test-token";
      const wishlistId = "wishlist-123";
      const itemId = "item-to-delete";

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      await deleteItem(accessToken, wishlistId, itemId);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/wishlists/${wishlistId}/items/${itemId}`),
        expect.objectContaining({
          method: "DELETE",
          headers: expect.objectContaining({
            Authorization: `Bearer ${accessToken}`,
          }),
        })
      );
    });
  });

  describe("updateItem", () => {
    it("should update an item and return it", async () => {
      const accessToken = "test-token";
      const wishlistId = "wishlist-123";
      const itemId = "item-to-update";
      const itemData = {
        title: "Updated Title",
        description: "Updated Desc",
        url: "https://new.example.com",
      };
      const mockResponse = { id: itemId, ...itemData };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await updateItem(
        accessToken,
        wishlistId,
        itemId,
        itemData
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/wishlists/${wishlistId}/items/${itemId}`),
        expect.objectContaining({
          method: "PATCH",
          headers: expect.objectContaining({
            Authorization: `Bearer ${accessToken}`,
          }),
          body: expect.stringContaining(JSON.stringify(itemData).slice(1, -1)),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
