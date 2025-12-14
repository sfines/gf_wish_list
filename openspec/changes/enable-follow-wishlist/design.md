# Design: Follow Wishlist Feature

## Architecture

### Frontend Components

1.  **`WishlistDashboard` Updates**:
    *   Integrate a new panel/section for "Followed Wishlists".
    *   Display followed wishlists in a scrollable, multi-column grid layouts.
    *   Each card will show:
        *   List Name
        *   Owner Name
        *   "Recent" flag (if updated recently)
        *   Unfollow action (context menu or button).

2.  **`FindWishlistDialog`**:
    *   Structure similar to `WishlistItemDialog` using `Dialog` primitive.
    *   Input field accepting:
        *   Share URL (parse token).
        *   Share Token (direct use).
        *   User Name (search).
    *   Search results area:
        *   Display lists found.
        *   "Follow" button for each result.

### Data & API

1.  **Search API**:
    *   Existing `getSharedWishlist(token)` handles token/URL-token.
    *   **New Requirement**: Need an API to search public wishlists by user name: `searchWishlists(query: string)`.
        *   Input: `query` (string) - name or partial name.
        *   Output: List of public wishlists matching the user.

2.  **State Management**:
    *   Dashboard will need to fetch followed wishlists on load (already partially implemented in `loadWishlists` via `getWishlists` returning `following`).
    *   Need to ensure `following` data includes "owner name" and "last updated" timestamp for the UI.

## UI/UX Patterns

*   **Dialogs**: Replicate the pattern from `WishlistItemDialog` (Header, Body, Footer logic).
*   **Cards**: Consistent styling with `WishlistCard` but with added metadata (Owner).
*   **Responsive**: Dashboard grid adjusts columns based on screen size; Scrolling for overflow.

## Accessibility
*   Dialogs must be accessible (focus management).
*   Search results must be keyboard navigable.
