-- migrations/follow-wishlist.sql

-- Create a table to track followers
CREATE TABLE IF NOT EXISTS wishlist_followers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wishlist_id UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(wishlist_id, user_id)
);

-- Enable RLS
ALTER TABLE wishlist_followers ENABLE ROW LEVEL SECURITY;

-- Policies for wishlist_followers
CREATE POLICY "Users can follow a wishlist"
ON wishlist_followers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow a wishlist"
ON wishlist_followers
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can see who follows a wishlist"
ON wishlist_followers
FOR SELECT
USING (true);

-- Allow users to select wishlists they are following (Moved from 01_add_wishlist_rls.sql)
CREATE POLICY "Users can view wishlists they follow"
ON public.wishlists
FOR SELECT
USING (
  id IN (
    SELECT wishlist_id FROM public.wishlist_followers WHERE user_id = auth.uid()
  )
);


-- Function to follow a wishlist
CREATE OR REPLACE FUNCTION follow_wishlist(p_wishlist_id UUID)
RETURNS void AS $$
BEGIN
    INSERT INTO wishlist_followers (wishlist_id, user_id)
    VALUES (p_wishlist_id, auth.uid());
END;
$$ LANGUAGE plpgsql;

-- Function to unfollow a wishlist
CREATE OR REPLACE FUNCTION unfollow_wishlist(p_wishlist_id UUID)
RETURNS void AS $$
BEGIN
    DELETE FROM wishlist_followers
    WHERE wishlist_id = p_wishlist_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql;

-- Function to check if a user is following a wishlist
CREATE OR REPLACE FUNCTION get_following_status(p_wishlist_id UUID)
RETURNS TABLE(is_following BOOLEAN) AS $$
BEGIN
    RETURN QUERY
    SELECT EXISTS (
        SELECT 1
        FROM wishlist_followers
        WHERE wishlist_id = p_wishlist_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get all wishlists for a user (owned and followed)
CREATE OR REPLACE FUNCTION get_all_wishlists()
RETURNS TABLE(wishlists JSON, following JSON) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (
            SELECT json_agg(
                json_build_object(
                    'id', w.id,
                    'name', w.name,
                    'description', w.description,
                    'shareToken', w.share_token,
                    'createdAt', w.created_at,
                    'items', (
                        SELECT json_agg(
                            json_build_object(
                                'id', i.id,
                                'title', i.title,
                                'url', i.url,
                                'description', i.description,
                                'addedAt', i.created_at,
                                'claimed', i.claimed,
                                'image_url', i.image_url,
                                'image_urls', i.image_urls
                            )
                        )
                        FROM items i
                        WHERE i.wishlist_id = w.id
                    )
                )
            )
            FROM wishlists w
            WHERE w.user_id = auth.uid()
        ) AS wishlists,
        (
            SELECT json_agg(
                json_build_object(
                    'id', w.id,
                    'name', w.name,
                    'description', w.description,
                    'shareToken', w.share_token,
                    'createdAt', w.created_at,
                    'items', (
                        SELECT json_agg(
                            json_build_object(
                                'id', i.id,
                                'title', i.title,
                                'url', i.url,
                                'description', i.description,
                                'addedAt', i.created_at,
                                'claimed', i.claimed,
                                'image_url', i.image_url,
                                'image_urls', i.image_urls
                            )
                        )
                        FROM items i
                        WHERE i.wishlist_id = w.id
                    )
                )
            )
            FROM wishlists w
            JOIN wishlist_followers wf ON w.id = wf.wishlist_id
            WHERE wf.user_id = auth.uid()
        ) AS following;
END;
$$ LANGUAGE plpgsql;
