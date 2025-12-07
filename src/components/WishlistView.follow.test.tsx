import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WishlistView } from "./WishlistView";
import { vi } from "vitest";
import * as api from "../utils/api";

vi.mock("../utils/api", () => ({
  followWishlist: vi.fn(),
  unfollowWishlist: vi.fn(),
  getFollowingStatus: vi.fn(),
  // Mock other functions if needed by the component
  updateItemImage: vi.fn(),
  addItem: vi.fn(),
  deleteItem: vi.fn(),
  deleteWishlist: vi.fn(),
  updateItemClaimed: vi.fn(),
  updateItem: vi.fn(),
  updateWishlist: vi.fn(),
}));

const mockWishlist = {
  id: "1",
  name: "Alice's Wishlist",
  description: "A public wishlist",
  shareToken: "xyz",
  items: [],
  createdAt: new Date().toISOString(),
};

describe("WishlistView Follow/Unfollow", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("shows Follow button for a non-owned wishlist and can follow", async () => {
    (api.getFollowingStatus as vi.Mock).mockResolvedValue({
      is_following: false,
    });
    (api.followWishlist as vi.Mock).mockResolvedValue({});

    render(
      <WishlistView
        wishlist={mockWishlist}
        accessToken="test-token"
        isOwner={false}
        onBack={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Follow")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Follow"));

    await waitFor(() => {
      expect(api.followWishlist).toHaveBeenCalledWith("test-token", "1");
    });

    await waitFor(() => {
      expect(screen.getByText("Unfollow")).toBeInTheDocument();
    });
  });

  it("shows Unfollow button for a followed wishlist and can unfollow", async () => {
    (api.getFollowingStatus as vi.Mock).mockResolvedValue({
      is_following: true,
    });
    (api.unfollowWishlist as vi.Mock).mockResolvedValue({});

    render(
      <WishlistView
        wishlist={mockWishlist}
        accessToken="test-token"
        isOwner={false}
        onBack={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Unfollow")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Unfollow"));

    await waitFor(() => {
      expect(api.unfollowWishlist).toHaveBeenCalledWith("test-token", "1");
    });

    await waitFor(() => {
      expect(screen.getByText("Follow")).toBeInTheDocument();
    });
  });

  it("does not show follow/unfollow buttons for an owned wishlist", async () => {
    render(
      <WishlistView
        wishlist={mockWishlist}
        accessToken="test-token"
        isOwner={true}
        onBack={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.queryByText("Follow")).not.toBeInTheDocument();
      expect(screen.queryByText("Unfollow")).not.toBeInTheDocument();
    });
  });
});
