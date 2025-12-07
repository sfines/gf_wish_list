import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WishlistView } from "./WishlistView";
import { vi } from "vitest";
import * as api from "../utils/api";

vi.mock("../utils/api");

const mockWishlist = {
  id: "1",
  name: "Test Wishlist",
  description: "A test wishlist",
  shareToken: "abc123",
  items: [],
  createdAt: new Date().toISOString(),
};

describe("WishlistView", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders the wishlist details", () => {
    render(
      <WishlistView
        wishlist={mockWishlist}
        isOwner={true}
        onBack={() => {}}
        onUpdate={() => {}}
        onDelete={() => {}}
      />
    );

    expect(screen.getByText("Test Wishlist")).toBeInTheDocument();
    expect(screen.getByText("A test wishlist")).toBeInTheDocument();
  });

  it("allows adding a new item", async () => {
    const onUpdate = vi.fn();
    vi.mocked(api).addItem.mockResolvedValue({
      wishlist: {
        ...mockWishlist,
        items: [
          {
            id: "item-3",
            title: "New Item",
            description: "",
            url: "",
            addedAt: new Date().toISOString(),
            claimed: false,
          },
        ],
      },
    });

    render(
      <WishlistView
        wishlist={mockWishlist}
        isOwner={true}
        accessToken="test-token"
        onBack={() => {}}
        onUpdate={onUpdate}
        onDelete={() => {}}
      />
    );

    fireEvent.click(screen.getByText("Add Item"));

    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "New Item" },
    });
    // Click the submit button inside the dialog
    const addButtons = screen.getAllByText("Add Item");
    fireEvent.click(addButtons[addButtons.length - 1]);

    await waitFor(() => {
      expect(api.addItem).toHaveBeenCalledWith("test-token", "1", {
        title: "New Item",
        description: "",
        url: "",
      });
      expect(onUpdate).toHaveBeenCalled();
    });
  });

  it("allows deleting an item", async () => {
    const onUpdate = vi.fn();
    const wishlistWithItem = {
      ...mockWishlist,
      items: [
        {
          id: "item-1",
          title: "Item 1",
          description: "Description 1",
          url: "https://example.com/item1",
          addedAt: new Date().toISOString(),
          claimed: false,
        },
      ],
    };
    vi.mocked(api).deleteItem.mockResolvedValue(undefined);

    render(
      <WishlistView
        wishlist={wishlistWithItem}
        isOwner={true}
        accessToken="test-token"
        onBack={() => {}}
        onUpdate={onUpdate}
        onDelete={() => {}}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete item" }));
    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() => {
      expect(api.deleteItem).toHaveBeenCalledWith("test-token", "1", "item-1");
      expect(onUpdate).toHaveBeenCalled();
    });
  });

  it("allows claiming an item in a non-owned list", async () => {
    const onUpdate = vi.fn();
    const wishlistWithItem = {
      ...mockWishlist,
      items: [
        {
          id: "item-1",
          title: "Item 1",
          description: "Description 1",
          url: "https://example.com/item1",
          addedAt: new Date().toISOString(),
          claimed: false,
        },
      ],
    };
    vi.mocked(api).updateItemClaimed.mockResolvedValue({
      ...wishlistWithItem.items[0],
      claimed: true,
    });
    vi.mocked(api).getFollowingStatus.mockResolvedValue({
      is_following: false,
    });

    render(
      <WishlistView
        wishlist={wishlistWithItem}
        isOwner={false}
        accessToken="test-token"
        onBack={() => {}}
        onUpdate={onUpdate}
        onDelete={() => {}}
      />
    );

    fireEvent.click(screen.getByText("Mark as Purchased"));

    await waitFor(() => {
      expect(api.updateItemClaimed).toHaveBeenCalledWith("1", "item-1", true);
      expect(onUpdate).toHaveBeenCalled();
    });
  });

  it("does not show claim button for owned list", () => {
    const wishlistWithItem = {
      ...mockWishlist,
      items: [
        {
          id: "item-1",
          title: "Item 1",
          description: "Description 1",
          url: "https://example.com/item1",
          addedAt: new Date().toISOString(),
          claimed: false,
        },
      ],
    };
    render(
      <WishlistView
        wishlist={wishlistWithItem}
        isOwner={true}
        onBack={() => {}}
        onUpdate={() => {}}
        onDelete={() => {}}
      />
    );

    expect(screen.queryByText("Mark as Purchased")).not.toBeInTheDocument();
  });
});
