import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";
import { handleAuth } from "./routes/auth.ts";
import { handleSearch } from "./routes/search.ts";
import { handleWishlists } from "./routes/wishlists.ts";
import { handleItems } from "./routes/items.ts";

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const url = new URL(req.url);
        console.log("Request URL:", req.url);
        console.log("Request Pathname:", url.pathname);

        // Handle both local and deployed paths
        let path = url.pathname.replace("/functions/v1/server", "");
        // Handle local docker internal routing where path starts with /server
        if (path.startsWith("/server")) {
            path = path.replace("/server", "");
        }
        console.log("Resolved Path:", path);

        const supabaseUrl =
            Deno.env.get("SUPABASE_URL") ?? Deno.env.get("MY_SUPABASE_URL") ?? "";
        const supabaseAnonKey =
            Deno.env.get("SUPABASE_ANON_KEY") ??
            Deno.env.get("MY_SUPABASE_ANON_KEY") ??
            "";

        // Client for auth context (using user's token)
        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: { Authorization: req.headers.get("Authorization")! },
            },
        });

        // --- Dispatch to Route Handlers ---

        // Auth Routes
        const authResponse = await handleAuth(req, path, supabaseClient);
        if (authResponse) return authResponse;

        // Search Routes
        const searchResponse = await handleSearch(req, path, supabaseClient);
        if (searchResponse) return searchResponse;

        // Wishlist Routes (Follow routes are inside here too)
        const wishlistResponse = await handleWishlists(req, path, supabaseClient);
        if (wishlistResponse) return wishlistResponse;

        // Items Routes
        const itemResponse = await handleItems(req, path, supabaseClient);
        if (itemResponse) return itemResponse;

        throw new Error("Not Found");
    } catch (error: any) {
        console.error("Unhandled error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
        });
    }
});
