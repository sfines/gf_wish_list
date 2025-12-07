import { supabase } from "./supabase-client";
import { fetchOgImage } from "./fetchOgImage";

export async function addItem(item: {
  url?: string;
  description?: string;
  title?: string;
  wishlist_id: string;
}) {
  console.log("[addItem] Called with item:", item);

  let imageUrls: string[] | null = null;
  if (item.url) {
    imageUrls = await fetchOgImage(item.url);
  }

  const { data, error } = await supabase
    .from("items")
    .insert([
      {
        ...item,
        image_url: imageUrls?.[0] ?? null,
        image_urls: imageUrls,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Failed to add item");
  }
  return data;
}

export async function updateItemImage(
  itemId: string,
  wishlistId: string,
  newImageUrl: string
) {
  const { error } = await supabase.rpc("update_item_image", {
    p_item_id: itemId,
    p_wishlist_id: wishlistId,
    p_new_image_url: newImageUrl,
  });

  if (error) {
    throw new Error(error.message || "Failed to update item image");
  }
}

export async function deleteItem(
  accessToken: string,
  wishlistId: string,
  itemId: string
) {
  const response = await fetch(
    `${API_BASE_URL}/wishlists/${wishlistId}/items/${itemId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to delete item");
  }
  return data;
}

export async function updateItem(
  accessToken: string,
  wishlistId: string,
  itemId: string,
  updates: { title?: string; url?: string; description?: string }
) {
  // Fetch OG image client-side if URL changed
  let ogImageUrl: string | undefined;
  if (updates.url) {
    try {
      ogImageUrl = (await fetchOgImage(updates.url)) || "";
    } catch (error) {
      console.warn("Failed to fetch OG image:", error);
      ogImageUrl = "";
    }
  }

  const response = await fetch(
    `${API_BASE_URL}/wishlists/${wishlistId}/items/${itemId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ ...updates, ogImageUrl }),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to update item");
  }
  return data;
}

export async function updateItemClaimed(
  wishlistId: string,
  itemId: string,
  claimed: boolean
) {
  const response = await fetch(
    `${API_BASE_URL}/wishlists/${wishlistId}/items/${itemId}/claim`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ claimed }),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to update item");
  }
  return data;
}

export async function deleteWishlist(accessToken: string, wishlistId: string) {
  const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to delete wishlist");
  }
  return data;
}

export async function updateWishlist(
  accessToken: string,
  wishlistId: string,
  updates: { name?: string; description?: string }
) {
  const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(updates),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to update wishlist");
  }
  return data;
}

export async function followWishlist(accessToken: string, wishlistId: string) {
  const { error } = await supabase.rpc("follow_wishlist", {
    p_wishlist_id: wishlistId,
  });

  if (error) {
    throw new Error(error.message || "Failed to follow wishlist");
  }
}

export async function unfollowWishlist(accessToken: string, wishlistId: string) {
  const { error } = await supabase.rpc("unfollow_wishlist", {
    p_wishlist_id: wishlistId,
  });

  if (error) {
    throw new Error(error.message || "Failed to unfollow wishlist");
  }
}

export async function getFollowingStatus(
  accessToken: string,
  wishlistId: string
) {
  const { data, error } = await supabase.rpc("get_following_status", {
    p_wishlist_id: wishlistId,
  });

  if (error) {
    throw new Error(error.message || "Failed to get following status");
  }
  return data;
}

export async function getWishlists(accessToken: string) {
  const { data, error } = await supabase.rpc("get_all_wishlists");

  if (error) {
    throw new Error(error.message || "Failed to get wishlists");
  }
  return data;
}
