## ADDED Requirements

### Requirement: Item Image Display
The system SHALL display images for wishlist items when an OG image URL is available.

#### Scenario: Item with valid OG image displays correctly
- **WHEN** a wishlist item has an ogImageUrl property set
- **THEN** the item MUST display an image container with the specified image
- **AND** the image container MUST have a fixed size (20x20 on mobile, 24x24 on desktop)
- **AND** the image MUST be scaled to cover the container while maintaining aspect ratio

#### Scenario: Item without OG image displays without image container
- **WHEN** a wishlist item does not have an ogImageUrl property
- **THEN** the item MUST NOT display an image container
- **AND** the item content MUST still display title, description, and URL properly

### Requirement: Item Image Error Handling
The system SHALL gracefully handle image loading failures for wishlist items.

#### Scenario: Image fails to load
- **WHEN** an item's ogImageUrl fails to load (network error, 404, invalid URL)
- **THEN** the image element MUST be hidden
- **AND** the item MUST remain functional with title, description, and URL visible
- **AND** an error MUST be logged to the console for debugging

### Requirement: Item Image Accessibility
The system SHALL ensure images on wishlist items are accessible.

#### Scenario: Image has appropriate alt text
- **WHEN** an item displays an OG image
- **THEN** the image MUST have an alt attribute
- **AND** the alt text MUST be the item title if available
- **AND** the alt text MUST fallback to "Item preview" if no title is set
