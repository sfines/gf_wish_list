-- Add the new image_urls column
ALTER TABLE items
ADD COLUMN image_urls text[];

-- Populate image_urls with the existing image_url for old items
UPDATE items
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL;
