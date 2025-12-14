---
title: Wishlist Item Image Selection
---

# Wishlist Item Image Selection Specification

## 1. Data Model Changes

The `items` table in the Supabase database will be modified.

### `items` table

| Column Name      | Type        | Description                                                                                   |
| :--------------- | :---------- | :-------------------------------------------------------------------------------------------- |
| `id`             | `uuid`      | Primary key.                                                                                  |
| `wishlist_id`    | `uuid`      | Foreign key to `wishlists` table.                                                             |
| `name`           | `text`      | Name of the item.                                                                             |
| `description`    | `text`      | Description of the item.                                                                      |
| `url`            | `text`      | URL of the item.                                                                              |
| **`image_urls`** | `text[]`    | **NEW:** An array of all found OpenGraph image URLs.                                          |
| **`image_url`**  | `text`      | **RENAMED/REPURPOSED:** The selected image URL to display. Was previously the only image URL. |
| `created_at`     | `timestamp` | Timestamp of creation.                                                                        |

**Migration SQL:**

```sql
-- Add the new image_urls column
ALTER TABLE items
ADD COLUMN image_urls text[];

-- Populate image_urls with the existing image_url for old items
UPDATE items
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL;
```

## 2. Backend Changes

### Supabase Edge Function for Image Fetching

The server-side logic for fetching item images will be updated to handle both Amazon and non-Amazon URLs.

- **For Amazon URLs:**
  - The function will call the `realtime-amazon-data` RapidAPI endpoint.
  - It will parse the API response to extract the array of product images.
- **For other URLs:**
  - It will use a library like `node-html-parser` or `cheerio` to parse the HTML of the provided URL.
  - It will find all `<meta property="og:image" ...>` tags and extract the `content` attribute from each.
- The function will return an array of all found image URLs, regardless of the source.

### New API Endpoint: `update_item_image`

A new RPC function will be created in Supabase.

**`update_item_image(item_id, selected_image_url)`**

- **`item_id` (uuid):** The ID of the item to update.
- **`selected_image_url` (text):** The new image URL selected by the user.

This function will perform an `UPDATE` on the `items` table, setting the `image_url` column to the `selected_image_url` for the given `item_id`. Row Level Security (RLS) policies must ensure that only the owner of the wishlist can update the item.

## 3. Frontend Changes

### `WishlistView.tsx` Component

- This component will receive the `image_urls` array for each item.
- If `image_urls` has more than one entry, it will render the `ImageSelector` component.
- The main image displayed for the item will be the one from the `image_url` field.

### New Component: `ImageSelector.tsx`

- **Props:**
  - `imageUrls: string[]`
  - `selectedImageUrl: string`
  - `onSelect: (url: string) => void`
- This component will render a series of thumbnails for each URL in `imageUrls`.
- The thumbnail corresponding to `selectedImageUrl` will have a visual indicator (e.g., a border).
- When a user clicks a thumbnail, the `onSelect` callback will be triggered with the URL of the clicked thumbnail.

### API Call in `api.ts`

A new function will be added to `src/utils/api.ts` to call the `update_item_image` RPC.

```typescript
// in src/utils/api.ts

export const updateItemImage = async (
  itemId: string,
  selectedImageUrl: string
) => {
  const { data, error } = await supabase.rpc("update_item_image", {
    item_id: itemId,
    selected_image_url: selectedImageUrl,
  });

  if (error) {
    console.error("Error updating item image:", error);
    throw error;
  }

  return data;
};
```
