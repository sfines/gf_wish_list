# Ubiquitous Language

## Glossary

| Term | Definition |
| :--- | :--- |
| **Wishlist** | A collection of items that a user wants. Can be shared via a token. |
| **Wishlist Item** | A single product or entry in a wishlist, containing details like title, URL, image, and description. |
| **Owner** | The user who created and manages the wishlist. |
| **Follower** | A user who has subscribed to another user's wishlist to see it on their dashboard. |
| **Share Token** | A unique string associated with a wishlist that allows others to view it. |
| **Dashboard** | The main view for a logged-in user, showing their wishlists and followed wishlists. |
| **Claim** | The action of marking an item as "purchased" or "reserved" by another user (not the owner). |
| **Public Wishlist** | A wishlist that can be found via search options (currently managed via `owner_name` search). |

## Events

- **WishlistCreated**: Triggered when a new wishlist is created.
- **WishlistFollowed**: Triggered when a user follows a wishlist.
- **WishlistUnfollowed**: Triggered when a user unfollows a wishlist.
- **ItemAdded**: Triggered when an item is added to a wishlist.
