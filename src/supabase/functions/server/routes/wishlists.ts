import { corsHeaders } from "../../_shared/cors.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function handleWishlists(req: Request, path: string, supabaseClient: SupabaseClient) {
    // GET /wishlists
    if (req.method === "GET" && path === "/wishlists") {
        const { data: userData, error: userError } =
            await supabaseClient.auth.getUser();
        if (userError) throw userError;

        const { data, error } = await supabaseClient.rpc('get_all_wishlists');

        if (error) throw error;

        // Function returns single row with two JSON columns
        const result = Array.isArray(data) ? data[0] : data;

        return new Response(JSON.stringify({
            wishlists: result?.wishlists || [],
            following: result?.following || []
        }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    }

    // POST /wishlists
    if (req.method === "POST" && path === "/wishlists") {
        const { name, description } = await req.json();
        const { data: userData, error: userError } =
            await supabaseClient.auth.getUser();
        if (userError) throw userError;

        const { data, error } = await supabaseClient
            .from("wishlists")
            .insert({
                name,
                description,
                user_id: userData.user.id,
                share_token: crypto.randomUUID(),
                owner_name: userData.user.user_metadata.full_name
            })
            .select()
            .single();

        if (error) throw error;
        return new Response(JSON.stringify({ ...data, items: [] }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    }

    // GET /wishlists/shared/:token
    const sharedMatch = path.match(/^\/wishlists\/shared\/([^/]+)$/);
    if (req.method === "GET" && sharedMatch) {
        const token = sharedMatch[1];
        const { data, error } = await supabaseClient
            .from("wishlists")
            .select("*, items(*)")
            .eq("share_token", token)
            .single();

        if (error) throw error;
        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    }

    // GET /wishlists/:id
    const wishlistMatch = path.match(/^\/wishlists\/([^/]+)$/);
    if (req.method === "GET" && wishlistMatch) {
        const id = wishlistMatch[1];
        const { data, error } = await supabaseClient
            .from("wishlists")
            .select("*, items(*)")
            .eq("id", id)
            .single();

        if (error) throw error;
        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    }

    // DELETE /wishlists/:id
    if (req.method === "DELETE" && wishlistMatch) {
        const id = wishlistMatch[1];
        const { error } = await supabaseClient
            .from("wishlists")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    }

    // PATCH /wishlists/:id
    if (req.method === "PATCH" && wishlistMatch) {
        const id = wishlistMatch[1];
        const updates = await req.json();
        const { data, error } = await supabaseClient
            .from("wishlists")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    }

    // POST /wishlists/:id/follow
    const followMatch = path.match(/^\/wishlists\/([^/]+)\/follow$/);
    if (req.method === "POST" && followMatch) {
        const wishlistId = followMatch[1];
        const { data: userData, error: userError } =
            await supabaseClient.auth.getUser();
        if (userError) throw userError;

        const { data, error } = await supabaseClient
            .from("wishlist_followers")
            .insert({
                wishlist_id: wishlistId,
                user_id: userData.user.id,
            })
            .select()
            .single();

        if (error) throw error;
        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    }

    // DELETE /wishlists/:id/follow
    if (req.method === "DELETE" && followMatch) {
        const wishlistId = followMatch[1];
        const { data: userData, error: userError } =
            await supabaseClient.auth.getUser();
        if (userError) throw userError;

        const { error } = await supabaseClient
            .from("wishlist_followers")
            .delete()
            .eq("wishlist_id", wishlistId)
            .eq("user_id", userData.user.id);

        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    }

    // GET /wishlists/:id/follow
    if (req.method === "GET" && followMatch) {
        const wishlistId = followMatch[1];
        const { data: userData, error: userError } =
            await supabaseClient.auth.getUser();
        if (userError) throw userError;

        const { data, error } = await supabaseClient
            .from("wishlist_followers")
            .select("*")
            .eq("wishlist_id", wishlistId)
            .eq("user_id", userData.user.id)
            .maybeSingle();

        if (error) throw error;
        return new Response(JSON.stringify({ is_following: !!data }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    }
}
