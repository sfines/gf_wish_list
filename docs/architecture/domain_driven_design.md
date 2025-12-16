# Domain Driven Design

## Domains

### Authentication Domain
Handles user identity and access control.
- **Entities**: User
- **Value Objects**: Email, Password, Session Token

### Wishlist Domain
Core domain for managing wishlists.
- **Entities**: Wishlist, WishlistItem
- **Value Objects**: ShareToken, WishlistID, ItemID
- **Aggregates**: Wishlist (Root) -> WishlistItems

### Search Domain
Handles discovery of wishlists.
- **Value Objects**: SearchQuery, SearchResult

### Social Domain (Follow)
Handles relationships between users and wishlists.
- **Entities**: Follower
- **Value Objects**: FollowStatus

## Bounded Contexts

1. **Identity Context**: Managed by Supabase Auth.
2. **Wishlist Management Context**: CRUD operations for wishlists and items.
3. **Discovery Context**: Searching for wishlists.
4. **Social Context**: Following wishlists.
