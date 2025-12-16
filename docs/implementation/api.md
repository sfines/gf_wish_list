# API Reference

The backend is implemented as Supabase Edge Functions (`src/supabase/functions/server`).
All routes are prefixed with `/functions/v1/server`.

## Wishlists

### `GET /wishlists`
Retrieve the current user's wishlists AND followed wishlists.
**Response**:
```json
{
  "wishlists": [ ... ],
  "following": [ ... ]
}
```

### `POST /wishlists`
Create a new wishlist.
**Body**: `{ "name": "string", "description": "string" }`
**Note**: Automatically populates `owner_name` from user metadata.

### `POST /wishlists/search`
Search for wishlists by owner name or share token.
**Body**: `{ "query": "string" }`
**Response**:
```json
{
  "results": [
    {
      "id": "uuid",
      "name": "string",
      "owner_name": "string",
      "isFollowing": boolean
    }
  ]
}
```

### `POST /wishlists/:id/follow`
Follow a wishlist.

### `DELETE /wishlists/:id/follow`
Unfollow a wishlist.

## Items

### `POST /wishlists/:id/items`
Add an item to a wishlist.
**Body**: `{ "title": "...", "url": "..." }`

### `PATCH /items/:id`
Update an item (e.g. claim status, image).
