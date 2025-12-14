-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    share_token TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    url TEXT,
    image_url TEXT,
    image_urls TEXT[],
    claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Items Policies

-- View items: Owner or Shared or Follower
CREATE POLICY "Users can view items"
ON items FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM wishlists
        WHERE wishlists.id = items.wishlist_id
        AND (
            wishlists.user_id = auth.uid() -- Owner
            OR wishlists.share_token IS NOT NULL -- Shared (Public)
            -- Follower check will be added in follow migration or here if possible
        )
    )
);

-- Insert items: Owner only
CREATE POLICY "Users can insert items"
ON items FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM wishlists
        WHERE wishlists.id = items.wishlist_id
        AND wishlists.user_id = auth.uid()
    )
);

-- Update items: Owner only (except claimed status, which might need public access?)
-- For now, let's restrict to owner. Claiming might be a separate thing or need a specific policy.
CREATE POLICY "Users can update items"
ON items FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM wishlists
        WHERE wishlists.id = items.wishlist_id
        AND wishlists.user_id = auth.uid()
    )
);

-- Delete items: Owner only
CREATE POLICY "Users can delete items"
ON items FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM wishlists
        WHERE wishlists.id = items.wishlist_id
        AND wishlists.user_id = auth.uid()
    )
);
