-- supabase/migrations/20251207000001_add_wishlist_rls.sql

-- Drop existing policies if they exist, to ensure a clean slate
DROP POLICY IF EXISTS "Users can view their own wishlists" ON public.wishlists;
DROP POLICY IF EXISTS "Users can view wishlists they follow" ON public.wishlists;
DROP POLICY IF EXISTS "Users can create wishlists" ON public.wishlists;
DROP POLICY IF EXISTS "Users can update their own wishlists" ON public.wishlists;
DROP POLICY IF EXISTS "Users can delete their own wishlists" ON public.wishlists;
DROP POLICY IF EXISTS "Public can view shared wishlists" ON public.wishlists;

-- Enable RLS on wishlists table
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Allow users to select their own wishlists
CREATE POLICY "Users can view their own wishlists"
ON public.wishlists
FOR SELECT
USING (auth.uid() = user_id);

-- Allow users to insert their own wishlists
CREATE POLICY "Users can create wishlists"
ON public.wishlists
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own wishlists
CREATE POLICY "Users can update their own wishlists"
ON public.wishlists
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own wishlists
CREATE POLICY "Users can delete their own wishlists"
ON public.wishlists
FOR DELETE
USING (auth.uid() = user_id);

-- Allow public access to wishlists via a share token
CREATE POLICY "Public can view shared wishlists"
ON public.wishlists
FOR SELECT
USING (share_token IS NOT NULL);
