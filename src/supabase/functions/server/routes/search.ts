import { corsHeaders } from "../../_shared/cors.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function handleSearch(req: Request, path: string, supabaseClient: SupabaseClient) {
    // POST /wishlists/search
    if (req.method === "POST" && path === "/wishlists/search") {
        const { query } = await req.json();
        const { data: userData, error: userError } = await supabaseClient.auth.getUser();
        if (userError) throw userError;

        const { data, error } = await supabaseClient
            .from("wishlists")
            .select("id, name, description, owner_name, share_token, items(count)")
            .or(`owner_name.ilike.%${query}%,share_token.eq.${query}`)
            .neq("user_id", userData.user.id) // Exclude own wishlists
            .limit(20);

        if (error) throw error;

        // Check following status for each result
        const resultsWithStatus = await Promise.all(
            (data || []).map(async (wishlist: any) => {
                const { data: followData } = await supabaseClient
                    .from("wishlist_followers")
                    .select("id")
                    .eq("wishlist_id", wishlist.id)
                    .eq("user_id", userData.user.id)
                    .maybeSingle();

                return {
                    ...wishlist,
                    isFollowing: !!followData
                };
            })
        );

        return new Response(JSON.stringify({ results: resultsWithStatus }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    }
}
