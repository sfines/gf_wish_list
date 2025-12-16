-- Add owner_name column to wishlists table to support search and display
ALTER TABLE wishlists 
ADD COLUMN IF NOT EXISTS owner_name TEXT;

COMMENT ON COLUMN wishlists.owner_name IS 'Cached full name of the wishlist owner for search and display purposes';

-- Update get_all_wishlists to include owner_name
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
                    'owner_name', w.owner_name,
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
                    'owner_name', w.owner_name,
                    'shareToken', w.share_token,
                    'items', COALESCE(
                            (
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
                            ),
                            '[]'::json
                        )
                )
            )
            FROM wishlists w
            JOIN wishlist_followers wf ON w.id = wf.wishlist_id
            WHERE wf.user_id = auth.uid()
        ) AS following;
END;
$$ LANGUAGE plpgsql;
