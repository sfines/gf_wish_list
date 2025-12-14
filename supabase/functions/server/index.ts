import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

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

    // --- Routes ---

    // POST /signup
    if (req.method === "POST" && path === "/signup") {
      const { email, password, name } = await req.json();
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) throw error;
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // GET /wishlists
    if (req.method === "GET" && path === "/wishlists") {
      // Get user's wishlists
      const { data: userData, error: userError } =
        await supabaseClient.auth.getUser();
      if (userError) throw userError;

      const { data: wishlists, error: wishlistsError } = await supabaseClient
        .from("wishlists")
        .select("*, items(*)")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (wishlistsError) throw wishlistsError;

      // Get followed wishlists
      let following: any[] = [];

      if (userData.user) {
        const { data: followingData, error: followingError } =
          await supabaseClient
            .from("wishlist_followers")
            .select("wishlist_id, wishlists(*, items(*))")
            .eq("user_id", userData.user.id);

        if (!followingError && followingData) {
          following = followingData
            .map((f: any) => f.wishlists)
            .filter(Boolean);
        }
      }

      return new Response(JSON.stringify({ wishlists, following }), {
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

    throw new Error("Not Found");
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
