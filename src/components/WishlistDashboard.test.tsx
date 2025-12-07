import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { WishlistDashboard } from "./WishlistDashboard";
import { vi } from "vitest";
import * as api from "../utils/api";

// Mock the API module
vi.mock("../utils/api", () => ({
  getWishlists: vi.fn(),
  createWishlist: vi.fn(),
}));

const mockWishlists = {
  wishlists: [
    {
      id: "1",
      name: "My Birthday",
      description: "Things I want for my birthday",
      shareToken: "abc",
      items: [],
      createdAt: new Date().toISOString(),
    },
  ],
  following: [
    {
      id: "2",
      name: "Alice's Wishlist",
      description: "Alice's public wishlist",
      shareToken: "def",
      items: [{ id: "item-1", title: "A Book" }],
      createdAt: new Date().toISOString(),
    },
  ],
};

describe("WishlistDashboard", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
  });

  it("renders owned and followed wishlists", async () => {
    (api.getWishlists as vi.Mock).mockResolvedValue(mockWishlists);

    render(
      <WishlistDashboard
        accessToken="test-token"
        userName="Test User"
        onLogout={() => {}}
      />
    );

    // Wait for wishlists to load
    await waitFor(() => {
      expect(screen.getByText("My Birthday")).toBeInTheDocument();
    });

    expect(screen.getByText("Following")).toBeInTheDocument();
    expect(screen.getByText("Alice's Wishlist")).toBeInTheDocument();
  });

  it("shows a message when there are no wishlists", async () => {
    (api.getWishlists as vi.Mock).mockResolvedValue({
      wishlists: [],
      following: [],
    });

    render(
      <WishlistDashboard
        accessToken="test-token"
        userName="Test User"
        onLogout={() => {}}
      />
    );

    await waitFor(() => {
      expect(screen.getByText("No wishlists yet")).toBeInTheDocument();
    });
  });

  it("opens the create wishlist dialog", async () => {
    (api.getWishlists as vi.Mock).mockResolvedValue({
      wishlists: [],
      following: [],
    });

    render(
      <WishlistDashboard
        accessToken="test-token"
        userName="Test User"
        onLogout={() => {}}
      />
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText("Create New Wishlist"));
    });

    expect(
      screen.getByText("Give your wishlist a name and optional description")
    ).toBeInTheDocument();
  });

  it("creates a new wishlist", async () => {
    const newWishlist = {
      id: "3",
      name: "New Wishlist",
      description: "",
      shareToken: "ghi",
      items: [],
      createdAt: new Date().toISOString(),
    };

    (api.getWishlists as vi.Mock).mockResolvedValue({
      wishlists: [],
      following: [],
    });
    (api.createWishlist as vi.Mock).mockResolvedValue({ wishlist: newWishlist });

    render(
      <WishlistDashboard
        accessToken="test-token"
        userName="Test User"
        onLogout={() => {}}
      />
    );

    await waitFor(() => {
      fireEvent.click(screen.getByText("Create New Wishlist"));
    });

    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "New Wishlist" },
    });
    fireEvent.click(screen.getByText("Create Wishlist"));

    await waitFor(() => {
      expect(api.createWishlist).toHaveBeenCalledWith(
        "test-token",
        "New Wishlist",
        ""
      );
    });
  });
});
