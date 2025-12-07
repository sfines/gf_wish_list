import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WishlistView } from "./WishlistView";

const mockWishlist = {
  id: "1",
  name: "Test Wishlist",
  description: "A test wishlist",
  shareToken: "abc123",
  createdAt: "2024-01-01T00:00:00Z",
  items: [],
};

const mockOnBack = vi.fn();
const mockOnUpdate = vi.fn();

describe("WishlistView - Item Image Display", () => {
  it("displays image when item has image_url", () => {
    const wishlistWithImage = {
      ...mockWishlist,
      items: [
        {
          id: "item1",
          title: "Test Item",
          url: "https://example.com",
          description: "A test item",
          addedAt: "2024-01-01T00:00:00Z",
          claimed: false,
          image_url: "https://example.com/image.jpg",
        },
      ],
    };

    render(
      <WishlistView
        wishlist={wishlistWithImage}
        isOwner={false}
        onBack={mockOnBack}
        onUpdate={mockOnUpdate}
      />
    );

    const image = screen.getByRole("img", { name: "Test Item" });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "https://example.com/image.jpg");
  });

  it("does not display image container when item has no image_url", () => {
    const wishlistWithoutImage = {
      ...mockWishlist,
      items: [
        {
          id: "item1",
          title: "Test Item",
          url: "https://example.com",
          description: "A test item",
          addedAt: "2024-01-01T00:00:00Z",
          claimed: false,
        },
      ],
    };

    render(
      <WishlistView
        wishlist={wishlistWithoutImage}
        isOwner={false}
        onBack={mockOnBack}
        onUpdate={mockOnUpdate}
      />
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("Test Item")).toBeInTheDocument();
  });

  it("uses item title as alt text when available", () => {
    const wishlistWithImage = {
      ...mockWishlist,
      items: [
        {
          id: "item1",
          title: "My Special Item",
          url: "https://example.com",
          description: "",
          addedAt: "2024-01-01T00:00:00Z",
          claimed: false,
          image_url: "https://example.com/image.jpg",
        },
      ],
    };

    render(
      <WishlistView
        wishlist={wishlistWithImage}
        isOwner={false}
        onBack={mockOnBack}
        onUpdate={mockOnUpdate}
      />
    );

    const image = screen.getByRole("img", { name: "My Special Item" });
    expect(image).toHaveAttribute("alt", "My Special Item");
  });

  it("uses fallback alt text when no title is set", () => {
    const wishlistWithImage = {
      ...mockWishlist,
      items: [
        {
          id: "item1",
          title: "",
          url: "https://example.com",
          description: "A description",
          addedAt: "2024-01-01T00:00:00Z",
          claimed: false,
          image_url: "https://example.com/image.jpg",
        },
      ],
    };

    render(
      <WishlistView
        wishlist={wishlistWithImage}
        isOwner={false}
        onBack={mockOnBack}
        onUpdate={mockOnUpdate}
      />
    );

    const image = screen.getByRole("img", { name: "Item preview" });
    expect(image).toHaveAttribute("alt", "Item preview");
  });

  it("hides image on error and logs to console", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const wishlistWithImage = {
      ...mockWishlist,
      items: [
        {
          id: "item1",
          title: "Test Item",
          url: "https://example.com",
          description: "",
          addedAt: "2024-01-01T00:00:00Z",
          claimed: false,
          image_url: "https://example.com/broken-image.jpg",
        },
      ],
    };

    render(
      <WishlistView
        wishlist={wishlistWithImage}
        isOwner={false}
        onBack={mockOnBack}
        onUpdate={mockOnUpdate}
      />
    );

    const image = screen.getByRole("img", { name: "Test Item" });
    fireEvent.error(image);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to load image:",
      "https://example.com/broken-image.jpg"
    );
    expect(
      screen.queryByRole("img", { name: "Test Item" })
    ).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it("displays title, description, and URL when image is present", () => {
    const wishlistWithImage = {
      ...mockWishlist,
      items: [
        {
          id: "item1",
          title: "Test Item",
          url: "https://example.com",
          description: "Item description",
          addedAt: "2024-01-01T00:00:00Z",
          claimed: false,
          image_url: "https://example.com/image.jpg",
        },
      ],
    };

    render(
      <WishlistView
        wishlist={wishlistWithImage}
        isOwner={false}
        onBack={mockOnBack}
        onUpdate={mockOnUpdate}
      />
    );

    const image = screen.getByRole("img", { name: "Test Item" });
    expect(image).toBeInTheDocument();

    expect(screen.getByText("Test Item")).toBeInTheDocument();
    expect(screen.getByText("Item description")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view product/i })).toHaveAttribute(
      "href",
      "https://example.com"
    );
  });
});
