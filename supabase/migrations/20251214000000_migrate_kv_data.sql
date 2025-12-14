DO $$
DECLARE
    r RECORD;
    w_id UUID;
    w_user_id UUID;
    w_name TEXT;
    w_desc TEXT;
    w_created_at TIMESTAMPTZ;
    item JSONB;
BEGIN
    FOR r IN SELECT * FROM kv_store_a8f4bfaf WHERE key LIKE 'wishlist%'
    LOOP
        -- Extract Wishlist Data
        
        -- Try to get ID from JSON value; if null, use the key or generate new.
        -- Assuming key might be "wishlist:<uuid>". Let's try to parse the UUID from the key if value->id is null.
        w_id := COALESCE((r.value->>'id')::UUID, gen_random_uuid());
        
        -- Try to get user_id.
        w_user_id := (r.value->>'user_id')::UUID;
        IF w_user_id IS NULL THEN
             w_user_id := (r.value->>'userId')::UUID;
        END IF;

        w_name := r.value->>'name';
        w_desc := r.value->>'description';
        w_created_at := (r.value->>'created_at')::TIMESTAMPTZ;

        -- Validate required fields
        IF w_user_id IS NOT NULL AND w_name IS NOT NULL THEN
            -- Insert Wishlist (Upsert to avoid duplicates)
            INSERT INTO public.wishlists (id, user_id, name, description, created_at)
            VALUES (w_id, w_user_id, w_name, w_desc, COALESCE(w_created_at, NOW()))
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description;

            -- Handle Items
            -- Check if 'items' exists and is an array
            IF r.value->'items' IS NOT NULL AND jsonb_typeof(r.value->'items') = 'array' THEN
                FOR item IN SELECT * FROM jsonb_array_elements(r.value->'items')
                LOOP
                    INSERT INTO public.items (
                        wishlist_id, 
                        title, 
                        description, 
                        url, 
                        image_url, 
                        claimed,
                        created_at
                    )
                    VALUES (
                        w_id,
                        item->>'title',
                        item->>'description',
                        item->>'url',
                        item->>'image_url',
                        COALESCE((item->>'claimed')::BOOLEAN, FALSE),
                        COALESCE((item->>'created_at')::TIMESTAMPTZ, NOW())
                    );
                    -- Note: image_urls array handling omitted for simplicity unless requested, 
                    -- or can be added if item->'image_urls' structure is known.
                END LOOP;
            END IF;
        END IF;
    END LOOP;
END $$;
