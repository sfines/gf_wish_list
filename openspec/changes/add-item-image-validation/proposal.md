# Change: Add Item Image Validation

## Why
Users need visual confirmation that images appear correctly on wishlist items, ensuring that OG images are fetched and displayed properly when items are added with URLs.

## What Changes
- Add validation requirements for image display on wishlist items
- Define scenarios for successful image loading, fallback behavior, and items without images

## Impact
- Affected specs: wishlist-items
- Affected code: `src/components/WishlistView.tsx`, `src/components/figma/ImageWithFallback.tsx`
