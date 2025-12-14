---
title: Allow User to Select Item Image
status: draft
---

# Proposal: Allow User to Select Item Image

## 1. Overview

This proposal outlines a new feature allowing users to select a preferred image for a wishlist item when multiple images are available. Currently, the system automatically selects the first OpenGraph image found, which may not always be the user's desired image.

## 2. Problem Statement

When a user adds an item from a URL, the system's behavior for fetching images varies. For Amazon product URLs, it queries the `realtime-amazon-data` RapidAPI endpoint, which can return multiple product images. For all other URLs, it scrapes OpenGraph (OG) metadata to find `og:image` tags. In both scenarios, the current implementation arbitrarily selects the first image found, which may not be the one the user prefers. Users have no way to choose a different image if the automatically selected one is not ideal (e.g., wrong color, different product variant).

## 3. Proposed Solution

- When fetching item metadata, the server will retrieve all available images. For Amazon URLs, this means processing the full response from the `realtime-amazon-data` RapidAPI. For other URLs, it will retrieve all `og:image` tags.
- The list of image URLs will be stored with the wishlist item.
- The UI will be updated to display a carousel or a grid of image thumbnails if more than one image is available for an item.
- The user will be able to click on a thumbnail to select it as the primary display image for that item.
- The user's selection will be saved to the database.

## 4. Scope

### In Scope

- Modifying the server-side function to fetch and store all `og:image` URLs.
- Updating the `items` table schema to store an array of image URLs and the selected image URL.
- Creating a UI component (e.g., an image selector or carousel) to display multiple images.
- Implementing the logic to update the selected image in the database.

### Out of Scope

- Support for images other than those specified in `og:image` tags.
- Image uploading capabilities.
- Advanced image editing or cropping.

## 5. Risks and Mitigations

- **Risk:** Performance degradation from storing and loading multiple images.
  - **Mitigation:** Implement lazy loading for images. Only load the selected image by default and load thumbnails on demand.
- **Risk:** UI complexity.
  - **Mitigation:** Design a simple and intuitive image selector that is only visible when multiple images are present.

## 6. Alternatives Considered

- **Do nothing:** This maintains the current simple implementation but doesn't solve the user problem.
- **Manual Image URL entry:** Allow users to paste an image URL. This is more flexible but less user-friendly than selecting from available options.

## 7. Stakeholders

- **Development:** Will implement the changes.
- **Users:** Will benefit from the new feature.
