-- Backfill owner_name for existing wishlists
-- Note: Accessing auth.users directly might fail if permissions are restricted.
-- If this fails, we will need to use an Edge Function or run this as a superuser.

DO $$
BEGIN
    -- Check if we can access auth.users
    IF EXISTS (SELECT 1 FROM pg_catalog.pg_tables WHERE schemaname = 'auth' AND tablename = 'users') THEN
        UPDATE public.wishlists w
        SET owner_name = u.raw_user_meta_data->>'full_name'
        FROM auth.users u
        WHERE w.user_id = u.id
        AND w.owner_name IS NULL;
    END IF;
END $$;
