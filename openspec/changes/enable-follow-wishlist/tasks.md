# Tasks: Enable Follow Wishlist

1.  **API Client Updates**
    - [ ] Add `searchWishlists(query)` to `src/utils/api.ts`.
    - [ ] Ensure `getWishlists` or a new endpoint returns full metadata (owner name, updated_at) for followed lists.

2.  **Components: Find Wishlist Dialog**
    - [ ] Create `src/components/FindWishlistDialog.tsx`.
    - [ ] Implement search logic (handling URL vs Name).
    - [ ] Add "Follow" action to search results.
    - [ ] Add Unit Tests: `FindWishlistDialog.test.tsx`.

3.  **Components: Wishlist Dashboard**
    - [ ] Create `src/components/FollowedWishlistsPanel.tsx` (optional, or integration directly).
    - [ ] Update `WishlistDashboard.tsx` to render the followed list section.
    - [ ] Implement strict layout requirements: scrollable, multi-column.
    - [ ] Add "Recent" flag logic based on `updated_at`.

4.  **Integration & Testing**
    - [ ] Create E2E test `tests/follow-flow.spec.ts`:
        - User A creates list.
        - User B finds list by name.
        - User B follows list.
        - User B sees list on dashboard.
        - User B unfollows list.
