import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WishlistView } from "./WishlistView";
import { vi } from "vitest";
import * as api from "../utils/api";
import { Wishlist } from "../utils/api";

vi.mock("../utils/api");

const mockWishlist: Wishlist = {
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
    vi.mocked(api).getSharedWishlist.mockResolvedValue({
      wishlist: mockWishlist,
    });
  });

  it("shows follow button for a shared list that is not followed", async () => {
    vi.mocked(api).getFollowingStatus.mockResolvedValue({
      is_following: false,
    });

    render(
      <WishlistView
        wishlist={mockWishlist}
        isOwner={false}
        accessToken="test-token"
        onBack={() => {}}
        onUpdate={() => {}}
        onDelete={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Follow")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Follow"));

    await waitFor(() => {
      expect(api.followWishlist).toHaveBeenCalledWith(expect.any(String), "1");
    });

    await waitFor(() => {
      expect(screen.getByText("Unfollow")).toBeInTheDocument();
    });
  });

  it("shows unfollow button for a shared list that is already followed", async () => {
    vi.mocked(api).getFollowingStatus.mockResolvedValue({ is_following: true });

    render(
      <WishlistView
        wishlist={mockWishlist}
        isOwner={false}
        accessToken="test-token"
        onBack={() => {}}
        onUpdate={() => {}}
        onDelete={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("Unfollow")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Unfollow"));

    await waitFor(() => {
      expect(api.unfollowWishlist).toHaveBeenCalledWith(
        expect.any(String),
        "1"
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Follow")).toBeInTheDocument();
    });
  });

  it("calls followWishlist when follow button is clicked", async () => {
    vi.mocked(api).getFollowingStatus.mockResolvedValue({
      is_following: false,
    });
    vi.mocked(api).followWishlist.mockResolvedValue({});

    render(
      <WishlistView
        wishlist={mockWishlist}
        isOwner={false}
        accessToken="test-token"
        onBack={() => {}}
        onUpdate={() => {}}
        onDelete={() => {}}
      />
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText("Follow"));
    });

    await waitFor(() => {
      expect(api.followWishlist).toHaveBeenCalledWith(expect.any(String), "1");
    });
  });

  it("calls unfollowWishlist when unfollow button is clicked", async () => {
    vi.mocked(api).getFollowingStatus.mockResolvedValue({ is_following: true });
    vi.mocked(api).unfollowWishlist.mockResolvedValue({});

    render(
      <WishlistView
        wishlist={mockWishlist}
        isOwner={false}
        accessToken="test-token"
        onBack={() => {}}
        onUpdate={() => {}}
        onDelete={() => {}}
      />
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText("Unfollow"));
    });

    await waitFor(() => {
      expect(api.unfollowWishlist).toHaveBeenCalledWith(
        expect.any(String),
        "1"
      );
    });
  });
});
