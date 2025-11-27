import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a8f4bfaf`;

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
  const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(item),
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
  const response = await fetch(`${API_BASE_URL}/wishlists/${wishlistId}/items/${itemId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(updates),
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