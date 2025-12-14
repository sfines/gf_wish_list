# Tasks for "Select Item Image" Feature

- [ ] **Backend:** Update Supabase edge function to scrape all `og:image` tags.
- [ ] **Backend:** Modify `items` table to store an array of image URLs (`image_urls`) and the selected image (`selected_image_url`).
- [ ] **Frontend:** Update `WishlistView.tsx` to display an image selector when `image_urls` contains more than one URL.
- [ ] **Frontend:** Implement the UI for the image selector (e.g., a carousel or thumbnail grid).
- [ ] **Frontend:** Add a function to call the API to update the `selected_image_url` for an item.
- [ ] **Backend:** Create an API endpoint to update the `selected_image_url`.
- [ ] **Testing:** Write tests for the new UI components and API endpoint.
