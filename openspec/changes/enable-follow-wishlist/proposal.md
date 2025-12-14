# Proposal: Enable Follow Wishlist

## Goal
Enable users to discover, follow, and manage wishlists created by other users, enhancing the social aspect of the application.

## Summary
This feature introduces a "Followed Wishlists" section to the main dashboard and a "Find Wishlist" dialog. Users will be able to:
- View a list of wishlists they follow.
- Unfollow wishlists directly from the dashboard.
- Search for wishlists to follow using a share URL, a specific list token, or by searching for a user's name.

## Motivation
Currently, users can only view shared wishlists if they have the direct link, and there is no persistent "following" state in the UI other than what might be internally stored but not fully exposed in a management view. This feature closes the loop on social interaction by making followed list management explicit and accessible.

## Key Changes
1.  **Dashboard Update**: Add a "Following" section to `WishlistDashboard`.
2.  **New Dialog**: `FindWishlistDialog` for searching/adding wishlists.
3.  **API Enhancements**: Support searching for public wishlists by user name.
