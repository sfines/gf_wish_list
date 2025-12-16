# Data Model

## Schema: `public`

### Entity Relationship Diagram
```mermaid
erDiagram
    auth_users ||--o{ wishlists : "owns"
    auth_users ||--o{ wishlist_followers : "follows"
    wishlists ||--o{ items : "contains"
    wishlists ||--o{ wishlist_followers : "has followers"

    auth_users {
        uuid id PK
        string email
    }

    wishlists {
        uuid id PK
        uuid user_id FK "References auth.users.id"
        string name
        string description
        string share_token "Unique token for sharing"
        string owner_name "Denormalized owner name"
        timestamp created_at
    }

    items {
        uuid id PK
        uuid wishlist_id FK "References wishlists.id"
        string title
        string url
        string description
        boolean claimed
        string image_url
        jsonb image_urls
        timestamp created_at
    }

    wishlist_followers {
        uuid id PK
        uuid wishlist_id FK "References wishlists.id"
        uuid user_id FK "References auth.users.id"
        timestamp created_at
    }
```

### Tables

#### `wishlists`
Stores user wishlists.
- **`owner_name`**: Added to support search by owner without complex joins. Populated on creation.
- **`share_token`**: Used for public sharing links.

#### `items`
Items saved to a wishlist.
- **`image_urls`**: Array of potential images for selection.
- **`image_url`**: The currently selected image.

#### `wishlist_followers`
Join table for users following wishlists.
- **`user_id`**: The follower.
- **`wishlist_id`**: The followed wishlist.
