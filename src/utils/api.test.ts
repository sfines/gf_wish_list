import { describe, it, expect, vi, afterEach } from "vitest";
import { supabase } from "./supabase-client";
import { addItem, updateItemImage } from "./api";
import { fetchOgImage } from "./fetchOgImage";

vi.mock("./supabase-client", () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    rpc: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn(),
  },
}));

vi.mock("./fetchOgImage", () => ({
  fetchOgImage: vi.fn(),
}));

describe("api", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("addItem", () => {
    it("should add an item and return it", async () => {
      const mockItem = {
        id: "item-456",
        title: "Test Item",
        url: "https://example.com",
        wishlist_id: "wishlist-123",
        image_url: "https://example.com/image.jpg",
        image_urls: ["https://example.com/image.jpg"],
      };
      const itemData = {
        url: "https://example.com",
        wishlist_id: "wishlist-123",
        title: "Test Item",
      };

      (fetchOgImage as vi.Mock).mockResolvedValue([
        "https://example.com/image.jpg",
      ]);
      (supabase.from("items").insert as vi.Mock).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockItem, error: null }),
      });

      const result = await addItem(itemData);

      expect(fetchOgImage).toHaveBeenCalledWith(itemData.url);
      expect(supabase.from).toHaveBeenCalledWith("items");
      expect(supabase.from("items").insert).toHaveBeenCalledWith([
        {
          ...itemData,
          image_url: "https://example.com/image.jpg",
          image_urls: ["https://example.com/image.jpg"],
        },
      ]);
      expect(result).toEqual(mockItem);
    });
  });

  describe("updateItemImage", () => {
    it("should call the update_item_image RPC function", async () => {
      const itemId = "item-789";
      const wishlistId = "wishlist-123";
      const newImageUrl = "https://example.com/new-image.jpg";

      (supabase.rpc as vi.Mock).mockResolvedValue({ error: null });

      await updateItemImage(itemId, wishlistId, newImageUrl);

      expect(supabase.rpc).toHaveBeenCalledWith("update_item_image", {
        p_item_id: itemId,
        p_wishlist_id: wishlistId,
        p_new_image_url: newImageUrl,
      });
    });
  });
});
