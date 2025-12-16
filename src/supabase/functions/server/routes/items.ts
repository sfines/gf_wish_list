import { corsHeaders } from "../../_shared/cors.ts";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export async function handleItems(req: Request, path: string, supabaseClient: SupabaseClient) {
    // POST /wishlists/:id/items
    const itemsMatch = path.match(/^\/wishlists\/([^/]+)\/items$/);
    if (req.method === "POST" && itemsMatch) {
        const wishlistId = itemsMatch[1];
        const body = await req.json();
        console.log("POST /items body:", JSON.stringify(body));
        const {
            url: itemUrl,
            description,
            title,
            ogImageUrl,
            image_urls,
        } = body;

        const { data, error } = await supabaseClient
            .from("items")
            .insert({
                wishlist_id: wishlistId,
                url: itemUrl,
                title: title || "New Item",
                description,
                image_url: ogImageUrl,
                image_urls: image_urls,
            })
            .select()
            .single();

        console.log("POST /items result:", JSON.stringify(data));
        if (error) console.error("POST /items error:", error);

        if (error) throw error;
        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    }

    // DELETE /wishlists/:id/items/:itemId
    const itemMatch = path.match(/^\/wishlists\/([^/]+)\/items\/([^/]+)$/);
    if (req.method === "DELETE" && itemMatch) {
        const itemId = itemMatch[2];
        const { error } = await supabaseClient
            .from("items")
            .delete()
            .eq("id", itemId);

        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    }

    // PATCH /wishlists/:id/items/:itemId
    if (req.method === "PATCH" && itemMatch) {
        const itemId = itemMatch[2];
        const {
            title,
            url: itemUrl,
            description,
            ogImageUrl,
            image_urls,
        } = await req.json();

        const updates: any = {};
        if (title !== undefined) updates.title = title;
        if (itemUrl !== undefined) updates.url = itemUrl;
        if (description !== undefined) updates.description = description;
        if (ogImageUrl !== undefined) updates.image_url = ogImageUrl;
        if (image_urls !== undefined) updates.image_urls = image_urls;

        const { data, error } = await supabaseClient
            .from("items")
            .update(updates)
            .eq("id", itemId)
            .select()
            .single();

        if (error) throw error;
        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    }

    // PATCH /wishlists/:id/items/:itemId/claim
    const claimMatch = path.match(
        /^\/wishlists\/([^/]+)\/items\/([^/]+)\/claim$/
    );
    if (req.method === "PATCH" && claimMatch) {
        const itemId = claimMatch[2];
        const { claimed } = await req.json();

        const { data: userData, error: userError } =
            await supabaseClient.auth.getUser();

        let claimedBy = null;
        if (!userError && userData.user) {
            claimedBy = userData.user.id;
        }

        const updates = {
            purchased: claimed,
            purchased_by: claimed ? claimedBy : null,
        };

        const { data, error } = await supabaseClient
            .from("items")
            .update(updates)
            .eq("id", itemId)
            .select()
            .single();

        if (error) throw error;
        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    }

    // PATCH /wishlists/:id/items/:itemId/image
    const imageMatch = path.match(
        /^\/wishlists\/([^/]+)\/items\/([^/]+)\/image$/
    );
    if (req.method === "PATCH" && imageMatch) {
        const wishlistId = imageMatch[1];
        const itemId = imageMatch[2];
        const { imageUrl } = await req.json();

        const { error: updateError } = await supabaseClient
            .from("items")
            .update({ image_url: imageUrl })
            .eq("id", itemId);

        if (updateError) throw updateError;

        // Fetch updated wishlist to return
        const { data: wishlist, error: fetchError } = await supabaseClient
            .from("wishlists")
            .select("*, items(*)")
            .eq("id", wishlistId)
            .single();

        if (fetchError) throw fetchError;

        return new Response(JSON.stringify({ wishlist }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    }
}
