import { fetchOgImage } from './fetchOgImage';
import { projectId as prodProjectId, publicAnonKey as prodAnonKey } from './supabase/info';

const isLocal = typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1");

const publicAnonKey = isLocal
  ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
  : prodAnonKey;

const API_BASE_URL = isLocal
    ? "http://127.0.0.1:54321/functions/v1/server"
    : `https://${prodProjectId}.supabase.co/functions/v1/server`;

export async function signUp(email: string, password: string, name: string) {
  const response = await fetch(`${API_BASE_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({ email, password, name }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to sign up');
  }
  return data;
}

export async function createWishlist(accessToken: string, name: string, description?: string) {
  const response = await fetch(`${API_BASE_URL}/wishlists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ name, description }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to create wishlist');
  }
  return data;
}

export async function getWishlists(accessToken: string) {
  const response = await fetch(`${API_BASE_URL}/wishlists`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401) {
    throw new Error("Unauthorized");
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch wishlists');
  }
  return data;
}

export async function getWishlist(accessToken: string, id: string) {
  const response = await fetch(`${API_BASE_URL}/wishlists/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch wishlist');
  }
  return data;
}

export async function getSharedWishlist(shareToken: string) {
  const response = await fetch(`${API_BASE_URL}/wishlists/shared/${shareToken}`, {
    headers: {
      Authorization: `Bearer ${publicAnonKey}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch wishlist');
  }
  return data;
}

export async function addItem(
  accessToken: string,
  wishlistId: string,
  item: { url?: string; description?: string; title?: string }
) {
  console.log('[addItem] Called with item:', item);
  
  // Fetch OG image client-side before sending to API
  let ogImageUrl = '';
  let image_urls: string[] = [];

  if (item.url) {
    console.log('[addItem] Fetching OG image for URL:', item.url);
    try {
      const images = await fetchOgImage(item.url);
      if (images && images.length > 0) {
        image_urls = images;
        ogImageUrl = images[0];
      }
      console.log('[addItem] Got ogImageUrl:', ogImageUrl);
    } catch (error) {
      console.warn('[addItem] Failed to fetch OG image:', error);
    }
  } else {
    console.log('[addItem] No URL provided, skipping OG image fetch');
  }

  const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ ...item, ogImageUrl, image_urls }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to add item');
  }
  return data;
}

export async function deleteItem(accessToken: string, wishlistId: string, itemId: string) {
  const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/items/${itemId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete item');
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
  let image_urls: string[] | undefined;

  if (updates.url) {
    try {
      const images = await fetchOgImage(updates.url);
      if (images && images.length > 0) {
        image_urls = images;
        ogImageUrl = images[0];
      } else {
        ogImageUrl = '';
        image_urls = [];
      }
    } catch (error) {
      console.warn('Failed to fetch OG image:', error);
      ogImageUrl = '';
      image_urls = [];
    }
  }

  const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/items/${itemId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ ...updates, ogImageUrl, image_urls }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to update item');
  }
  return data;
}

export async function updateItemClaimed(wishlistId: string, itemId: string, claimed: boolean) {
  const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/items/${itemId}/claim`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({ claimed }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to update item');
  }
  return data;
}

export async function deleteWishlist(accessToken: string, wishlistId: string) {
  const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete wishlist');
  }
  return data;
}

export async function updateWishlist(
  accessToken: string,
  wishlistId: string,
  updates: { name?: string; description?: string }
) {
  const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(updates),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to update wishlist');
  }
  return data;
}

export async function followWishlist(accessToken: string, wishlistId: string) {
  const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/follow`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to follow wishlist');
  return data;
}

export async function unfollowWishlist(accessToken: string, wishlistId: string) {
  const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/follow`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to unfollow wishlist');
  return data;
}

export async function getFollowingStatus(accessToken: string, wishlistId: string) {
  const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/follow`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to get following status');
  return data;
}

export async function updateItemImage(accessToken: string, itemId: string, wishlistId: string, imageUrl: string) {
  const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/items/${itemId}/image`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ imageUrl }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to update item image');
  return data;
}
